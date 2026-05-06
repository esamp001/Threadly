/**
 * Seed file to update trending scores for existing spaces
 * This calculates trending scores based on member_count and thread_count
 */
const { calculateTrendingScore } = require('../../utils/trendingHelpers');

exports.seed = async function (knex) {
  // Get all spaces
  const spaces = await knex('spaces').select('id', 'member_count');

  // Update each space with its trending score
  for (const space of spaces) {
    // Count threads for this space
    const threadCountResult = await knex('threads')
      .where('space_id', space.id)
      .count('* as count')
      .first();
    const threadCount = parseInt(threadCountResult.count) || 0;

    // Calculate trending score
    const trendingScore = calculateTrendingScore(space.member_count || 0, threadCount);

    // Update space
    await knex('spaces')
      .where('id', space.id)
      .update({ trending_score: trendingScore });
  }
};
