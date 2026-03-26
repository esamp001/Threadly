// Add to your latest migration file
exports.up = function (knex) {
  return knex.schema.createTable('comment_votes', function (table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('comment_id').unsigned().notNullable()
      .references('id').inTable('comments').onDelete('CASCADE');
    // 1 = upvote
    // -1 = downvote
    table.integer('vote_type').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Prevent double voting
    table.unique(['comment_id', 'user_id']);

    // Performance indexes
    table.index('comment_id');
    table.index('user_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('comment_votes');
};
