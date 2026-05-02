/**
 * Ranking system utility functions for EXP calculation and level/title determination
 * This module handles all ranking-related calculations and user progression logic
 */

/**
 * Calculate user level based on EXP points
 * This is used to determine user level from their accumulated experience points
 * @param {number} expPoints - The total EXP points a user has
 * @returns {number} - The calculated level (1-15+)
 */
const calculateLevel = (expPoints) => {
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

  let level = 1;
  for (let i = levelThresholds.length - 1; i >= 0; i--) {
    if (expPoints >= levelThresholds[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
};

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
 * @returns {object} - Object with currentLevelExp and nextLevelExp
 */
const getExpProgress = (currentLevel) => {
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

  return {
    currentLevelExp,
    nextLevelExp,
    expNeededForNextLevel: nextLevelExp ? nextLevelExp - currentLevelExp : 0
  };
};

/**
 * Get EXP amount for specific action
 * This is used to determine how much EXP to award for different user actions
 * @param {string} actionType - The type of action performed
 * @returns {number} - The EXP amount to award
 */
const getExpForAction = (actionType) => {
  const expValues = {
    'thread_created': 10,
    'thread_upvote': 2,
    'thread_helpful': 15,
    'thread_pinned': 30,
    'reply_posted': 5,
    'reply_upvote': 1,
    'sub_reply_posted': 3,
    'daily_login': 3,
    'first_post_daily': 2,
    'space_created': 20,
    'accepted_answer': 20,
    'moderation_approved': 7
  };

  return expValues[actionType] || 0;
};

/**
 * Check daily EXP cap for user
 * This is used to prevent abuse and ensure fair progression
 * @param {number} userId - The user ID to check
 * @param {number} currentExpGained - EXP already gained today
 * @returns {boolean} - Whether user can still gain EXP today
 */
const canGainExpToday = (currentExpGained, dailyCap = 150) => {
  return currentExpGained < dailyCap;
};

module.exports = {
  calculateLevel,
  getTitle,
  getExpProgress,
  getExpForAction,
  canGainExpToday
};
