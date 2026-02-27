export const up = async (knex) => {
  await knex.schema.createTable('threads', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.integer('space_id').unsigned().notNullable().references('id').inTable('spaces').onDelete('CASCADE');
    table.integer('created_by').unsigned().notNullable();
    table.integer('upvotes').defaultTo(0);
    table.integer('downvotes').defaultTo(0);
    table.integer('comments').defaultTo(0);
    table.integer('shares').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Foreign key constraints
    // table.foreign('space_id').references('id').inTable('spaces').onDelete('CASCADE');
    // table.foreign('created_by').references('id').inTable('users').onDelete('CASCADE');

    // Indexes for performance
    table.index('space_id');
    table.index('created_by');
    table.index('created_at');
    table.index('upvotes');
    table.index('comments');
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable('threads');
};