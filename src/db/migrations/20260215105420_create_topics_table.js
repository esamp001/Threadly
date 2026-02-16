export function up(knex) {
    return knex.schema.createTable('topics', (table) => {
        table.increments('id').primary();       // Auto-incrementing ID
        table.string('name').notNullable();     // Topic name
        table.string('slug').notNullable().unique(); // URL-friendly identifier
        table.text('description');              // Optional description
        table.string('icon');                   // Optional icon (e.g., Remix Icon class)
        table.timestamps(true, true);           // created_at & updated_at
    });
}

export function down(knex) {
    return knex.schema.dropTableIfExists('topics');
}