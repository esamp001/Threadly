const express = require('express');
const db = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');

const router = express.Router();

// POST /api/onboarding - Save onboarding data
router.post('/', checkAuth, async (req, res) => {
  const { username, avatar_url, selected_topics, avatar_preferences } = req.body;
  const userId = req.user.userId;

  let success = true;
  let error_message = '';
  let status = 200;

  try {
    // Start transaction
    await db.transaction(async (trx) => {
      // Update user profile
      await trx('users')
        .where('id', userId)
        .update({
          username: username,
          avatar_url: null,
          avatar_seed: avatar_preferences?.seed || null,
          avatar_options: JSON.stringify(avatar_preferences?.options || {}),
          gender: avatar_preferences?.options?.gender || null,
          updated_at: new Date()
        });

      // Clear existing user topics
      await trx('user_topics').where('user_id', userId).del();

      // Insert new user topics if any selected
      if (selected_topics && selected_topics.length > 0) {
        const userTopicsData = selected_topics.map(topicId => ({
          user_id: userId,
          topic_id: topicId,
          created_at: new Date()
        }));

        await trx('user_topics').insert(userTopicsData);
      }
    });

  } catch (error) {
    console.error('Error saving onboarding data:', error);
    success = false;
    error_message = 'Failed to save onboarding data';
    status = 500;
  }

  res.status(status).json({
    success,
    error: error_message,
    message: success ? 'Onboarding completed successfully' : null
  });
});

module.exports = router;