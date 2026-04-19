/**
 * Add trending_score column to spaces table
 * This is used to track space popularity based on members and threads
 */
module.exports.up = async (knex) => {
  await knex.schema.table('spaces', (table) => {
    table.decimal('trending_score', 10, 2).defaultTo(0).notNullable();
    table.index('trending_score');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.table('spaces', (table) => {
    table.dropColumn('trending_score');
  });
};
