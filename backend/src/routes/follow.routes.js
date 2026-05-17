/**
 * Follow system routes
 * Handles user follow/unfollow operations and follow status
 */
const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');

/**
 * Follow a user
 * POST /api/follow/:userId
 */
router.post('/:userId', checkAuth, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const followerId = req.user.userId;

  let success = true;
  let error_message = '';
  let status = 200;
  let result = null;

  try {
    // Validate inputs
    if (!userId || !followerId) {
      success = false;
      error_message = 'Invalid user IDs';
      status = 400;
      return;
    }

    // Prevent self-follow
    if (userId === followerId) {
      success = false;
      error_message = 'Cannot follow yourself';
      status = 400;
      return;
    }

    // Check if target user exists
    const targetUser = await knex('users').where('id', userId).first();
    if (!targetUser) {
      success = false;
      error_message = 'User not found';
      status = 404;
      return;
    }

    // Check if already following
    const existingFollow = await knex('user_follows')
      .where({ follower_id: followerId, following_id: userId })
      .first();

    if (existingFollow) {
      success = false;
      error_message = 'Already following this user';
      status = 409;
      return;
    }

    // Create follow relationship (let DB handle created_at default)
    await knex('user_follows').insert({
      follower_id: followerId,
      following_id: userId
    });

    // Get updated follower count
    const followerCount = await knex('user_follows')
      .where('following_id', userId)
      .count('* as count')
      .first();

    result = {
      isFollowing: true,
      followersCount: parseInt(followerCount.count)
    };

  } catch (error) {
    console.error('Error following user:', error);
    success = false;
    error_message = error.message || 'Failed to follow user';
    status = 500;
  } finally {
    res.status(status).json({ success, error_message, result });
  }
});

/**
 * Unfollow a user
 * DELETE /api/follow/:userId
 */
router.delete('/:userId', checkAuth, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const followerId = req.user.userId;

  let success = true;
  let error_message = '';
  let status = 200;
  let result = null;

  try {
    // Validate inputs
    if (!userId || !followerId) {
      success = false;
      error_message = 'Invalid user IDs';
      status = 400;
      return;
    }

    // Check if following relationship exists
    const existingFollow = await knex('user_follows')
      .where({ follower_id: followerId, following_id: userId })
      .first();

    if (!existingFollow) {
      success = false;
      error_message = 'Not following this user';
      status = 404;
      return;
    }

    // Remove follow relationship
    await knex('user_follows')
      .where({ follower_id: followerId, following_id: userId })
      .del();

    // Get updated follower count
    const followerCount = await knex('user_follows')
      .where('following_id', userId)
      .count('* as count')
      .first();

    result = {
      isFollowing: false,
      followersCount: parseInt(followerCount.count)
    };

  } catch (error) {
    console.error('Error unfollowing user:', error);
    success = false;
    error_message = error.message || 'Failed to unfollow user';
    status = 500;
  } finally {
    res.status(status).json({ success, error_message, result });
  }
});

/**
 * Get follow status between current user and target user
 * GET /api/follow/:userId/status
 */
router.get('/:userId/status', checkAuth, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const currentUserId = req.user.userId;

  let success = true;
  let error_message = '';
  let status = 200;
  let result = null;

  try {
    // Validate inputs
    if (!userId || !currentUserId) {
      success = false;
      error_message = 'Invalid user IDs';
      status = 400;
      return;
    }

    // Check if target user exists
    const targetUser = await knex('users').where('id', userId).first();
    if (!targetUser) {
      success = false;
      error_message = 'User not found';
      status = 404;
      return;
    }

    // Check follow status
    const followStatus = await knex('user_follows')
      .where({ follower_id: currentUserId, following_id: userId })
      .first();

    // Get follower count
    const followerCount = await knex('user_follows')
      .where('following_id', userId)
      .count('* as count')
      .first();

    result = {
      isFollowing: !!followStatus,
      followersCount: parseInt(followerCount.count)
    };

  } catch (error) {
    console.error('Error checking follow status:', error);
    success = false;
    error_message = 'Failed to check follow status';
    status = 500;
  } finally {
    res.status(status).json({ success, error_message, result });
  }
});

/**
 * Get user's followers
 * GET /api/follow/:userId/followers
 */
router.get('/:userId/followers', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let success = true;
  let error_message = '';
  let status = 200;
  let followers = [];
  let hasMore = false;

  try {
    // Check if user exists
    const user = await knex('users').where('id', userId).first();
    if (!user) {
      success = false;
      error_message = 'User not found';
      status = 404;
      return;
    }

    // Get followers with user details
    const followersQuery = knex('user_follows AS uf')
      .join('users AS u', 'uf.follower_id', 'u.id')
      .where('uf.following_id', userId)
      .select(
        'u.id',
        'u.username',
        'u.avatar_url',
        'u.exp_points',
        'u.level',
        'uf.created_at as followed_at'
      )
      .orderBy('uf.created_at', 'desc')
      .limit(limit + 1);

    const results = await followersQuery.offset(offset);

    // Check if there are more results
    hasMore = results.length > limit;
    if (hasMore) {
      results.pop(); // Remove the extra result
    }

    // Format followers
    followers = results.map(follower => ({
      id: follower.id,
      username: follower.username,
      avatarUrl: follower.avatar_url,
      expPoints: follower.exp_points || 0,
      level: follower.level || 1,
      followedAt: follower.followed_at
    }));

  } catch (error) {
    console.error('Error fetching followers:', error);
    success = false;
    error_message = 'Failed to fetch followers';
    status = 500;
  } finally {
    res.status(status).json({
      success,
      error_message,
      followers,
      hasMore,
      currentPage: parseInt(page)
    });
  }
});

/**
 * Get user's following
 * GET /api/follow/:userId/following
 */
router.get('/:userId/following', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let success = true;
  let error_message = '';
  let status = 200;
  let following = [];
  let hasMore = false;

  try {
    // Check if user exists
    const user = await knex('users').where('id', userId).first();
    if (!user) {
      success = false;
      error_message = 'User not found';
      status = 404;
      return;
    }

    // Get following with user details
    const followingQuery = knex('user_follows AS uf')
      .join('users AS u', 'uf.following_id', 'u.id')
      .where('uf.follower_id', userId)
      .select(
        'u.id',
        'u.username',
        'u.avatar_url',
        'u.exp_points',
        'u.level',
        'uf.created_at as followed_at'
      )
      .orderBy('uf.created_at', 'desc')
      .limit(limit + 1);

    const results = await followingQuery.offset(offset);

    // Check if there are more results
    hasMore = results.length > limit;
    if (hasMore) {
      results.pop(); // Remove the extra result
    }

    // Format following
    following = results.map(user => ({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar_url,
      expPoints: user.exp_points || 0,
      level: user.level || 1,
      followedAt: user.followed_at
    }));

  } catch (error) {
    console.error('Error fetching following:', error);
    success = false;
    error_message = 'Failed to fetch following';
    status = 500;
  } finally {
    res.status(status).json({
      success,
      error_message,
      following,
      hasMore,
      currentPage: parseInt(page)
    });
  }
});

module.exports = router;
