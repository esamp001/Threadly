/**
 * Create space_members table
 * This table tracks which users are members of which spaces
 */
module.exports.up = async (knex) => {
  await knex.schema.createTable('space_members', (table) => {
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
    
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    
    // Prevent duplicate memberships
    table.unique(['space_id', 'user_id']);
    
    // Performance indexes
    table.index('space_id');
    table.index('user_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('space_members');
};
