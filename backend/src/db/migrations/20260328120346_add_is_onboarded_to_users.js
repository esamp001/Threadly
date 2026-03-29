exports.up = async (knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.boolean('is_onboarded').defaultTo(false);
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('is_onboarded');
  });
};