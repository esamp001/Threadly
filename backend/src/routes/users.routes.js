/**
 * User profile and related routes
 * Handles user profile data, comments, and statistics
 */
const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const { optionalAuth } = require('../middleware/optionalAuth');
const { checkAuth } = require('../middleware/checkAuth');
const { formatRelativeTime } = require('../utils/timeHelpers');

/**
 * Update current user's profile bio
 * PUT /api/users/profile
 */
router.put('/profile', checkAuth, async (req, res) => {
  const { bio } = req.body;
  const userId = req.user.userId;

  console.log({ bio, userId }, "params")

  try {
    await knex('users')
      .where('id', userId)
      .update({
        bio,
        updated_at: knex.fn.now()
      });

    res.json({
      success: true,
      message: 'Bio updated successfully',
      bio
    });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({
      success: false,
      error_message: 'Failed to update bio'
    });
  }
});

/**
 * Get user profile data by username
 * GET /api/users/:username
 */
router.get('/:username', optionalAuth, async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user?.userId;

  let success = true;
  let error_message = '';
  let status = 200;
  let profile = null;

  try {

    // Get user profile data
    const user = await knex('users')
      .where('username', username)
      .first();


    if (!user) {
      success = false;
      error_message = 'User not found';
      status = 404;
      return;
    }

    // Get user statistics
    let threadCount, commentCount, followerCount, followingCount;

    try {
      [threadCount, commentCount] = await Promise.all([
        knex('threads').where('created_by', user.id).count('* as count').first(),
        knex('comments').where('created_by', user.id).count('* as count').first()
      ]);
    } catch (error) {
      console.error('Error fetching basic statistics:', error.message);
      threadCount = { count: '0' };
      commentCount = { count: '0' };
    }

    try {
      [followerCount, followingCount] = await Promise.all([
        knex('user_follows').where('following_id', user.id).count('* as count').first(),
        knex('user_follows').where('follower_id', user.id).count('* as count').first()
      ]);
    } catch (error) {
      followerCount = { count: '0' };
      followingCount = { count: '0' };
    }

    // Get follow status (if current user is logged in)
    let isFollowing = false;
    if (currentUserId) {
      try {
        const followStatus = await knex('user_follows')
          .where({ follower_id: currentUserId, following_id: user.id })
          .first();
        isFollowing = !!followStatus;
      } catch (error) {
        isFollowing = false;
      }
    }

    // Get spaces user is member of
    let spaces = [];
    try {
      spaces = await knex('spaces AS s')
        .join('space_members AS sm', 's.id', 'sm.space_id')
        .where('sm.user_id', user.id)
        .where('s.is_active', true)
        .select(
          's.id',
          's.space_name as name',
          's.space_description as description',
          's.avatar_url as space_avatar_url',
          'sm.role',
          'sm.joined_at'
        )
        .orderBy('sm.joined_at', 'desc')
        .limit(10);
    } catch (error) {
      console.log('space_members table does not exist, using empty spaces array');
    }

    profile = {
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      expPoints: user.exp_points || 0,
      level: user.level || 1,
      createdAt: user.created_at,
      stats: {
        threadsCount: parseInt(threadCount.count) || 0,
        commentsCount: parseInt(commentCount.count) || 0,
        followersCount: parseInt(followerCount.count) || 0,
        followingCount: parseInt(followingCount.count) || 0
      },
      isFollowing,
      spaces: spaces.map(space => ({
        ...space,
        joinedAt: formatRelativeTime(space.joined_at)
      }))
    };

  } catch (error) {
    console.error('Error fetching user profile:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    success = false;
    error_message = `Failed to fetch user profile: ${error.message}`;
    status = 500;
  } finally {
    res.status(status).json({ success, error_message, profile });
  }
});

/**
 * Get user's comments with pagination
 * GET /api/users/:username/comments
 */
