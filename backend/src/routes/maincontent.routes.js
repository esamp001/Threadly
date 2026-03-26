const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const moment = require('moment');
const { checkAuth } = require('../middleware/checkAuth');
const { formatRelativeTime } = require('../utils/timeHelpers');

// GET - List all spaces with pagination
router.get('/all_spaces', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Get the spaces for current page
    const spaces = await knex('spaces')
      .select('id', 'space_name', 'avatar_url')
      .where('is_active', true)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count for pagination info
    const totalCount = await knex('spaces')
      .where('is_active', true)
      .count('* as count')
      .first();

    const hasMore = (offset + spaces.length) < totalCount.count;

    res.json({
      success: true,
      spaces,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalCount: totalCount.count,
        hasMore,
        totalPages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/all_threads', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  let threads = []

  try {
    // Get the threads for current page with user votes and comment count
    threads = await knex('threads')
      .join('spaces', 'threads.space_id', 'spaces.id')
      .leftJoin('users', 'threads.created_by', 'users.id')
      .leftJoin('scores', function () {
        this.on('threads.id', '=', 'scores.thread_id')
          .andOn('scores.user_id', '=', 1)
      })
      .leftJoin('comments', 'threads.id', 'comments.thread_id')
      .select('threads.id',
        'threads.title',
        'threads.content',
        'threads.space_id',
        'threads.created_by',
        'users.username',
        'users.avatar_url as user_avatar_url',
        'threads.created_at',
        'threads.updated_at',
        'threads.upvotes',
        'threads.shares',
        'threads.net_score',
        'spaces.space_name',
        'spaces.avatar_url',
        'spaces.space_name',
        'scores.vote_type as userVote')
      .count('comments.id as comment_count')
      .groupBy(
        'threads.id',
        'threads.title',
        'threads.content',
        'threads.space_id',
        'threads.created_by',
        'users.username',
        'users.avatar_url',
        'threads.created_at',
        'threads.updated_at',
        'threads.upvotes',
        'threads.shares',
        'threads.net_score',
        'spaces.space_name',
        'spaces.avatar_url',
        'spaces.space_name',
        'scores.vote_type'
      )
      .orderBy('threads.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count for pagination info
    const totalCount = await knex('threads')
      .count('* as count')
      .first();

    const threadsWithTimeAgo = threads.map(thread => ({
      ...thread,
      timeAgo: formatRelativeTime(thread.created_at),
      comments: parseInt(thread.comment_count) || 0  // Use actual comment count
    }));

    const hasMore = (offset + threads.length) < totalCount.count;

    res.json({
      success: true,
      threads: threadsWithTimeAgo,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalCount: totalCount.count,
        hasMore,
        totalPages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get thread by ID
router.get('/thread/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const thread = await knex('threads AS ts')
      .leftJoin('users AS u', 'u.id', 'ts.created_by')
      .leftJoin('spaces AS spc', 'spc.id', 'ts.space_id')
      .select(
        'u.id AS user_id',
        'u.avatar_url',
        'u.username',
        'ts.id AS thread_id',
        'ts.title',
        'ts.content',
        'ts.upvotes',
        'ts.downvotes',
        'ts.created_at',
        'spc.space_name',
        'spc.avatar_url AS space_avatar_url'
      )
      .where('ts.id', id)
      .first();

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    const threadWithTimeAgo = {
      ...thread,
      timeAgo: formatRelativeTime(thread.created_at)
    };

    res.json({
      success: true,
      thread: threadWithTimeAgo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/create_thread', checkAuth, async (req, res) => {
  const { title, content, spaceId } = req.body;
  const userId = req.user.userId;

  let status = 200
  let error_message = ''
  let success = true
  let threadWithSpace = []

  try {
    const thread = await knex('threads')
      .insert({
        title,
        content,
        space_id: spaceId,
        created_by: userId
      })
      .returning('*');

    // Return Thread with spaces and user data
    threadWithSpace = await knex('threads')
      .join('spaces', 'threads.space_id', 'spaces.id')
      .leftJoin('users', 'threads.created_by', 'users.id')
      .select(
        'threads.*',
        'spaces.space_name',
        'spaces.avatar_url as space_avatar_url',
        'users.username',
        'users.avatar_url as user_avatar_url'
      )
      .where('threads.id', thread[0].id)
      .first();

  } catch (error) {
    console.error('Error creating thread:', error);
    status = 500
    error_message = error.message
    success = false
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      thread: threadWithSpace
    });
  }

});

router.post('/threads/vote', checkAuth, async (req, res) => {
  const { threadId, voteType } = req.body;
  // const userId = req.user.id; // from auth middleware

  const numericVote = voteType === 'upvote' ? 1 : -1;

  let updatedThread;

  try {
    await knex.transaction(async (trx) => {

      const existingVote = await trx('scores')
        .where({ user_id: 1, thread_id: threadId })
        .first();

      // Case 1: No previous vote
      if (!existingVote) {

        await trx('scores').insert({
          user_id: 1,
          thread_id: threadId,
          vote_type: numericVote
        });

        await trx('threads')
          .where({ id: threadId })
          .increment(numericVote === 1 ? 'upvotes' : 'downvotes', 1)
          .increment('net_score', numericVote);

      }

      // Case 2: Same vote clicked again → remove vote
      else if (existingVote.vote_type === numericVote) {

        await trx('scores')
          .where({ user_id: 1, thread_id: threadId })
          .delete();

        await trx('threads')
          .where({ id: threadId })
          .decrement(numericVote === 1 ? 'upvotes' : 'downvotes', 1)
          .decrement('net_score', numericVote);

      }

      // Case 3: Switching vote
      else {
        await trx('scores')
          .where({ user_id: 1, thread_id: threadId })
          .update({ vote_type: numericVote });

        await trx('threads')
          .where({ id: threadId })
          .increment(numericVote === 1 ? 'upvotes' : 'downvotes', 1)
          .decrement(numericVote === 1 ? 'downvotes' : 'upvotes', 1)
          .increment('net_score', numericVote * 2);

      }

      updatedThread = await trx('threads')
        .where({ id: threadId })
        .first();
    });

    res.json({ success: true, updatedThread });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;