// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('categories', table => {
    table.comment('The table for announcement categories.');
    table.string('slug').notNullable().primary().comment('Category slug');
    table.string('title').notNullable().comment('Title of the category.');
  });

  await knex.schema.alterTable('announcements', table => {
    table.string('category').comment('Announcement category');

    table
      .foreign('category', 'category_fk')
      .references('slug')
      .inTable('categories')
      .onDelete('SET NULL');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('announcements', table => {
    table.dropForeign('category', 'category_fk');
    table.dropColumn('category');
  });

  await knex.schema.dropTable('categories');
};
