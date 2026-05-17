const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');
const { formatRelativeTime } = require('../utils/timeHelpers');
const { awardCommentCreated, awardExp } = require('../utils/expService');

/**
 * Helper function to check if user has moderator or admin role in a space
 * @param {number} userId - The user ID to check
 * @param {number} spaceId - The space ID to check
 * @returns {Promise<boolean>} - True if user is moderator or admin
 */
const hasModeratorRole = async (userId, spaceId) => {
  try {
    const member = await knex('space_members')
      .where({ user_id: userId, space_id: spaceId })
      .first();

    return member && (member.role === 'owner' || member.role === 'moderator');
  } catch (error) {
    console.error('Error checking moderator role:', error);
    return false;
  }
};

/**
 * Helper function to check if comment can be edited
 * Only author can edit within 5 minutes of creation
 * @param {number} commentId - The comment ID to check
 * @param {number} userId - The user ID attempting to edit
 * @returns {Promise<{canEdit: boolean, reason?: string}>}
 */
const canEditComment = async (commentId, userId) => {
  try {
    const comment = await knex('comments')
      .where('id', commentId)
      .first();

    if (!comment) {
      return { canEdit: false, reason: 'Comment not found' };
    }

    if (comment.created_by !== userId) {
      return { canEdit: false, reason: 'Not the comment author' };
    }

    // Check if comment is within 5 minutes of creation
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const createdAt = new Date(comment.created_at);

    if (createdAt < fiveMinutesAgo) {
      return { canEdit: false, reason: 'Edit time limit exceeded (5 minutes)' };
    }

    return { canEdit: true };
  } catch (error) {
    console.error('Error checking edit permission:', error);
    return { canEdit: false, reason: 'Error checking permission' };
  }
};

// POST - Create new comment
router.post('/', checkAuth, async (req, res) => {
  const { content, thread_id, parent_id } = req.body;
  const userId = req.user?.userId;

  let comment = null;
  let error_message = '';
  let status = 201;
  let success = true;
  let comment_count = 0;

  try {
    if (!content || !thread_id || !userId) {
      throw new Error('Missing required fields: content, thread_id, or user ID');
    }

    await knex.transaction(async (trx) => {
      const commentIdResult = await trx('comments').insert({
        content,
        thread_id,
        parent_id,
        created_by: userId
      }).returning('id');

      const commentId = commentIdResult[0]?.id;

      // Validate comment creation was successful before awarding EXP
      comment = await trx('comments').where('id', commentId).first();
      if (!comment) {
        throw new Error('Failed to create comment - comment not found after insertion');
      }

      // Award EXP for comment creation (only if comment was successfully created)
      const expResult = await awardCommentCreated(userId, commentId, parent_id, trx);
      if (!expResult.success) {
        console.warn('Failed to award EXP for comment creation:', expResult.error);
      }

      // Get the comment count for this thread
      const countResult = await trx('comments')
        .where('thread_id', thread_id)
        .count('* as count')
        .first();

      comment_count = parseInt(countResult.count) || 0;

      comment = await trx('comments AS c')
        .leftJoin('users AS u', 'u.id', 'c.created_by')
        .where('c.id', commentId)
        .select(
          'c.id',
          'c.content',
          'c.thread_id',
          'c.parent_id',
          'c.created_by',
          'c.created_at',
          'c.updated_at',
          'u.username',
          'u.avatar_url AS user_avatar_url'
        )
        .first();

      if (!comment) {
        throw new Error('Failed to retrieve created comment');
      }

      comment = {
        ...comment,
        author: comment.username || 'Anonymous',
        avatar: comment.avatar_url || comment.username?.[0]?.toUpperCase() || 'A',
        timestamp: formatRelativeTime(comment.created_at),
        net_score: 0,
        userVote: 0,
        replies: [],
        comments: comment_count
      };

      if (!comment.id || !comment.content) {
        throw new Error('Invalid comment data structure');
      }

      // Update contributor points for the user in this space
      // +5 points for creating a comment, +1 comments_count
      // First get the space_id from the thread
      const thread = await trx('threads').where('id', thread_id).first();
      if (thread) {
        await trx('space_contributor_points')
          .insert({
            space_id: thread.space_id,
            user_id: userId,
            points: 5,
            posts_count: 0,
            comments_count: 1,
            upvotes_received: 0,
            updated_at: trx.fn.now()
          })
          .onConflict(['space_id', 'user_id'])
          .merge({
            points: trx.raw('space_contributor_points.points + 5'),
            comments_count: trx.raw('space_contributor_points.comments_count + 1'),
            updated_at: trx.fn.now()
          });
      }
    });

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      comment
    });
  }
});

