const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db/knex');

const router = express.Router();

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Get current user context
router.get('/context', authenticateToken, async (req, res) => {

  let user = [];
  let error_message = '';
  let success = true;
  let status = 200;

  try {
    user = await db('users')
      .select('id', 'email', 'username', 'bio', 'avatar_url', 'is_active', 'created_at')
      .where('id', req.user.userId)
      .first();

    if (!user) {
      success = false;
      error_message = 'User not found';
      status = 404;
    }

  } catch (error) {
    console.error('Error fetching user context:', error);
    success = false;
    error_message = 'Failed to fetch user data';
    status = 500;
  } finally {
    res.status(status).json({ success, error: error_message, user });
  }
});

router.post('/google', async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;

  try {
    // Check if user exists
    let user = await db('users').where({ email }).first();
    let isNewUser = false;

    if (!user) {
      // Create new user
      isNewUser = true;
      [user] = await db('users').insert({
        firebase_uid: uid,
        email,
        username: displayName,
        avatar_url: photoURL,
        created_at: new Date()
      }).returning('*');
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.json({
      token,
      userData: { ...user, password: null },
      isNewUser
    });
  } catch (error) {
    console.error('Authentication failed:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;