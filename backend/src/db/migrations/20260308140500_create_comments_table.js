module.exports.up = async (knex) => {
  await knex.schema.createTable('comments', (table) => {
    table.increments('id').primary();

    table.text('content').notNullable();

    table.integer('thread_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('threads')
      .onDelete('CASCADE');

    table.integer('parent_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('comments')
      .onDelete('CASCADE');

    // TODO: Add user reference when users table is created
    table.integer('created_by').unsigned().defaultTo(1); // Default user for now

    // Cached score fields
    table.integer('upvotes').defaultTo(0);
    table.integer('downvotes').defaultTo(0);
    table.integer('net_score').defaultTo(0);

    table.boolean('is_active').defaultTo(true);

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('thread_id');
    table.index('parent_id');
    // TODO: Add created_by index when users table exists
    table.index('net_score');
  });
};

module.exports.down = async (knex) => {
  // Check if table exists before dropping
  const hasCommentsTable = await knex.schema.hasTable('comments');
  if (hasCommentsTable) {
    await knex.schema.dropTable('comments');
  }
};
