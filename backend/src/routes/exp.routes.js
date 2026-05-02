/**
 * Experience (EXP) system routes
 * Handles EXP awarding, tracking, and user progression
 */
const express = require('express');
const router = express.Router();
const db = require('../db/knex');
const { checkAuth } = require('../middleware/checkAuth');
const { calculateLevel, getExpForAction, canGainExpToday } = require('../utils/rankingHelpers');

/**
 * Award EXP to a user for a specific action
 * This is used to grant experience points when users perform various actions
 */
router.post('/award', checkAuth, async (req, res) => {
  const { actionType, referenceId } = req.body;
  const userId = req.user.userId;

  let success = true;
  let error_message = '';
  let status = 200;
  let result = null;

  try {
    // Validate action type
    const expAmount = getExpForAction(actionType);
    if (expAmount === 0) {
      success = false;
      error_message = 'Invalid action type';
      status = 400;
      return;
    }

    // Check daily EXP cap
    const today = new Date().toISOString().split('T')[0];
    const todayExp = await db('user_exp_history')
      .where('user_id', userId)
      .whereRaw('DATE(created_at) = ?', [today])
      .sum('exp_amount as total')
      .first();

    const currentDailyExp = parseInt(todayExp.total) || 0;

    if (!canGainExpToday(currentDailyExp)) {
      success = false;
      error_message = 'Daily EXP cap reached';
      status = 429;
      return;
    }

    // Use transaction for atomic operations
    await db.transaction(async (trx) => {
      // Update user's EXP and level
      const currentUser = await trx('users')
        .where('id', userId)
        .first();

      const newExpPoints = currentUser.exp_points + expAmount;
      const newLevel = calculateLevel(newExpPoints);

      await trx('users')
        .where('id', userId)
        .update({
          exp_points: newExpPoints,
          level: newLevel,
          updated_at: new Date()
        });

      // Record EXP history
      await trx('user_exp_history').insert({
        user_id: userId,
        exp_amount: expAmount,
        action_type: actionType,
        reference_id: referenceId || null,
        created_at: new Date()
      });

      result = {
        expAwarded: expAmount,
        totalExp: newExpPoints,
        newLevel,
        dailyExpEarned: currentDailyExp + expAmount
      };
    });

  } catch (error) {
    console.error('Error awarding EXP:', error);
    success = false;
    error_message = 'Failed to award EXP';
    status = 500;
  } finally {
    res.status(status).json({ success, error: error_message, result });
  }
});

/**
 * Get user's EXP history
 * This is used to display a user's EXP progression and activity history
 */
router.get('/history', checkAuth, async (req, res) => {
  const userId = req.user.userId;
  const { limit = 50, offset = 0 } = req.query;

  let success = true;
  let error_message = '';
  let status = 200;
  let history = [];

  try {
    history = await db('user_exp_history')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .select('*');

  } catch (error) {
    console.error('Error fetching EXP history:', error);
    success = false;
    error_message = 'Failed to fetch EXP history';
    status = 500;
  } finally {
    res.status(status).json({ success, error: error_message, history });
  }
});

/**
 * Get user's current EXP stats
 * This is used to display current level, EXP, and progression
 */
router.get('/stats', checkAuth, async (req, res) => {
  const userId = req.user.userId;

  let success = true;
  let error_message = '';
  let status = 200;
  let stats = {};

  try {
    const user = await db('users')
      .where('id', userId)
      .first();

    if (!user) {
      success = false;
      error_message = 'User not found';
      status = 404;
      return;
    }

    // Get today's EXP
    const today = new Date().toISOString().split('T')[0];

    const todayExp = await db('user_exp_history')
      .where('user_id', userId)
      .whereRaw('DATE(created_at) = ?', [today])
      .sum('exp_amount as total')
      .first();

    stats = {
      currentExp: user.exp_points,
      currentLevel: user.level,
      todayExpGained: parseInt(todayExp.total) || 0,
      dailyCapRemaining: Math.max(0, 150 - (parseInt(todayExp.total) || 0))
    };

  } catch (error) {
    console.error('Error fetching EXP stats:', error);
    success = false;
    error_message = 'Failed to fetch EXP stats';
    status = 500;
  } finally {
    res.status(status).json({ success, error: error_message, stats });
  }
});

module.exports = router;
