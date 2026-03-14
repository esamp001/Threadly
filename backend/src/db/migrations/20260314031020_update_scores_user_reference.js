module.exports.up = async (knex) => {
  // 1. Remove rows that would violate the constraint
  await knex('threads')
    .whereNotIn('created_by', knex.select('id').from('users'))
    .del();

  // 2. Now the constraint will succeed
  await knex.schema.table('threads', (table) => {
    table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');
  });
};


module.exports.down = async (knex) => {
  await knex.schema.table('threads', (table) => {
    table.dropForeign('created_by');
  });
};
