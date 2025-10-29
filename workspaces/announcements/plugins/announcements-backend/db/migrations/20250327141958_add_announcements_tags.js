/*
 * Copyright 2025 The Backstage Authors
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
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  if (!(await knex.schema.hasTable('tags'))) {
    await knex.schema.createTable('tags', table => {
      table.string('slug').notNullable().primary().comment('Tag slug');
      table.string('title').notNullable().comment('Title of the tag');
    });
  }

  if (await knex.schema.hasTable('announcements')) {
    if (await knex.schema.hasColumn('announcements', 'tags')) {
      await knex.schema.alterTable('announcements', table => {
        table.dropColumn('tags');
      });
    }

    await knex.schema.alterTable('announcements', table => {
      table.jsonb('tags').comment('Array of tag slugs');
    });
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  if (await knex.schema.hasTable('announcements')) {
    if (await knex.schema.hasColumn('announcements', 'tags')) {
      await knex.schema.alterTable('announcements', table => {
        table.dropColumn('tags');
      });
    }
  }

  if (await knex.schema.hasTable('tags')) {
    await knex.schema.dropTable('tags');
  }
};
