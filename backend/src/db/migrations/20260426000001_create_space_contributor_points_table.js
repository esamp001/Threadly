/**
 * Create space_contributor_points table
 * This table tracks space-specific contributor points with incremental updates on actions
 */
module.exports.up = async (knex) => {
  await knex.schema.createTable('space_contributor_points', (table) => {
    table.increments('id').primary();
    table.integer('space_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('spaces')
      .onDelete('CASCADE');
    table.integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.integer('points').defaultTo(0); // Total points for this space
    table.integer('posts_count').defaultTo(0); // Number of posts in this space
    table.integer('comments_count').defaultTo(0); // Number of comments in this space
    table.integer('upvotes_received').defaultTo(0); // Total upvotes received in this space
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['space_id', 'user_id']);
    table.index('space_id');
    table.index('user_id');
    table.index('points');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('space_contributor_points');
};
