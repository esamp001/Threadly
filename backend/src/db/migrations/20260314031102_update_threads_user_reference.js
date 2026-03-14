/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    DELETE FROM threads 
    WHERE created_by NOT IN (SELECT id FROM users)
  `).then(() => {
    return knex.schema
      .alterTable('threads', function (table) {
        table.integer('created_by').unsigned().alter();
        table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');
      });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable('threads', function (table) {
      table.dropForeign('created_by');
    });
};