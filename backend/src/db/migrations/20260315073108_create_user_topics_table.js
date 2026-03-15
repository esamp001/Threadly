module.exports.up = async (knex) => {
  await knex.schema.createTable('user_topics', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.integer('topic_id').unsigned().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Foreign keys
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE');

    // Ensure unique combination
    table.unique(['user_id', 'topic_id']);
  });
};

module.exports.down = async (knex) => {
  await knex.schema.dropTable('user_topics');
};