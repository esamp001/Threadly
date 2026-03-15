exports.up = function (knex) {
  return knex.schema.table('users', function (table) {
    table.string('gender').nullable(); // nullable() allows existing records
  });
};

exports.down = function (knex) {
  return knex.schema.table('users', function (table) {
    table.dropColumn('gender');
  });
};