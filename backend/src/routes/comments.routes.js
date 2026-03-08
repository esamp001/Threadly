const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

// POST - Create new comment
router.post('/', async (req, res) => {
  const { content } = req.body;

  let comment = null;
  let error_message = '';
  let status = 201;
  let success = true;

  try {

  const comments_posted = await knex('comments').insert({
    content: content,
    thread_id: 1, // TODO: Get from thread context or request body
    created_by: 1, // TODO: Get from authenticated user
    parent_id: null, // TODO: Get from request body if it's a reply
    upvotes: 0,
    downvotes: 0,
    net_score: 0,
    is_active: true
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

module.exports = router;