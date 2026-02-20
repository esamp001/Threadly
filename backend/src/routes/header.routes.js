const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

// GET all topics
router.get('/', async (_, res) => {

  let topics = [];
  let error_message = ''
  let status = 200
  let success = true

  try {
    topics = await knex('topics').select('id', 'name', 'description', 'slug', 'icon');

  } catch (error) {

    status = 500
    error_message = error.message
    success = false
  } finally {
    res.status(status).json({ success, status, error_message, topics });
  }
});


module.exports = router;
