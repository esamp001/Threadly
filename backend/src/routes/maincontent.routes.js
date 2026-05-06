const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');
const moment = require('moment');
const { formatRelativeTime } = require('../utils/timeHelpers');
const { awardThreadCreated, awardExp } = require('../utils/expService');
const { calculateTrendingScore } = require('../utils/trendingHelpers');
const cache = require('../utils/cacheHelper');

// GET /api/maincontent/hot_spaces - Get hot spaces from last 24 hours
router.get('/hot_spaces', async (req, res) => {
  try {
    const twentyFourHoursAgo = moment().subtract(24, 'hours').format('YYYY-MM-DD HH:mm:ss');

    const hotSpaces = await knex('threads')
      .select(
        'spaces.id',
        'spaces.space_name',
        'spaces.space_slug',
        'spaces.avatar_url',
        knex.raw('COUNT(threads.id) as thread_count'),
        knex.raw('COALESCE(SUM((SELECT COUNT(*) FROM comments WHERE comments.thread_id = threads.id AND comments.is_active = true) * 2 + threads.net_score), 0) as activity_score')
      )
      .innerJoin('spaces', 'threads.space_id', 'spaces.id')
      .where('threads.is_active', true)
      .where('threads.created_at', '>=', twentyFourHoursAgo)
      .groupBy('spaces.id', 'spaces.space_name', 'spaces.space_slug', 'spaces.avatar_url')
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
        'threads.net_score',
        'threads.created_at',
        'spaces.space_name',
        'spaces.avatar_url',
        'users.username as author_username',
        knex.raw('(SELECT COUNT(*) FROM comments WHERE comments.thread_id = threads.id AND comments.is_active = true) as comment_count')
      )
      .leftJoin('spaces', 'threads.space_id', 'spaces.id')
      .leftJoin('users', 'threads.created_by', 'users.id')
      .where('threads.is_active', true)
      .where('threads.created_at', '>=', twentyFourHoursAgo)
      .orderByRaw('(comment_count * 2) + net_score DESC')
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
  const { page = 1, limit = 10, filter } = req.query;
  const offset = (page - 1) * limit;
  const userId = req.user?.userId;

  // Generate cache key
  const cacheKey = cache.generateKey(filter || 'latest', page, limit, userId);

  // Try to get from cache first
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return res.json(cachedResult);
  }

  let threads = []

  try {
    // Determine sorting order based on filter parameter
    let orderByClause = 'threads.created_at DESC'; // default to latest

    if (filter === 'hot') {
      orderByClause = '(SELECT COUNT(*) FROM comments WHERE comments.thread_id = threads.id AND comments.is_active = true) * 2 + threads.net_score DESC';
    } else if (filter === 'top') {
      orderByClause = 'threads.net_score DESC';
    } else if (filter === 'latest') {
      orderByClause = 'threads.created_at DESC';
    }

    // Get the threads for current page with user votes and comment count
    let baseQuery = knex('threads')
      .join('spaces', 'threads.space_id', 'spaces.id')
      .leftJoin('users', 'threads.created_by', 'users.id');

    // Add user-specific joins only if userId exists
    if (userId) {
      baseQuery = baseQuery
        .leftJoin('scores', function () {
          this.on('threads.id', '=', 'scores.thread_id')
            .andOn('scores.user_id', '=', knex.raw('?', [userId]))
        })
        .leftJoin('users as current_user', 'current_user.id', '=', knex.raw('?', [userId]));
    }

    const threadsData = await baseQuery
      .select(
        'threads.id',
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
        knex.raw('(SELECT COUNT(*) FROM comments WHERE comments.thread_id = threads.id AND comments.is_active = true) as comment_count'),
        'spaces.space_name',
        'spaces.avatar_url',
        userId ? 'scores.vote_type as userVote' : knex.raw('NULL as userVote'),
        userId ? 'current_user.avatar_url as current_user_avatar_url' : knex.raw('NULL as current_user_avatar_url')
      )
      .where('threads.is_active', true)
      .orderByRaw(orderByClause)
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
      comments: thread.comment_count || 0
    }));

    const hasMore = (offset + threads.length) < totalCount.count;

    const result = {
      success: true,
      threads: threadsWithTimeAgo,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalCount: totalCount.count,
        hasMore,
        totalPages: Math.ceil(totalCount.count / limit)
      }
    };

    // Cache the result (shorter TTL for hot filter, longer for others)
    const ttl = filter === 'hot' ? 2 * 60 * 1000 : 5 * 60 * 1000; // 2 min for hot, 5 min for others
    cache.set(cacheKey, result, ttl);

    res.json(result);
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
    await knex.transaction(async (trx) => {
      const thread = await trx('threads')
        .insert({
          title,
          content,
          space_id: spaceId,
          created_by: userId
        })
        .returning('*');

      // Validate thread creation was successful before awarding EXP
      if (!thread || !thread[0] || !thread[0].id) {
        throw new Error('Failed to create thread - no valid thread data returned');
      }

      // Award EXP for thread creation (only if thread was successfully created)
      const expResult = await awardThreadCreated(userId, thread[0].id, trx);
      if (!expResult.success) {
        console.warn('Failed to award EXP for thread creation:', expResult.error);
      }

      // Update space trending score after thread creation
      const space = await trx('spaces').where('id', spaceId).first();
      if (space) {
        const threadCountResult = await trx('threads')
          .where('space_id', spaceId)
          .count('* as count')
          .first();
        const threadCount = parseInt(threadCountResult.count) || 0;
        const newTrendingScore = calculateTrendingScore(space.member_count || 0, threadCount);

        await trx('spaces')
          .where('id', spaceId)
          .update({ trending_score: newTrendingScore });
      }

      // Update contributor points for the user in this space
      // +10 points for creating a post, +1 posts_count
      await trx('space_contributor_points')
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
      threadWithSpace = await trx('threads')
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
    });

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

        // Award EXP to thread author for receiving upvote
        if (numericVote === 1 && thread.created_by !== userId) {
          const expResult = await awardExp(thread.created_by, 'thread_upvote', threadId, trx);
          if (!expResult.success) {
            console.warn('Failed to award EXP for thread upvote:', expResult.error);
          }
        }

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

// GET /api/maincontent/joined_spaces - Get joined spaces
router.get('/joined_spaces', checkAuth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const joinedSpaces = await knex('spaces')
      .select(
        'spaces.id',
        'spaces.space_name',
        'spaces.avatar_url as space_avatar_url',
        'spaces.space_slug',
        'spaces.member_count',
        knex.raw('COALESCE(scp.points, 0) as user_contribution_points')
      )
      .join('space_members', 'space_members.space_id', 'spaces.id')
      .leftJoin('space_contributor_points as scp', function () {
        this.on('scp.space_id', '=', 'spaces.id')
          .andOn('scp.user_id', '=', knex.raw('?', [userId]));
      })
      .where('space_members.user_id', userId)
      .where('spaces.is_active', true)
      .orderBy('spaces.created_at', 'desc')
      .limit(6);


    const spacesWithTimeAgo = joinedSpaces.map(space => ({
      ...space,
      timeAgo: formatRelativeTime(space.created_at),
      userContributionPoints: space.user_contribution_points || 0
    }));

    res.json({
      success: true,
      spaces: spacesWithTimeAgo
    });
  } catch (error) {
    console.error('Failed to fetch joined spaces:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;