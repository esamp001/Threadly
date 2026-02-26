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

// GET - Get space by slug
// router.get('/:slug', async (req, res) => {
//   const { slug } = req.params;

//   try {
//     const space = await knex('spaces')
//       .where('space_slug', slug)
//       .first();

//     if (!space) {
//       return res.status(404).json({
//         success: false,
//         message: 'Space not found'
//       });
//     }

//     res.json({
//       success: true,
//       space
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// });

module.exports = router;