const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

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
router.post('/', async (req, res) => {
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

module.exports = router;