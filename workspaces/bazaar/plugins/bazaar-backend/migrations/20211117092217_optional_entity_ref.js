/*
 * Copyright 2021 The Backstage Authors
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

// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  if (knex.client.config.client.includes('sqlite3')) {
    await knex.schema.dropTable('metadata');
    await knex.schema.createTable('metadata', table => {
      table.increments('id').comment('Automatically generated unique ID');
      table.text('entity_ref').unique().comment('The ref of the entity');
      table.text('name').notNullable().comment('The name of the entity');
      table
        .text('community')
        .comment('Link to where the community can discuss ideas');
      table
        .text('description')
        .notNullable()
        .comment('The description of the Bazaar project');
      table
        .text('status')
        .defaultTo('proposed')
        .notNullable()
        .comment('The status of the Bazaar project');
      table
        .text('updated_at')
        .notNullable()
        .comment('Timestamp on ISO 8601 format when entity was last updated');
      table
        .text('size')
        .defaultTo('medium')
        .notNullable()
        .comment('The estimated magnitude of the project');
      table
        .text('start_date')
        .comment('Optional start date of the project (ISO 8601 format)');
      table
        .text('end_date')
        .comment('Optional end date of the project (ISO 8601 format)');
      table
        .text('responsible')
        .notNullable()
        .comment('Contact person of the project');
    });

    await knex.schema.dropTable('members');
    await knex.schema.createTable('members', table => {
      table
        .integer('item_id')
        .references('metadata.id')
        .onDelete('CASCADE')
        .comment('Id of the associated item');
      table
        .text('entity_ref')
        .references('metadata.entity_ref')
        .onDelete('CASCADE')
        .comment('The ref of the entity');
      table.text('user_id').notNullable().comment('The user id of the member');
      table
        .dateTime('join_date')
        .defaultTo(knex.fn.now())
        .notNullable()
        .comment('The timestamp when this member joined');
      table.text('picture').comment('Link to profile picture');
    });
  } else {
    await knex.schema.alterTable('metadata', table => {
      table.renameColumn('announcement', 'description');
      table.increments('id').comment('Automatically generated unique ID');
      table.string('entity_ref').nullable().alter();
    });

    await knex.schema.alterTable('members', table => {
      table
        .integer('item_id')
        .unsigned()
        .references('metadata.id')
        .onDelete('CASCADE')
        .comment('Id of the associated item');
      table.dropForeign('entity_ref');
      table.dropColumn('entity_ref');
    });
  }
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  if (knex.client.config.client.includes('sqlite3')) {
    await knex.schema.dropTable('metadata');
    await knex.schema.createTable('metadata', table => {
      table
        .text('entity_ref')
        .notNullable()
        .unique()
        .comment('The ref of the entity');
      table.text('name').notNullable().comment('The name of the entity');
      table
        .text('community')
        .comment('Link to where the community can discuss ideas');
      table
        .text('announcement')
        .notNullable()
        .comment('The announcement of the Bazaar project');
      table
        .text('status')
        .defaultTo('proposed')
        .notNullable()
        .comment('The status of the Bazaar project');
      table
        .text('updated_at')
        .notNullable()
        .comment('Timestamp on ISO 8601 format when entity was last updated');
      table
        .text('size')
        .defaultTo('medium')
        .notNullable()
        .comment('The estimated magnitude of the project');
      table
        .text('start_date')
        .comment('Optional start date of the project (ISO 8601 format)');
      table
        .text('end_date')
        .comment('Optional end date of the project (ISO 8601 format)');
      table
        .text('responsible')
        .notNullable()
        .comment('Contact person of the project');
    });

    await knex.schema.dropTable('members');
    await knex.schema.createTable('members', table => {
      table
        .text('entity_ref')
        .notNullable()
        .references('metadata.entity_ref')
        .onDelete('CASCADE')
        .comment('The ref of the entity');
      table.text('user_id').notNullable().comment('The user id of the member');
      table
        .dateTime('join_date')
        .defaultTo(knex.fn.now())
        .notNullable()
        .comment('The timestamp when this member joined');
      table.text('picture').comment('Link to profile picture');
    });
  } else {
    await knex.schema.alterTable('metadata', table => {
      table.renameColumn('description', 'announcement');
      table.string('entity_ref').notNullable().alter();
      table.dropColumn('id');
    });

    await knex.schema.alterTable('members', table => {
      table.dropColumn('item_id');
      table
        .text('entity_ref')
        .notNullable()
        .references('metadata.entity_ref')
        .onDelete('CASCADE')
        .comment('The ref of the entity');
    });
  }
};
