module.exports.up = async (knex) => {
  // 1. First, change the column to allow nulls/remove default
  await knex.schema.table('comments', (table) => {
    table.integer('created_by').nullable().alter().defaultTo(null);
  });

  // 2. IMPORTANT: Update any existing rows that point to a non-existent user
  // This sets them to NULL so they don't break the foreign key check
  await knex('comments')
    .whereNotIn('created_by', knex.select('id').from('users'))
    .update({ created_by: null });

  // 3. Now add the foreign key safely
  await knex.schema.table('comments', (table) => {
    table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');
  });
};

module.exports.down = async (knex) => {
  // Drop foreign key first
  await knex.schema.table('comments', (table) => {
    table.dropForeign('created_by');
  });

  // Then restore the column to its previous state
  await knex.schema.table('comments', (table) => {
    table.integer('created_by').notNullable().alter().defaultTo(1);
  });
};