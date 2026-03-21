const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const moment = require('moment');
const { checkAuth } = require('../middleware/checkAuth');

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
    // Get the threads for current page with user votes
    threads = await knex('threads')
      .join('spaces', 'threads.space_id', 'spaces.id')
      .leftJoin('scores', function () {
        this.on('threads.id', '=', 'scores.thread_id')
          .andOn('scores.user_id', '=', 1) // Using hardcoded user ID for now
      })
      .select('threads.id',
        'threads.title',
        'threads.content',
        'threads.space_id',
        'threads.created_by',
        'threads.created_at',
        'threads.updated_at',
        'threads.upvotes',
        'threads.comments',
        'threads.shares',
        'threads.net_score',
        'spaces.space_name',
        'spaces.avatar_url',
        'spaces.space_name',
        'scores.vote_type as userVote')
      .orderBy('threads.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count for pagination info
    const totalCount = await knex('threads')
      .count('* as count')
      .first();

    const threadsWithTimeAgo = threads.map(thread => {
      const now = moment();
      const createdAt = moment(thread.created_at);
      const diffMinutes = now.diff(createdAt, 'minutes');

      let timeAgo;
      if (diffMinutes < 1) {
        timeAgo = 'Just now';
      } else if (diffMinutes < 60) {
        timeAgo = `${diffMinutes}min ago`;
      } else if (diffMinutes < 1440) { // Less than 24 hours
        timeAgo = `${Math.floor(diffMinutes / 60)}hr ago`;
      } else {
        timeAgo = createdAt.format('MMM DD');
      }

      return {
        ...thread,
        timeAgo
      };
    });

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

    // Return Thread with spaces
    threadWithSpace = await knex('threads')
      .join('spaces', 'threads.space_id', 'spaces.id')
      .select('threads.*', 'spaces.space_name', 'spaces.avatar_url')
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