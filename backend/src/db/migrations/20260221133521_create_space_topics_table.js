module.exports.up = async (knex) => {
  await knex.schema.createTable('space_topics', (table) => {
    table.increments('id').primary();
    table.integer('space_id').unsigned().notNullable();
    table.integer('topic_id').unsigned().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('space_id').references('id').inTable('spaces').onDelete('CASCADE');
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE');

    // Ensure unique combination
    table.unique(['space_id', 'topic_id']);
  });
}

module.exports.down = async (knex) => {
  await knex.schema.dropTable('space_topics');
}