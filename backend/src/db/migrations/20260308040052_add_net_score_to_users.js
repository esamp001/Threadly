module.exports.up = async (knex) => {
  // Check if column exists first
  const hasNetScore = await knex.schema.hasColumn('threads', 'net_score');
  if (!hasNetScore) {
    await knex.schema.table('threads', (table) => {
      table.integer('net_score').defaultTo(0);
      table.index('net_score');
    });
  }
};

module.exports.down = async (knex) => {
  await knex.schema.table('threads', (table) => {
    table.dropIndex('net_score');
    table.dropColumn('net_score');
  });
};