router.get('/:username/comments', optionalAuth, async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const userId = req.user?.userId;

  let success = true;
  let error_message = '';
  let status = 200;
  let comments = [];
  let hasMore = false;

  try {
    // Get user ID from username
    const user = await knex('users').where('username', username).first();
    if (!user) {
      success = false;
      error_message = 'User not found';
      status = 404;
      return;
    }

    const commentsQuery = knex('comments AS c')
      .leftJoin('threads AS t', 'c.thread_id', 't.id')
      .leftJoin('spaces AS s', 't.space_id', 's.id')
      .select(
        'c.id',
        'c.content',
        'c.created_at',
        'c.upvotes',
        'c.downvotes',
        'c.net_score',
        't.id as thread_id',
        't.title as thread_title',
        't.space_id',
        's.space_name',
        's.avatar_url as space_image',
        knex('comment_votes')
          .select('vote_type')
          .where('comment_id', knex.ref('c.id'))
          .where('user_id', userId || null)
          .limit(1)
          .as('user_vote')
      )
      .limit(parseInt(limit) + 1) // +1 is enough for "HasMore" logic
      .where('c.created_by', user.id)
      .where('c.is_active', true)
      .orderBy('c.created_at', 'desc');

    const results = await commentsQuery.offset(offset);

    // Check if there are more results
    hasMore = results.length > limit;
    if (hasMore) {
      results.pop(); // Remove the extra result
    }

    // Format comments
    comments = results.map(comment => ({
      id: comment.id,
      content: comment.content,
      timestamp: formatRelativeTime(comment.created_at),
      netScore: comment.net_score || 0,
      userVote: comment.user_vote || 0,
      thread: {
        id: comment.thread_id,
        title: comment.thread_title,
        spaceId: comment.space_id,
        spaceName: comment.space_name,
        spaceImage: comment.space_image
      }
    }));

  } catch (error) {
    console.error('Error fetching user comments:', error);
    success = false;
    error_message = 'Failed to fetch user comments';
    status = 500;
  } finally {
    res.status(status).json({
      success,
      error_message,
      comments,
      hasMore,
      currentPage: parseInt(page)
    });
  }
});

/**
 * Get user's threads with pagination
 * GET /api/users/:username/threads
 */
router.get('/:username/threads', optionalAuth, async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let success = true;
  let error_message = '';
  let status = 200;
  let threads = [];
  let hasMore = false;

  const userId = req.user?.userId;

  try {
    // Get user ID from username
    const user = await knex('users').where('username', username).first();
    if (!user) {
      success = false;
      error_message = 'User not found';
      status = 404;
      return;
    }

    // Get user's threads with space information
    const threadsQuery = knex('threads AS t')
      .join('spaces AS s', 't.space_id', 's.id')
      .where('t.created_by', user.id)
      .where('t.is_active', true)
      .orderBy('t.created_at', 'desc')
      .select(
        't.id',
        't.title',
        't.content',
        't.created_at',
        't.upvotes',
        't.downvotes',
        't.net_score',
        't.space_id',
        's.space_name',
        's.avatar_url as space_image',
        // Subquery for user vote
        knex('scores')
          .select('vote_type')
          .where('thread_id', knex.ref('t.id'))
          .where('user_id', userId || null)
          .limit(1)
          .as('user_vote'),
        // Subquery for comment count
        knex('comments')
          .count('* as count')
          .where('thread_id', knex.ref('t.id'))
          .where('is_active', true)
          .as('comments_count')
      )
      .limit(parseInt(limit) + 1);

    const results = await threadsQuery.offset(offset);

    // Check if there are more results
    hasMore = results.length > parseInt(limit);
    if (hasMore) {
      results.pop(); // Remove the extra result
    }

    // Format threads
    threads = results.map(thread => ({
      id: thread.id,
      title: thread.title,
      content: thread.content,
      timestamp: formatRelativeTime(thread.created_at),
      netScore: thread.net_score || 0,
      commentsCount: parseInt(thread.comments_count) || 0,
      userVote: thread.user_vote || 0,
      space: {
        id: thread.space_id,
        name: thread.space_name,
        image: thread.space_image
      }
    }));

  } catch (error) {
    console.error('Error fetching user threads:', error);
    success = false;
    error_message = 'Failed to fetch user threads';
    status = 500;
  } finally {
    res.status(status).json({
      success,
      error_message,
      threads,
      hasMore,
      currentPage: parseInt(page)
    });
  }
});

module.exports = router;
