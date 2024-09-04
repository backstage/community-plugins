/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = async function up(knex) {
  return await knex.schema.createTable('feedback', table => {
    table.string('feedbackId').notNullable();
    table.string('summary').notNullable();
    table.text('description');
    table.string('tag');
    table.string('projectId').notNullable();
    table.string('ticketUrl');
    table.enum('feedbackType', ['BUG', 'FEEDBACK']);
    table.string('createdBy').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.string('updatedBy').notNullable();
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.string('url').notNullable();
    table.string('userAgent').notNullable();
    table.index(['feedbackId', 'projectId'], 'feedbackId_projectId_index');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('feedback', table => {
    table.dropIndex(['feedbackId', 'projectId'], 'feedbackId_projectId_index');
  });
  return await knex.schema.dropTable('feedback');
};
