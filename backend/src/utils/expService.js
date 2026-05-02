/**
 * EXP Service - Centralized EXP awarding logic
 * This service handles EXP awarding with proper validation and transaction safety
 */
const db = require('../db/knex');
const { calculateLevel, getExpForAction, canGainExpToday } = require('./rankingHelpers');

/**
 * Award EXP to a user for a specific action
 * This is used internally by other routes to award EXP atomically
 * @param {number} userId - The user ID to award EXP to
 * @param {string} actionType - The type of action performed
 * @param {number} referenceId - Optional reference ID (thread_id, comment_id, etc.)
 * @param {object} trx - Optional database transaction
 * @returns {Promise<object>} - Promise resolving to the award result
 */
const awardExp = async (userId, actionType, referenceId = null, trx = null) => {
  const knexClient = trx || db;

  try {
    // Validate action type
    const expAmount = getExpForAction(actionType);
    if (expAmount === 0) {
      return { success: false, error: 'Invalid action type', expAwarded: 0 };
    }

    // Check daily EXP cap
    const today = new Date().toISOString().split('T')[0];
    const todayExp = await knexClient('user_exp_history')
      .where('user_id', userId)
      .whereRaw('DATE(created_at) = ?', [today])
      .sum('exp_amount as total')
      .first();

    const currentDailyExp = parseInt(todayExp.total) || 0;

    if (!canGainExpToday(currentDailyExp)) {
      return { success: false, error: 'Daily EXP cap reached', expAwarded: 0 };
    }

    // Get current user data
    const currentUser = await knexClient('users')
      .where('id', userId)
      .first();

    if (!currentUser) {
      return { success: false, error: 'User not found', expAwarded: 0 };
    }

    // Calculate new EXP and level
    const newExpPoints = currentUser.exp_points + expAmount;
    const newLevel = calculateLevel(newExpPoints);

    // Update user's EXP and level
    await knexClient('users')
      .where('id', userId)
      .update({
        exp_points: newExpPoints,
        level: newLevel,
        updated_at: new Date()
      });

    // Record EXP history
    await knexClient('user_exp_history').insert({
      user_id: userId,
      exp_amount: expAmount,
      action_type: actionType,
      reference_id: referenceId || null,
      created_at: new Date()
    });

    return {
      success: true,
      expAwarded: expAmount,
      totalExp: newExpPoints,
      newLevel,
      previousLevel: currentUser.level,
      levelUp: newLevel > currentUser.level,
      dailyExpEarned: currentDailyExp + expAmount
    };

  } catch (error) {
    console.error('Error awarding EXP:', error);
    return { success: false, error: 'Failed to award EXP', expAwarded: 0 };
  }
};

/**
 * Award EXP for thread creation
 * This is used when users create new threads
 * @param {number} userId - The user ID who created the thread
 * @param {number} threadId - The ID of the created thread
 * @param {object} trx - Optional database transaction
 * @returns {Promise<object>} - Promise resolving to the award result
 */
const awardThreadCreated = async (userId, threadId, trx = null) => {
  return await awardExp(userId, 'thread_created', threadId, trx);
};

/**
 * Award EXP for comment/reply creation
 * This is used when users post comments or replies
 * @param {number} userId - The user ID who created the comment
 * @param {number} commentId - The ID of the created comment
 * @param {number} parentId - The parent comment ID (null for top-level comments)
 * @param {object} trx - Optional database transaction
 * @returns {Promise<object>} - Promise resolving to the award result
 */
const awardCommentCreated = async (userId, commentId, parentId = null, trx = null) => {
  const actionType = parentId ? 'sub_reply_posted' : 'reply_posted';
  return await awardExp(userId, actionType, commentId, trx);
};

/**
 * Award EXP for space creation
 * This is used when users create new spaces
 * @param {number} userId - The user ID who created the space
 * @param {number} spaceId - The ID of the created space
 * @param {object} trx - Optional database transaction
 * @returns {Promise<object>} - Promise resolving to the award result
 */
const awardSpaceCreated = async (userId, spaceId, trx = null) => {
  return await awardExp(userId, 'space_created', spaceId, trx);
};

/**
 * Award EXP for daily login
 * This is used when users log in daily
 * @param {number} userId - The user ID who logged in
 * @param {object} trx - Optional database transaction
 * @returns {Promise<object>} - Promise resolving to the award result
 */
const awardDailyLogin = async (userId, trx = null) => {
  // Check if already awarded today
  const today = new Date().toISOString().split('T')[0];
  const existingLogin = await (trx || db)('user_exp_history')
    .where('user_id', userId)
    .where('action_type', 'daily_login')
    .whereRaw('DATE(created_at) = ?', [today])
    .first();

  if (existingLogin) {
    return { success: false, error: 'Daily login already awarded', expAwarded: 0 };
  }

  return await awardExp(userId, 'daily_login', null, trx);
};

module.exports = {
  awardExp,
  awardThreadCreated,
  awardCommentCreated,
  awardSpaceCreated,
  awardDailyLogin
};
