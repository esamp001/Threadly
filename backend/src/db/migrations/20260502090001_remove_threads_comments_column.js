// Migration: 20260502090001_remove_threads_comments_column.js
/**
 * Removes redundant comments column from threads table
 * This migration cleans up database design since we now count comments directly from comments table
 */
module.exports.up = async (knex) => {
  await knex.schema.alterTable('threads', (table) => {
    // Remove redundant comments column
    table.dropColumn('comments');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('threads', (table) => {
    // Add back comments column for rollback
    table.integer('comments').defaultTo(0);
  });
};
