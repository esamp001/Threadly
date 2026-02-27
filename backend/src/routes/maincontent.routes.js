const express = require('express');
const router = express.Router();
const knex = require('../db/knex');

// GET - List all spaces with pagination
router.get('/all_spaces', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Get the spaces for current page
    const spaces = await knex('spaces')
      .select('id', 'space_name', 'avatar_url')
      .where('is_active', true)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count for pagination info
    const totalCount = await knex('spaces')
      .where('is_active', true)
      .count('* as count')
      .first();

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

router.post('/create_thread', async (req, res) => {
  const { title, content, spaceId } = req.body;

  let status = 200
  let error_message = ''
  let success = true
  let thread = []

  try {
    thread = await knex('threads')
      .insert({
        title,
        content,
        space_id: spaceId,
        created_by: 1  // Placeholder user ID since you don't have users table yet
      })
      .returning('*');

  } catch (error) {
    console.error('Error creating thread:', error);
    status = 500
    error_message = error.message
    success = false
  } finally {
    res.status(status).json({
      success,
      status,
      error_message,
      thread: thread[0]
    });
  }

});

module.exports = router;