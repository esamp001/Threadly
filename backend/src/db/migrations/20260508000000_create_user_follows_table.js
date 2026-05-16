/**
 * Create user_follows table
 * This migration creates the table for tracking user follow relationships
 */
module.exports.up = async (knex) => {
  await knex.schema.createTable('user_follows', (table) => {
    table.increments('id').primary();
    
    // User who is following
    table.integer('follower_id').unsigned().notNullable();
    table.foreign('follower_id').references('id').inTable('users').onDelete('CASCADE');
    
    // User being followed
    table.integer('following_id').unsigned().notNullable();
    table.foreign('following_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Timestamp
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Prevent duplicate follows and self-follows
    table.unique(['follower_id', 'following_id']);
    
    // Indexes for performance
    table.index('follower_id');
    table.index('following_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('user_follows');
};
