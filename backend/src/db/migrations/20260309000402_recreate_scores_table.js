module.exports.up = async (knex) => {
  await knex.schema.createTable('scores', (table) => {
    table.increments('id').primary();

    table.integer('user_id').notNullable();

    table.integer('thread_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('threads')
      .onDelete('CASCADE');

    // 1 = upvote
    // -1 = downvote
    table.integer('vote_type').notNullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Prevent double voting
    table.unique(['user_id', 'thread_id']);

    // Performance indexes
    table.index('thread_id');
    table.index('user_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('scores');
};