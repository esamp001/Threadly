// Migration: 20260502000000_add_phone_number_to_users.js
/**
 * Adds phone_number field to users table for phone authentication
 * This migration supports the new Firebase Phone Authentication feature
 */
module.exports.up = async (knex) => {
  await knex.schema.alterTable('users', (table) => {
    // Add phone_number field for phone authentication
    table.string('phone_number').unique().nullable();
    
    // Add index for faster phone number lookups
    table.index('phone_number');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('users', (table) => {
    // Remove phone_number field and index
    table.dropIndex('phone_number');
    table.dropColumn('phone_number');
  });
};
