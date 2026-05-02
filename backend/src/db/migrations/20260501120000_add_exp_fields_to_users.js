/**
 * Add EXP and level fields to users table
 * This migration adds experience points and level tracking for the ranking system
 */
module.exports.up = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.integer('exp_points').defaultTo(0).notNullable();
    table.integer('level').defaultTo(1).notNullable();
  });
};

module.exports.down = async (knex) => {
  await knex.schema.table('users', (table) => {
    table.dropColumn('exp_points');
    table.dropColumn('level');
  });
};
