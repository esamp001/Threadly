const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');
const { awardSpaceCreated } = require('../utils/expService');

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
router.put('/', checkAuth, async (req, res) => {

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

  let trx;
  try {

    // Validations
    if (spaceName && spaceName.length > 255) throw new Error('Space name is too long (max 255 characters)');
    if (spaceDescription && spaceDescription.length > 255) throw new Error('Space description is too long (max 255 characters)');
    if (spaceSlug && spaceSlug.length > 255) throw new Error('Space slug is too long (max 255 characters)');
    if (avatarUrl && avatarUrl.length > 255) throw new Error('Avatar URL is too long (max 255 characters)');
    if (avatarPublicId && avatarPublicId.length > 255) throw new Error('Avatar public ID is too long (max 255 characters)');
    // Start transaction
    trx = await knex.transaction();

    // Insert space
    const [spaceId] = await trx('spaces').insert({
      space_name: spaceName,
      space_description: spaceDescription,
      space_slug: `spaces/${spaceSlug}`,
      avatar_url: avatarUrl,
      avatar_public_id: avatarPublicId,
      community_type: communityType,
      is_mature: isMature,
      created_by: req.user.userId,
      is_active: true,
      member_count: 1 // Creator auto-joins, so start with 1
    }).returning('id');

    // Insert space-topic relationships
    if (topics && topics.length > 0) {
      const spaceTopics = topics.map(topic => ({
        space_id: spaceId.id,
        topic_id: topic.id
      }));

      await trx('space_topics').insert(spaceTopics);
    }

    // Award EXP for space creation
    const expResult = await awardSpaceCreated(req.user.userId, spaceId.id, trx);
    if (!expResult.success) {
      console.warn('Failed to award EXP for space creation:', expResult.error);
    }

    // Auto-join the creator as owner
    await trx('space_members').insert({
      space_id: spaceId.id,
      user_id: req.user.userId,
      role: 'owner',
      joined_at: knex.fn.now()
    });

    // Commit transaction
    await trx.commit();

    // Fetch created space with the SAME format as MainContent expects
    space = await knex('spaces')
      .select('id', 'space_name', 'space_slug', 'avatar_url') // Same fields as maincontent.routes.js
      .where('id', spaceId.id)
      .first();

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
    if (trx) await trx.rollback();
  }

  res.status(status).json({
    success,
    status,
    error_message,
    space // Return in the same format as MainContent expects
  });
});



// GET popular spaces for search dropdown
router.get('/popular-spaces', async (_, res) => {
  let spaces = [];
  let error_message = '';
  let status = 200;
  let success = true;

  try {
    spaces = await knex('spaces')
      .select('id', 'space_name', 'avatar_url', 'member_count')
      .where('is_active', true)
      .orderBy('member_count', 'desc')
      .limit(10);
  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  } finally {
    res.status(status).json({ success, status, error_message, spaces });
  }
});

// GET user's joined spaces
router.get('/joined-spaces', checkAuth, async (req, res) => {
  let spaces = [];
  let error_message = '';
  let status = 200;
  let success = true;

  try {
    spaces = await knex('space_members')
      .join('spaces', 'space_members.space_id', 'spaces.id')
      .select(
        'spaces.id',
        'spaces.space_name',
        'spaces.space_slug',
        'spaces.avatar_url',
        'spaces.member_count',
        'space_members.role',
        'space_members.joined_at'
      )
      .where('space_members.user_id', req.user.userId)
      .where('spaces.is_active', true)
      .orderBy('space_members.joined_at', 'desc');

  } catch (error) {
    status = 500;
    error_message = error.message;
    success = false;
  } finally {
    res.status(status).json({ success, status, error_message, spaces });
  }
});

module.exports = router;
