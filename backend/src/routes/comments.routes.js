const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');

// Add this function at the top of your comments.routes.js
function formatRelativeTime(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}hr ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 604800)}w ago`;
}

// POST - Create new comment
router.post('/', checkAuth, async (req, res) => {
  const { content, thread_id, parent_id } = req.body;

  let comment = null;
  let error_message = '';
  let status = 201;
  let success = true;

  try {

    const [commentId] = await knex('comments').insert({
      content,
      thread_id,
      parent_id,
    }).returning('id');

    comment = await knex('comments').where('id', commentId.id).first();

    // Add the remaining data need for the comment
    comment = {
      ...comment,
      author: 'Sarah Johnson',
      avatar: 'S',
      timestamp: formatRelativeTime(comment.created_at),
      net_score: 12,
      userVote: 0,
      replies: []
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
      comment
    });
  }
});

// GET - Fetch comments for a thread
router.get('/', async (req, res) => {
  const { thread_id } = req.query;

  let comments = [];
  let error_message = '';
  let status = 200;
  let success = true;

  try {
    // Fetch comments for the specific thread
    const threadComments = await knex('comments')
      .where('thread_id', thread_id)
      .where('parent_id', null) // Only top-level comments
      .orderBy('created_at', 'asc');

    // Format each comment
    comments = threadComments.map(comment => ({
      ...comment,
      author: 'Sarah Johnson', // Temporary until users table
      avatar: 'S',
      timestamp: formatRelativeTime(comment.created_at),
      userVote: 0,
      replies: [] // TODO: Fetch nested replies in future
    }));

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  }

  res.status(status).json({
    success,
    status,
    error_message,
    comments
  });
});

module.exports = router;