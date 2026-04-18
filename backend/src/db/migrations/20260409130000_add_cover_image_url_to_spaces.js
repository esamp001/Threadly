module.exports.up = async (knex) => {
  await knex.schema.alterTable('spaces', (table) => {
    table.string('cover_image_url');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('spaces', (table) => {
    table.dropColumn('cover_image_url');
  });
};
