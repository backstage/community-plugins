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
const isPg = knex => knex.client.config.client === 'pg';

exports.up = async function up(knex) {
  if (isPg(knex)) {
    await knex.raw(`
      CREATE OR REPLACE FUNCTION trigger_set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  await knex.schema.createTable('pointing_poker_sessions', table => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.text('description').nullable();
    table.string('created_by').notNullable();
    table.string('created_by_name').notNullable();
    table.uuid('current_story_id').nullable();
    table.string('team_ref').nullable();
    table.string('status').notNullable().defaultTo('pending');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('pointing_poker_stories', table => {
    table.uuid('id').primary();
    table
      .uuid('session_id')
      .notNullable()
      .references('id')
      .inTable('pointing_poker_sessions')
      .onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description').nullable();
    table.string('estimate').nullable();
    table.string('ticket_key').nullable();
    table.boolean('revealed').notNullable().defaultTo(false);
    table.string('state').notNullable().defaultTo('pending');
    table.timestamp('started_at').nullable();
    table.integer('duration_seconds').notNullable().defaultTo(0);
    table
      .uuid('parent_story_id')
      .nullable()
      .references('id')
      .inTable('pointing_poker_stories')
      .onDelete('CASCADE');
    table.float('sort').notNullable().defaultTo(0);
    table.string('presenter_user_id').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('pointing_poker_votes', table => {
    table.uuid('id').primary();
    table
      .uuid('story_id')
      .notNullable()
      .references('id')
      .inTable('pointing_poker_stories')
      .onDelete('CASCADE');
    table.string('user_id').notNullable();
    table.string('user_name').notNullable();
    table.string('value').notNullable();
    table.timestamp('voted_at').notNullable().defaultTo(knex.fn.now());
    table.unique(['story_id', 'user_id']);
  });

  await knex.schema.createTable('pointing_poker_participants', table => {
    table.uuid('id').primary();
    table
      .uuid('session_id')
      .notNullable()
      .references('id')
      .inTable('pointing_poker_sessions')
      .onDelete('CASCADE');
    table.string('user_id').notNullable();
    table.string('user_name').notNullable();
    table.string('role').notNullable();
    table.string('avatar_style').nullable();
    table.string('avatar_seed').nullable();
    table.timestamp('joined_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('last_active_at').notNullable().defaultTo(knex.fn.now());
    table.unique(['session_id', 'user_id']);
  });

  await knex.schema.createTable('pointing_poker_team_queries', table => {
    table.string('team_ref').primary();
    table.text('query').notNullable();
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('pointing_poker_team_cards', table => {
    table.string('team_ref').primary();
    table.text('cards').notNullable();
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('pointing_poker_avatar_prefs', table => {
    table.string('user_ref').primary();
    table.string('avatar_seed').notNullable();
    table.string('avatar_style').notNullable();
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('pointing_poker_avatar_prefs');
  await knex.schema.dropTableIfExists('pointing_poker_team_cards');
  await knex.schema.dropTableIfExists('pointing_poker_team_queries');
  await knex.schema.dropTableIfExists('pointing_poker_votes');
  await knex.schema.dropTableIfExists('pointing_poker_participants');
  await knex.schema.dropTableIfExists('pointing_poker_stories');
  await knex.schema.dropTableIfExists('pointing_poker_sessions');
};
