/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
