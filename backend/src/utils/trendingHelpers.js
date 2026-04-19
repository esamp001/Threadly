/**
 * Calculates trending score for a space
 * This is used to determine space popularity based on members and threads
 * @param {number} memberCount - Current member count
 * @param {number} threadCount - Current thread count
 * @returns {number} - Calculated trending score
 */
const calculateTrendingScore = (memberCount, threadCount) => {
  return (memberCount * 1.0) + (threadCount * 0.5);
};

module.exports = {
  calculateTrendingScore
};
