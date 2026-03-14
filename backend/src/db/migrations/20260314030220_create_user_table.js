// Migration: 20260314000000_create_users_table.js
module.exports.up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();

    // Firebase integration
    table.string('firebase_uid').unique().nullable();

    // Basic user info
    table.string('email').unique().notNullable();
    table.string('username').unique().nullable();
    table.string('password').nullable(); // For future email/password auth

    // Profile
    table.text('bio').nullable();
    table.string('avatar_url').nullable();

    // Status
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('email');
    table.index('firebase_uid');
    table.index('username');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('users');
};