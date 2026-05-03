const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');
const { awardDailyLogin } = require('../utils/expService');
const { sendMagicLinkEmail } = require('../utils/emailService');

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
      .select('id', 'email', 'username', 'bio', 'avatar_url', 'avatar_seed', 'avatar_options', 'is_active', 'created_at', 'is_onboarded', 'exp_points', 'level')
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

    // Award daily login EXP for returning users
    if (!isNewUser) {
      try {
        const expResult = await awardDailyLogin(user.id);
        if (!expResult.success) {
          console.warn('Failed to award daily login EXP:', expResult.error);
        }
      } catch (error) {
        console.warn('Error awarding daily login EXP:', error.message);
      }
    }

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

router.post('/magic-link', async (req, res) => {
  const { email } = req.body;

  try {
    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if user exists
    let user = await db('users').where({ email }).first();
    let isNewUser = false;

    if (!user) {
      // Create new user for magic link authentication
      isNewUser = true;
      [user] = await db('users').insert({
        email,
        username: email.split('@')[0], // Use part before @ as username
        created_at: new Date()
      }).returning('*');
    }

    // Generate a unique token for magic link
    const magicToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'magic-link'
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Link expires in 15 minutes
    );

    console.log('Magic Token:', magicToken);

    // Create magic link URL
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? 'https://threadly-xfzn.onrender.com'
      : 'http://localhost:5173';

    console.log('Frontend URL:', frontendUrl);

    const magicLink = `${frontendUrl}/auth/magic-link?token=${magicToken}`;

    console.log('Magic Link:', magicLink);

    // Send magic link email with timeout handling
    await sendMagicLinkEmail(email, magicLink, user.username);

    console.log('Email sent successfully');

    res.json({
      message: 'Email sent successfully',
      // For development: return the link for testing
      ...(process.env.NODE_ENV === 'development' && { magicLink })
    });

  } catch (error) {
    console.error('Email generation failed:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.post('/magic-link/verify', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the magic link token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'magic-link') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Get user from database
    const user = await db('users').where({ id: decoded.userId }).first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate JWT token for session
    const sessionToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    // Award daily login EXP for returning users
    const isNewUser = !user.last_login;
    if (!isNewUser) {
      try {
        const expResult = await awardDailyLogin(user.id);
        if (!expResult.success) {
          console.warn('Failed to award daily login EXP:', expResult.error);
        }
      } catch (error) {
        console.warn('Error awarding daily login EXP:', error.message);
      }
    }

    // Update last login
    await db('users')
      .where('id', user.id)
      .update({ last_login: new Date() });

    res.json({
      token: sessionToken,
      userData: { ...user, password: null },
      isNewUser: !user.is_onboarded
    });

  } catch (error) {
    console.error('Magic link verification failed:', error);
    res.status(400).json({ error: 'Invalid or expired magic link' });
  }
});

// POST - Logout user
router.post('/logout', checkAuth, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    // This only runs if something unexpected breaks
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

module.exports = router;