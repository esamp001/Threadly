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

// PUT - Create new space
router.put('/', async (req, res) => {
  const {
    spaceName,
    spaceDescription,
    spaceSlug,
    avatarUrl,
    avatarPublicId,
    communityType,
    isMature,
    topics
  } = req.body;

  let space = null;
  let error_message = '';
  let status = 201;
  let success = true;

  try {
    // Start transaction
    const trx = await knex.transaction();

    // Insert space
    const [spaceId] = await trx('spaces').insert({
      space_name: spaceName,
      space_description: spaceDescription,
      space_slug: spaceSlug,
      avatar_url: avatarUrl,
      avatar_public_id: avatarPublicId,
      community_type: communityType,
      is_mature: isMature,
      created_by: 1, // TODO: Get from authenticated user
      is_active: true
    }).returning('id');

    // Insert space-topic relationships
    if (topics && topics.length > 0) {
      const spaceTopics = topics.map(topic => ({
        space_id: spaceId.id,
        topic_id: topic.id
      }));

      await trx('space_topics').insert(spaceTopics);
    }

    // Commit transaction
    await trx.commit();

    // Fetch created space with the SAME format as MainContent expects
    space = await knex('spaces')
      .select('id', 'space_name', 'avatar_url') // Same fields as maincontent.routes.js
      .where('id', spaceId.id)
      .first();

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
    await trx.rollback();
  }

  res.status(status).json({
    success,
    status,
    error_message,
    space // Return in the same format as MainContent expects
  });
});



module.exports = router;
