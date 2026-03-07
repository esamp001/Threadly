module.exports.up = async (knex) => {
  await knex.schema.createTable('spaces', (table) => {
    table.increments('id').primary();
    table.string('space_name').notNullable();
    table.text('space_description');
    table.string('space_slug').unique().notNullable();
    table.string('avatar_url');
    table.string('avatar_public_id');
    table.enu('community_type', ['public', 'restricted', 'private']).defaultTo('public');
    table.boolean('is_mature').defaultTo(false);
    table.integer('created_by').unsigned().notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes for performance
    table.index('space_slug');
    table.index('created_by');
    table.index('community_type');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('spaces');
};