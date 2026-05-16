module.exports.up = async (knex) => {
  await knex.schema.alterTable('comments', (table) => {
    table.timestamp('deleted_at').nullable();
    table.integer('deleted_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('comments', (table) => {
    table.dropColumn('deleted_at');
    table.dropColumn('deleted_by');
  });
};
