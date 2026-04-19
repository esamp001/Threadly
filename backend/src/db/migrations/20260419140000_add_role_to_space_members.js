/**
 * Add role column to space_members table
 * This column tracks the user's role within a space (owner, moderator, or member)
 */
module.exports.up = async (knex) => {
  await knex.schema.table('space_members', (table) => {
    table.enu('role', ['owner', 'moderator', 'member']).defaultTo('member').notNullable();
  });
};

module.exports.down = async (knex) => {
  await knex.schema.table('space_members', (table) => {
    table.dropColumn('role');
  });
};
