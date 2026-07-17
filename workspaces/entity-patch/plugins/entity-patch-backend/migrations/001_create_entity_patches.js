/*
 * Copyright 2026 The Backstage Authors
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

/**
 * Initializes a Knex table to persist entity patch data.
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('entity_patches', table => {
    table.increments('id').primary();
    table
      .string('entity_ref', 512)
      .notNullable()
      .comment('Backstage entity ref, e.g. component:default/payments-api');
    table
      .string('patch_name', 255)
      .notNullable()
      .comment('Patch slug from entityPatch.patches[].name config');
    table
      .text('data')
      .notNullable()
      .comment('JSON-encoded form field values for this patch');
    table
      .string('updated_by', 512)
      .nullable()
      .comment('userEntityRef of last editor');
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    table.unique(['entity_ref', 'patch_name']);
    table.index(['entity_ref']);
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('entity_patches');
};
