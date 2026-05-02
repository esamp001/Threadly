const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');
const { formatRelativeTime } = require('../utils/timeHelpers');
const { awardCommentCreated, awardExp } = require('../utils/expService');

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
      return {
        ...comment,
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
  const { commentId, voteType } = req.body;
  const userId = req.user?.userId;

  const numericVote = voteType === 'upvote' ? 1 : -1;

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

      // Case 1: No previous vote - add new vote
      if (!existingVote) {
        await trx('comment_votes').insert({
          user_id: userId,
          comment_id: commentId,
          vote_type: numericVote
        });

        await trx('comments')
          .where({ id: commentId })
          .increment(numericVote === 1 ? 'upvotes' : 'downvotes', 1)
          .increment('net_score', numericVote);

        // Award EXP to comment author for receiving upvote
        if (numericVote === 1 && comment.created_by !== userId) {
          const expResult = await awardExp(comment.created_by, 'reply_upvote', commentId, trx);
          if (!expResult.success) {
            console.warn('Failed to award EXP for comment upvote:', expResult.error);
          }
        }
      }
      // Case 2: Same vote clicked again → remove vote (neutral)
      else if (existingVote.vote_type === numericVote) {
        await trx('comment_votes')
          .where({ user_id: userId, comment_id: commentId })
          .delete();

        await trx('comments')
          .where({ id: commentId })
          .decrement(numericVote === 1 ? 'upvotes' : 'downvotes', 1)
          .decrement('net_score', numericVote);
      }
      // Case 3: Switching vote (upvote → downvote or vice versa)
      else {
        await trx('comment_votes')
          .where({ user_id: userId, comment_id: commentId })
          .update({ vote_type: numericVote });

        await trx('comments')
          .where({ id: commentId })
          .increment(numericVote === 1 ? 'upvotes' : 'downvotes', 1)
          .decrement(numericVote === 1 ? 'downvotes' : 'upvotes', 1)
          .increment('net_score', numericVote * 2);

        // Award EXP if switching from downvote to upvote
        if (numericVote === 1 && comment.created_by !== userId) {
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

module.exports = router;