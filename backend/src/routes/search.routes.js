const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const moment = require('moment');
const { checkAuth } = require('../middleware/checkAuth');
const { formatRelativeTime } = require('../utils/timeHelpers');

// GET - Search spaces
router.get('/spaces', async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const query = knex('spaces')
      .select('id', 'space_name', 'avatar_url', 'member_count', 'space_description')
      .where('is_active', true);

    // Add search filter if search term is provided
    if (search) {
      query.where(function() {
        this.where('space_name', 'ilike', `%${search}%`)
          .orWhere('space_description', 'ilike', `%${search}%`);
      });
    }

    const spaces = await query
      .orderBy('member_count', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countQuery = knex('spaces').where('is_active', true);
    if (search) {
      countQuery.where(function() {
        this.where('space_name', 'ilike', `%${search}%`)
          .orWhere('space_description', 'ilike', `%${search}%`);
      });
    }
    const totalCount = await countQuery.count('* as count').first();

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

// GET - Search threads
router.get('/threads', checkAuth, async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const userId = req.user?.userId;

  try {
    const query = knex('threads')
      .join('spaces', 'threads.space_id', 'spaces.id')
      .leftJoin('users', 'threads.created_by', 'users.id')
      .leftJoin('scores', function () {
        this.on('threads.id', '=', 'scores.thread_id')
          .andOn('scores.user_id', '=', knex.raw('?', [userId]))
      })
      .leftJoin('comments', 'threads.id', 'comments.thread_id')
      .leftJoin('users as current_user', 'current_user.id', '=', knex.raw('?', [userId]))
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
        'spaces.space_name',
        'spaces.avatar_url',
        'scores.vote_type as userVote',
        'current_user.avatar_url as current_user_avatar_url'
      )
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
        'scores.vote_type',
        'current_user.avatar_url'
      );

    // Add search filter if search term is provided
    if (search) {
      query.where(function() {
        this.where('threads.title', 'ilike', `%${search}%`)
          .orWhere('threads.content', 'ilike', `%${search}%`);
      });
    }

    const threadsData = await query
      .orderBy('threads.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const threads = threadsData.map(thread => ({
      ...thread,
      space_avatar_url: thread.avatar_url
    }));

    // Get total count for pagination
    const countQuery = knex('threads');
    if (search) {
      countQuery.where(function() {
        this.where('threads.title', 'ilike', `%${search}%`)
          .orWhere('threads.content', 'ilike', `%${search}%`);
      });
    }
    const totalCount = await countQuery.count('* as count').first();

    const threadsWithTimeAgo = threads.map(thread => ({
      ...thread,
      timeAgo: formatRelativeTime(thread.created_at),
      comments: parseInt(thread.comment_count) || 0
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

module.exports = router;
