const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');
const { formatRelativeTime } = require('../utils/timeHelpers');
const multer = require('multer');
const cloudinary = require('../cloudinary/setupcloud');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET space details by ID
router.get('/:id', checkAuth, async (req, res) => {
  const { id } = req.params;

  let space = [];
  let error_message = '';
  let status = 200;
  let success = true;

  try {

    // Validation for required parameters
    if (!id) {
      status = 400;
      error_message = 'Space ID is required';
      success = false;
      throw new Error('Space ID is required');
    }

    // Fetch space with creator information
    space = await knex('spaces')
      .select(
        'spaces.id',
        'spaces.space_name as name',
        'spaces.space_description as description',
        'spaces.avatar_url',
        'spaces.cover_image_url as coverImageUrl',
        'spaces.created_by as creatorId',
        'spaces.community_type as communityType',
        'spaces.is_mature as isMature',
        'spaces.is_active as isActive',
        'spaces.created_at as createdAt',
        'users.id as user_id',
        'users.username',
        'users.avatar_url as creatorAvatarUrl'
      )
      .leftJoin('users', 'spaces.created_by', 'users.id')
      .where('spaces.id', id)
      .first();

    if (!space) {
      status = 404;
      error_message = 'Space not found';
      success = false;
    }

    // Check if user is a member
    const member = await knex('space_members')
      .where({ space_id: id, user_id: req.user?.userId || null })
      .first();

    // Get member count
    const memberCountResult = await knex('space_members')
      .where('space_id', id)
      .count('* as count')
      .first();

    // Format response to match expectations
    space = {
      id: space.id,
      name: space.name,
      description: space.description,
      avatar_url: space.avatar_url,
      cover_photo_url: space.coverImageUrl,
      creatorId: space.creatorId,
      communityType: space.communityType,
      isMature: space.isMature,
      isActive: space.isActive,
      createdAt: formatRelativeTime(space.createdAt),
      creator: space.creator_id ? {
        id: space.creator_id,
        username: space.username,
        displayName: space.displayName,
        avatarUrl: space.creatorAvatarUrl
      } : null,
      isMember: !!member,
      memberCount: parseInt(memberCountResult?.count) || 0
    };

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      space
    });
  }
});

// GET threads for a specific space
router.get('/:spaceId/threads', checkAuth, async (req, res) => {
  const { spaceId } = req.params;

  let threads = [];
  let error_message = '';
  let status = 200;
  let success = true;

  try {
    // Validation for required parameters
    if (!spaceId) {
      status = 400;
      error_message = 'Space ID is required';
      success = false;
      throw new Error('Space ID is required');
    }

    // Get threads for this space with user votes and comment count
    const threadsData = await knex('threads')
      .join('spaces', 'threads.space_id', 'spaces.id')
      .leftJoin('users', 'threads.created_by', 'users.id')
      .leftJoin('scores', function () {
        this.on('threads.id', '=', 'scores.thread_id')
          .andOn('scores.user_id', '=', knex.raw('?', [req.user?.userId || null]));
      })
      .leftJoin('comments', 'threads.id', 'comments.thread_id')
      .leftJoin('users as current_user', 'current_user.id', '=', knex.raw('?', [req.user?.userId || null]))
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
      .where('threads.space_id', spaceId)
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
      )
      .orderBy('threads.created_at', 'desc');

    threads = threadsData.map(thread => ({
      id: thread.id,
      title: thread.title,
      content: thread.content,
      space_id: thread.space_id,
      username: thread.username,
      user_avatar_url: thread.user_avatar_url,
      space_name: thread.space_name,
      avatar_url: thread.avatar_url,
      timeAgo: formatRelativeTime(thread.created_at),
      net_score: thread.net_score,
      comment_count: thread.comment_count || 0,
      userVote: thread.userVote,
      current_user_avatar_url: thread.current_user_avatar_url
    }));

    if (threads.length === 0) {
      status = 200;
      success = true;
    }

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      threads
    });
  }
});

// Upload route for space cover photos
router.post('/cover_photo_upload', checkAuth, upload.single('avatar'), async (req, res) => {

  try {
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
      public_id: `space-cover-${Date.now()}`,
      folder: 'threadly/cover_photos'
    });

    // Update the space's cover_image_url in the database
    await knex('spaces')
      .where('id', req.body.spaceId)
      .update({
        cover_image_url: uploadResult.secure_url
      });

    console.log(uploadResult, "uploadResult");

    res.json({
      status: 'success',
      message: 'Cover photo uploaded successfully',
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });
  } catch (error) {
    console.log(error, "error")
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Remove route for space cover photos
router.post('/cover_photo_remove', checkAuth, async (req, res) => {
  const { spaceId } = req.body;

  console.log(spaceId, "spaceId")

  try {
    // Update the space's cover_image_url to NULL in the database
    await knex('spaces')
      .where('id', spaceId)
      .update({
        cover_image_url: null
      });

    res.json({
      status: 'success',
      message: 'Cover photo removed successfully'
    });
  } catch (error) {
    console.log(error, "error")
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// POST /api/spaces/:id/join - Join a space
router.post('/:id/join', checkAuth, async (req, res) => {
  const { id: spaceId } = req.params;
  const userId = req.user.userId;

  let status = 200;
  let success = true;
  let error_message = '';

  try {
    // Check if space exists
    const space = await knex('spaces').where('id', spaceId).first();
    if (!space) {
      status = 404;
      error_message = 'Space not found';
      success = false;
      throw new Error('Space not found');
    }

    // Check if user is already a member
    const existingMember = await knex('space_members')
      .where({ space_id: spaceId, user_id: userId })
      .first();

    if (existingMember) {
      status = 409;
      error_message = 'User is already a member of this space';
      success = false;
      throw new Error('Already a member');
    }

    // Add user to space
    await knex('space_members').insert({
      space_id: spaceId,
      user_id: userId,
      joined_at: knex.fn.now()
    });

  } catch (error) {
    if (!error_message) {
      status = 500;
      error_message = error.message;
      success = false;
    }
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      message: success ? 'Joined space successfully' : undefined
    });
  }
});

// DELETE /api/spaces/:id/leave - Leave a space
router.delete('/:id/leave', checkAuth, async (req, res) => {
  const { id: spaceId } = req.params;
  const userId = req.user.userId;

  let status = 200;
  let success = true;
  let error_message = '';

  try {
    // Check if user is a member
    const member = await knex('space_members')
      .where({ space_id: spaceId, user_id: userId })
      .first();

    if (!member) {
      status = 404;
      error_message = 'User is not a member of this space';
      success = false;
      throw new Error('Not a member');
    }

    // Remove user from space
    await knex('space_members')
      .where({ space_id: spaceId, user_id: userId })
      .del();

  } catch (error) {
    if (!error_message) {
      status = 500;
      error_message = error.message;
      success = false;
    }
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      message: success ? 'Left space successfully' : undefined
    });
  }
});

// GET /api/spaces/:id/membership - Check if user is a member of a space
router.get('/:id/membership', checkAuth, async (req, res) => {
  const { id: spaceId } = req.params;
  const userId = req.user.userId;

  let status = 200;
  let success = true;
  let error_message = '';
  let isMember = false;

  try {
    const member = await knex('space_members')
      .where({ space_id: spaceId, user_id: userId })
      .first();

    isMember = !!member;

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      data: { isMember }
    });
  }
});

module.exports = router;