// GET - Fetch comments for a thread
router.get('/', checkAuth, async (req, res) => {
  const { thread_id } = req.query;
  const userId = req.user?.userId;

  try {
    // Fetch ALL comments for this thread (both top-level and replies)
    const allComments = await knex('comments AS c')
      .leftJoin('users AS u', 'u.id', 'c.created_by')
      .leftJoin('comment_votes AS cv', function () {
        this.on('cv.comment_id', '=', 'c.id')
          .andOn('cv.user_id', '=', knex.raw('?', [userId]))
      })
      .where('c.thread_id', thread_id)
      .orderBy('c.created_at', 'desc')
      .select(
        'c.id',
        'c.content',
        'c.thread_id',
        'c.parent_id',
        'c.created_by',
        'c.created_at',
        'c.updated_at',
        'c.upvotes',
        'c.downvotes',
        'c.net_score',
        'c.is_active',
        'c.deleted_at',
        'c.deleted_by',
        'u.username',
        'u.avatar_url AS user_avatar_url',
        'cv.vote_type AS user_vote',
        'cv.user_id AS vote_user_id'
      );

    // Build comment tree
    const commentsMap = new Map();
    const topLevelComments = [];

    // First pass: create all comment objects
    allComments.forEach(row => {
      const commentId = row.id;

      if (!commentsMap.has(commentId)) {
        const comment = {
          id: row.id,
          content: row.content,
          thread_id: row.thread_id,
          parent_id: row.parent_id,
          created_by: row.created_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
          upvotes: row.upvotes || 0,
          downvotes: row.downvotes || 0,
          net_score: row.net_score || 0,
          is_active: row.is_active !== undefined ? row.is_active : true,
          deleted_at: row.deleted_at,
          deleted_by: row.deleted_by,
          username: row.username,
          user_avatar_url: row.user_avatar_url,
          userVote: row.user_vote || 0,
          votes: [],
          replies: []
        };

        commentsMap.set(commentId, comment);
      }

      const comment = commentsMap.get(commentId);

      // Handle user vote
      if (userId && row.vote_user_id === userId && row.user_vote !== null) {
        comment.userVote = row.user_vote;
      }
    });

    // Second pass: build parent-child relationships
    commentsMap.forEach(comment => {
      if (comment.parent_id === null) {
        // Top-level comment
        topLevelComments.push(comment);
      } else {
        // Reply - add to parent's replies
        const parentComment = commentsMap.get(comment.parent_id);
        if (parentComment) {
          parentComment.replies.push(comment);
        }
      }
    });

    // Recursive formatting function
    const formatCommentRecursively = (comment) => {
      // Handle soft-deleted comments
      let displayContent = comment.content;
      if (!comment.is_active || comment.deleted_at) {
        displayContent = 'This comment is deleted by user';
      }

      return {
        ...comment,
        content: displayContent,
        author: comment.username || 'Anonymous',
        avatar: comment.user_avatar_url || comment.username?.[0]?.toUpperCase() || 'A',
        timestamp: formatRelativeTime(comment.created_at),
        user_avatar_url: comment.user_avatar_url,
        net_score: comment.net_score || 0,
        userVote: comment.userVote || 0,
        replies: comment.replies.map(formatCommentRecursively) // Recursively format replies
      };
    };

    // Format response - apply recursive formatting to all comments
    const formattedComments = topLevelComments.map(formatCommentRecursively);

    res.json({
      success: true,
      comments: formattedComments
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/vote', checkAuth, async (req, res) => {
  // `vote` is the final resolved numeric state: 1 (upvote), -1 (downvote), 0 (remove vote)
  const { commentId, vote } = req.body;
  const userId = req.user?.userId;

  // Validate vote value
  if (![1, 0, -1].includes(vote)) {
    return res.status(400).json({ success: false, error: 'Invalid vote value' });
  }

  try {
    await knex.transaction(async (trx) => {
      // Get comment info for EXP awarding
      const comment = await trx('comments').where('id', commentId).first();
      if (!comment) {
        throw new Error('Comment not found');
      }

      const existingVote = await trx('comment_votes')
        .where({ user_id: userId, comment_id: commentId })
        .first();

      const prevVote = existingVote ? existingVote.vote_type : 0;

      // No change needed — idempotent guard (handles spam that resolves to same state)
      if (prevVote === vote) {
        return;
      }

      // --- Remove previous vote from DB and comment counters ---
      if (existingVote) {
        await trx('comment_votes')
          .where({ user_id: userId, comment_id: commentId })
          .delete();

        await trx('comments')
          .where({ id: commentId })
          .decrement(prevVote === 1 ? 'upvotes' : 'downvotes', 1)
          .decrement('net_score', prevVote);
      }

      // --- Apply new vote if not un-voting (vote !== 0) ---
      if (vote !== 0) {
        await trx('comment_votes').insert({
          user_id: userId,
          comment_id: commentId,
          vote_type: vote
        });

        await trx('comments')
          .where({ id: commentId })
          .increment(vote === 1 ? 'upvotes' : 'downvotes', 1)
          .increment('net_score', vote);

        // Award EXP to comment author for receiving upvote
        if (vote === 1 && comment.created_by !== userId) {
          const expResult = await awardExp(comment.created_by, 'reply_upvote', commentId, trx);
          if (!expResult.success) {
            console.warn('Failed to award EXP for comment upvote:', expResult.error);
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

// PUT /api/comments/:id - Edit a comment
router.put('/:id', checkAuth, async (req, res) => {
  const { id: commentId } = req.params;
  const { content } = req.body;
  const userId = req.user?.userId;

  let status = 200;
  let success = true;
  let error_message = '';
  let updatedComment = null;

  try {
    if (!content || !content.trim()) {
      status = 400;
      error_message = 'Content is required';
      success = false;
      throw new Error('Content is required');
    }

    // Check if user can edit the comment
    const { canEdit, reason } = await canEditComment(commentId, userId);
    if (!canEdit) {
      status = 403;
      error_message = reason;
      success = false;
      throw new Error(reason);
    }

    // Update the comment
    await knex('comments')
      .where('id', commentId)
      .update({
        content: content.trim(),
        updated_at: knex.fn.now()
      });

    // Fetch the updated comment
    updatedComment = await knex('comments AS c')
      .leftJoin('users AS u', 'u.id', 'c.created_by')
      .where('c.id', commentId)
      .select(
        'c.id',
        'c.content',
        'c.thread_id',
        'c.parent_id',
        'c.created_by',
        'c.created_at',
        'c.updated_at',
        'u.username',
        'u.avatar_url AS user_avatar_url'
      )
      .first();

    if (!updatedComment) {
      status = 404;
      error_message = 'Comment not found';
      success = false;
    }

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
      comment: updatedComment
    });
  }
});

// DELETE /api/comments/:id - Soft delete a comment
router.delete('/:id', checkAuth, async (req, res) => {
  const { id: commentId } = req.params;
  const userId = req.user?.userId;

  let status = 200;
  let success = true;
  let error_message = '';

  try {
    // Get the comment
    const comment = await knex('comments')
      .where('id', commentId)
      .first();

    if (!comment) {
      status = 404;
      error_message = 'Comment not found';
      success = false;
      throw new Error('Comment not found');
    }

    // Get the thread to find the space_id
    const thread = await knex('threads')
      .where('id', comment.thread_id)
      .first();

    if (!thread) {
      status = 404;
      error_message = 'Thread not found';
      success = false;
      throw new Error('Thread not found');
    }

    // Check permissions: user is comment author OR space moderator/admin
    const isAuthor = comment.created_by === userId;
    const isModerator = await hasModeratorRole(userId, thread.space_id);

    if (!isAuthor && !isModerator) {
      status = 403;
      error_message = 'Not authorized to delete this comment';
      success = false;
      throw new Error('Not authorized to delete this comment');
    }

    // Soft delete the comment
    await knex('comments')
      .where('id', commentId)
      .update({
        is_active: false,
        deleted_at: knex.fn.now(),
        deleted_by: userId
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
      error_message
    });
  }
});

module.exports = router;