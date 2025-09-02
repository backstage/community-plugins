/*
 * Migration: Add until_date column to announcements table
 */

exports.up = async function(knex) {
  await knex.schema.alterTable('announcements', function(table) {
    table.timestamp('until_date').nullable();
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable('announcements', function(table) {
    table.dropColumn('until_date');
  });
};
