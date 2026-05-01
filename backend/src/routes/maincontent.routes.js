const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const moment = require('moment');
const { checkAuth } = require('../middleware/checkAuth');
const { formatRelativeTime } = require('../utils/timeHelpers');
const { calculateTrendingScore } = require('../utils/trendingHelpers');

// GET /api/maincontent/hot_spaces - Get hot spaces from last 24 hours
router.get('/hot_spaces', async (req, res) => {
  try {
    const twentyFourHoursAgo = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');

    const hotSpaces = await knex('threads')
      .select(
        'spaces.id',
        'spaces.space_name',
        'spaces.avatar_url',
        knex.raw('COUNT(threads.id) as thread_count'),
        knex.raw('COALESCE(SUM(threads.comments * 2 + threads.net_score), 0) as activity_score')
      )
      .innerJoin('spaces', 'threads.space_id', 'spaces.id')
      .where('threads.is_active', true)
      .where('threads.created_at', '>=', twentyFourHoursAgo)
      .groupBy('spaces.id', 'spaces.space_name', 'spaces.avatar_url')
      .orderByRaw('activity_score DESC')
      .limit(5);

    res.json({
      success: true,
      spaces: hotSpaces
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/maincontent/hot_threads - Get hot threads from last 24 hours
router.get('/hot_threads', async (req, res) => {
  try {
    const twentyFourHoursAgo = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');

    const hotThreads = await knex('threads')
      .select(
        'threads.id',
        'threads.title',
        'threads.space_id',
        'threads.created_by',
        'threads.comments',
        'threads.net_score',
        'threads.created_at',
        'spaces.space_name',
        'spaces.avatar_url',
        'users.username as author_username'
      )
      .leftJoin('spaces', 'threads.space_id', 'spaces.id')
      .leftJoin('users', 'threads.created_by', 'users.id')
      .where('threads.is_active', true)
      .where('threads.created_at', '>=', twentyFourHoursAgo)
      .orderByRaw('(comments * 2) + net_score DESC')
      .limit(5);

    res.json({
      success: true,
      threads: hotThreads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

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

router.get('/all_threads', checkAuth, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const userId = req.user?.userId;

  let threads = []

  try {
    // Get the threads for current page with user votes and comment count
    const threadsData = await knex('threads')
      .join('spaces', 'threads.space_id', 'spaces.id')
      .leftJoin('users', 'threads.created_by', 'users.id')
      .leftJoin('scores', function () {
        this.on('threads.id', '=', 'scores.thread_id')
          .andOn('scores.user_id', '=', knex.raw('?', [userId]))
      })
      .leftJoin('comments', 'threads.id', 'comments.thread_id')
      .leftJoin('users as current_user', 'current_user.id', '=', knex.raw('?', [userId]))  // Join current user
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
        'scores.vote_type as userVote',
        'current_user.avatar_url as current_user_avatar_url')  // Add current user avatar
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
        'scores.vote_type',
        'current_user.avatar_url'
      )
      .orderBy('threads.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    threads = threadsData.map(thread => ({
      ...thread,
      space_avatar_url: thread.avatar_url
    }));

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

    // Update space trending score after thread creation
    const space = await knex('spaces').where('id', spaceId).first();
    if (space) {
      const threadCountResult = await knex('threads')
        .where('space_id', spaceId)
        .count('* as count')
        .first();
      const threadCount = parseInt(threadCountResult.count) || 0;
      const newTrendingScore = calculateTrendingScore(space.member_count || 0, threadCount);

      await knex('spaces')
        .where('id', spaceId)
        .update({ trending_score: newTrendingScore });
    }

    // Update contributor points for the user in this space
    // +10 points for creating a post, +1 posts_count
    await knex('space_contributor_points')
      .insert({
        space_id: spaceId,
        user_id: userId,
        points: 10,
        posts_count: 1,
        comments_count: 0,
        upvotes_received: 0,
        updated_at: knex.fn.now()
      })
      .onConflict(['space_id', 'user_id'])
      .merge({
        points: knex.raw('space_contributor_points.points + 10'),
        posts_count: knex.raw('space_contributor_points.posts_count + 1'),
        updated_at: knex.fn.now()
      });

    // Return Thread with spaces and user data
    threadWithSpace = await knex('threads')
      .join('spaces', 'threads.space_id', 'spaces.id')
      .leftJoin('users', 'threads.created_by', 'users.id')
      .leftJoin('users as current_user', 'current_user.id', '=', knex.raw('?', [userId]))
      .select(
        'threads.*',
        'spaces.space_name',
        'spaces.avatar_url as space_avatar_url',
        'users.username',
        'users.avatar_url as user_avatar_url',
        'current_user.avatar_url as current_user_avatar_url'
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
  const userId = req.user.userId;

  const numericVote = voteType === 'upvote' ? 1 : -1;

  try {
    await knex.transaction(async (trx) => {
      // Get thread info for contributor points update
      const thread = await trx('threads').where('id', threadId).first();
      if (!thread) {
        throw new Error('Thread not found');
      }

      const existingVote = await trx('scores')
        .where({ user_id: userId, thread_id: threadId })
        .first();

      // Case 1: No previous vote
      if (!existingVote) {
        await trx('scores').insert({
          user_id: userId,
          thread_id: threadId,
          vote_type: numericVote
        });

        await trx('threads')
          .where({ id: threadId })
          .increment(numericVote === 1 ? 'upvotes' : 'downvotes', 1)
          .increment('net_score', numericVote);

        // Update contributor points for thread author if upvote
        // +2 points for receiving an upvote, +1 upvotes_received
        if (numericVote === 1 && thread.created_by !== userId) {
          await trx('space_contributor_points')
            .insert({
              space_id: thread.space_id,
              user_id: thread.created_by,
              points: 2,
              posts_count: 0,
              comments_count: 0,
              upvotes_received: 1,
              updated_at: trx.fn.now()
            })
            .onConflict(['space_id', 'user_id'])
            .merge({
              points: trx.raw('space_contributor_points.points + 2'),
              upvotes_received: trx.raw('space_contributor_points.upvotes_received + 1'),
              updated_at: trx.fn.now()
            });
        }
      }

      // Case 2: Same vote clicked again → remove vote
      else if (existingVote.vote_type === numericVote) {
        await trx('scores')
          .where({ user_id: userId, thread_id: threadId })
          .delete();

        await trx('threads')
          .where({ id: threadId })
          .decrement(numericVote === 1 ? 'upvotes' : 'downvotes', 1)
          .decrement('net_score', numericVote);

        // Decrement contributor points for thread author if removing upvote
        if (numericVote === 1 && thread.created_by !== userId) {
          await trx('space_contributor_points')
            .where({ space_id: thread.space_id, user_id: thread.created_by })
            .decrement('points', 2)
            .decrement('upvotes_received', 1);
        }
      }

      // Case 3: Switching vote
      else {
        await trx('scores')
          .where({ user_id: userId, thread_id: threadId })
          .update({ vote_type: numericVote });

        await trx('threads')
          .where({ id: threadId })
          .increment(numericVote === 1 ? 'upvotes' : 'downvotes', 1)
          .decrement(numericVote === 1 ? 'downvotes' : 'upvotes', 1)
          .increment('net_score', numericVote * 2);

        // Update contributor points for thread author when switching votes
        if (thread.created_by !== userId) {
          if (numericVote === 1) {
            // Switching from downvote to upvote: +4 points total (+2 for new upvote, +2 to reverse downvote penalty)
            await trx('space_contributor_points')
              .insert({
                space_id: thread.space_id,
                user_id: thread.created_by,
                points: 4,
                posts_count: 0,
                comments_count: 0,
                upvotes_received: 1,
                updated_at: trx.fn.now()
              })
              .onConflict(['space_id', 'user_id'])
              .merge({
                points: trx.raw('space_contributor_points.points + 4'),
                upvotes_received: trx.raw('space_contributor_points.upvotes_received + 1'),
                updated_at: trx.fn.now()
              });
          } else {
            // Switching from upvote to downvote: -4 points total (-2 to remove upvote, -2 for downvote penalty)
            await trx('space_contributor_points')
              .where({ space_id: thread.space_id, user_id: thread.created_by })
              .decrement('points', 4)
              .decrement('upvotes_received', 1);
          }
        }
      }
    });

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;