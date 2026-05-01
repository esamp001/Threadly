/**
 * Create space_rules table
 * This table stores rules for each space, allowing owners to manage space-specific guidelines
 */
module.exports.up = async (knex) => {
  await knex.schema.createTable('space_rules', (table) => {
    table.increments('id').primary();
    table.integer('space_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('spaces')
      .onDelete('CASCADE');
    table.text('rule_text').notNullable();
    table.integer('order_index').defaultTo(0); // For ordering rules
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('space_id');
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('space_rules');
};
