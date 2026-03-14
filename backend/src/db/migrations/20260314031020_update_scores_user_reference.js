module.exports.up = async (knex) => {
  await knex.schema.table('threads', (table) => {
    table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.table('threads', (table) => {
    table.dropForeign('created_by');
  });
};