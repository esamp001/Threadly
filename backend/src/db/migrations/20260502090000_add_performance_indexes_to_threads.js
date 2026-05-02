module.exports.up = async (knex) => {
  // Add missing indexes for better filtering performance
  await knex.schema.alterTable('threads', (table) => {
    table.index('created_at'); // for sorting by latest
    table.index('comments'); // for hot filter calculation
    table.index(['is_active', 'created_at']); // composite index for active threads
    table.index(['is_active', 'net_score']); // composite index for top filter
  });
};

module.exports.down = async (knex) => {
  await knex.schema.alterTable('threads', (table) => {
    table.dropIndex('created_at');
    table.dropIndex('comments');
    table.dropIndex(['is_active', 'created_at']);
    table.dropIndex(['is_active', 'net_score']);
  });
};
