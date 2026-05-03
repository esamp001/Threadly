import apiRequest from '../config/api';

/**
 * Frontend ranking system utility functions
 * This module handles ranking calculations and title determination for the frontend
 */

/**
 * Get user title based on their level
 * This is used to display the appropriate title badge for each level
 * @param {number} level - The user's current level
 * @returns {string} - The title corresponding to the level
 */
const getTitle = (level) => {
  const titles = {
    1: 'Newbie',
    2: 'Explorer',
    3: 'Contributor',
    4: 'Advocate',
    5: 'Engager',
    6: 'Collaborator',
    7: 'Influencer',
    8: 'Mentor',
    9: 'Leader',
    10: 'Pioneer',
    11: 'Visionary',
    12: 'Luminary',
    13: 'Sage',
    14: 'Master',
    15: 'Grandmaster'
  };

  return titles[level] || 'Newbie';
};

/**
 * Calculate EXP required for next level
 * This is used to show progression to users
 * @param {number} currentLevel - The user's current level
 * @param {number} currentExp - The user's current EXP points
 * @returns {object} - Object with progression details
 */
const getExpProgress = (currentLevel, currentExp) => {
  const levelThresholds = [
    0,      // Level 1
    50,     // Level 2
    120,    // Level 3
    220,    // Level 4
    350,    // Level 5
    500,    // Level 6
    700,    // Level 7
    950,    // Level 8
    1250,   // Level 9
    1600,   // Level 10
    2000,   // Level 11
    2450,   // Level 12
    2950,   // Level 13
    3500,   // Level 14
    4100    // Level 15
  ];

  const currentLevelExp = levelThresholds[currentLevel - 1] || 0;
  const nextLevelExp = levelThresholds[currentLevel] || null;

  if (!nextLevelExp) {
    // Max level reached
    return {
      currentLevelExp,
      nextLevelExp: null,
      expNeededForNextLevel: 0,
      expProgress: 100,
      isMaxLevel: true
    };
  }

  const expNeededForNextLevel = nextLevelExp - currentLevelExp;
  const expProgress = ((currentExp - currentLevelExp) / expNeededForNextLevel) * 100;

  return {
    currentLevelExp,
    nextLevelExp,
    expNeededForNextLevel,
    expProgress: Math.min(100, Math.max(0, expProgress)),
    isMaxLevel: false
  };
};

import eventEmitter from './eventEmitter';

/**
 * Award EXP to user via API call
 * This is used to grant experience points when users perform various actions
 * @param {string} actionType - The type of action performed
 * @param {number} referenceId - Optional reference ID (thread_id, comment_id, etc.)
 * @returns {Promise<object>} - Promise resolving to the API response
 */
const awardExp = async (actionType, referenceId = null) => {
  try {
    const token = localStorage.getItem('token');
    const response = await apiRequest('/api/exp/award', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        actionType,
        referenceId
      })
    });

    const result = await response.json();

    // Emit event for real-time updates if EXP was successfully awarded
    if (result.success) {
      eventEmitter.emit('exp-updated', {
        expAwarded: result.result?.expAwarded,
        newLevel: result.result?.newLevel,
        totalExp: result.result?.totalExp,
        actionType
      });
    }

    return result;
  } catch (error) {
    console.error('Error awarding EXP:', error);
    return { success: false, error: 'Failed to award EXP' };
  }
};

export { awardExp, getExpProgress, getTitle };

