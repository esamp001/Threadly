/**
 * Create user_exp_history table for tracking EXP transactions
 * This table maintains an audit trail of all EXP gains and losses for each user
 */
module.exports.up = async (knex) => {
  await knex.schema.createTable('user_exp_history', (table) => {
    table.increments('id').primary();

    // Foreign key to users table
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // EXP transaction details
    table.integer('exp_amount').notNullable(); // Can be positive or negative
    table.string('action_type').notNullable(); // 'thread_created', 'reply_posted', 'upvote_received', etc.
    table.integer('reference_id').nullable(); // Optional: thread_id, comment_id, etc.

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes for performance
    table.index('user_id');
    table.index('action_type');
    table.index('created_at');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('user_exp_history');
};
