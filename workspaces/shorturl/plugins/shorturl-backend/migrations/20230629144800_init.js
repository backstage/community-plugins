// code based on https://github.com/shailahir/backstage-plugin-shorturl-backend/

// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('shorturl', table => {
    table.comment('The table to store short url and long url mapping');

    table.string('short_id').notNullable().comment('The generated short id');
    table.text('full_url').notNullable().comment('Full Url');
    table.bigInteger('usage_count').notNullable().comment('usage');
    table.primary(['short_id']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('shorturl');
};
