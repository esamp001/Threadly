module.exports.up = async (knex) => {
  await knex.schema.table('comments', (table) => {
    // Remove default value and add foreign key
    table.integer('created_by').alter().defaultTo(null);
    table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.table('comments', (table) => {
    table.dropForeign('created_by');
    table.integer('created_by').alter().defaultTo(1);
  });
};