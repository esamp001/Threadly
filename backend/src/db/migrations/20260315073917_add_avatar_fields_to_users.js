exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.string('avatar_seed').nullable();
    table.text('avatar_options').nullable(); // JSON string
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('avatar_seed');
    table.dropColumn('avatar_options');
  });
};