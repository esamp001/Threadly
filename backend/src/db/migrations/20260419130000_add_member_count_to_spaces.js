/**
 * Add member_count column to spaces table
 * This column tracks the total number of members for each space
 */
module.exports.up = async (knex) => {
  await knex.schema.table('spaces', (table) => {
    table.integer('member_count').defaultTo(0).notNullable();
  });
};

module.exports.down = async (knex) => {
  await knex.schema.table('spaces', (table) => {
    table.dropColumn('member_count');
  });
};
