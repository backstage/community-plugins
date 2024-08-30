/**
 * up - runs migration.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('oauth-mapping', table => {
    table.string('backstageID').primary();
    table.text('mtaOAuthRefreshToken'); // Changed from string to text
  });
  await knex.schema.createTable('entity-application-mapping', table => {
    table.string('entityUID').primary();
    table.integer('mtaApplication');
  });
};

/**
 * down - reverts(undo) migration.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('oauth-mapping');
  await knex.schema.dropTable('entity-application-mapping');
};
