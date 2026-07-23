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

// @ts-check

// The "latest rating/response per user" queries in DatabaseHandler used to
// determine recency by comparing `timestamp`, which on SQLite is populated
// via CURRENT_TIMESTAMP (1-second resolution). Two writes from the same user
// within the same second tie on `timestamp` and both get treated as current.
// An auto-incrementing id gives those queries an unambiguous tie-breaker.
//
// SQLite cannot ALTER TABLE ADD an autoincrementing primary key column onto
// an existing table, so on that dialect each table is rebuilt instead, with
// existing rows re-inserted in their original (rowid) order so the newly
// assigned ids preserve prior insertion order.

/**
 * @param { import("knex").Knex } knex
 * @param { import("knex").Knex.CreateTableBuilder } table
 */
function defineRatingsColumns(knex, table) {
  table
    .string('entity_ref')
    .notNullable()
    .comment('The ref of the entity being rated');
  table
    .string('user_ref')
    .notNullable()
    .comment('The user applying the rating');
  table.string('rating').notNullable().comment('The rating value');
  table
    .timestamp('timestamp')
    .defaultTo(knex.fn.now())
    .notNullable()
    .comment('When the rating was recorded');
}

/**
 * @param { import("knex").Knex } knex
 * @param { import("knex").Knex.CreateTableBuilder } table
 */
function defineResponsesColumns(knex, table) {
  table
    .string('entity_ref')
    .notNullable()
    .comment('The ref of the applicable entity');
  table.string('user_ref').notNullable().comment('The user responding');
  table.text('response').comment('The serialized response');
  table.text('comments').comment('Additional user comments');
  table
    .boolean('consent')
    .defaultTo(true)
    .notNullable()
    .comment('Whether user (if recorded) consents to being contacted');
  table
    .timestamp('timestamp')
    .defaultTo(knex.fn.now())
    .notNullable()
    .comment('When the response was recorded');
  table.text('link').comment('The entity URL link');
}

const TABLES = {
  ratings: {
    columns: ['entity_ref', 'user_ref', 'rating', 'timestamp'],
    define: defineRatingsColumns,
  },
  responses: {
    columns: [
      'entity_ref',
      'user_ref',
      'response',
      'comments',
      'consent',
      'timestamp',
      'link',
    ],
    define: defineResponsesColumns,
  },
};

/**
 * @param { import("knex").Knex } knex
 * @param { string } tableName
 * @param { { columns: string[], define: (knex: import("knex").Knex, table: import("knex").Knex.CreateTableBuilder) => void } } table
 */
async function addIdColumn(knex, tableName, { columns, define }) {
  if (knex.client.config.client.includes('sqlite')) {
    const tmpTableName = `${tableName}_pre_id_migration`;
    await knex.schema.renameTable(tableName, tmpTableName);
    await knex.schema.createTable(tableName, table => {
      table.increments('id').comment('Auto-incrementing id');
      define(knex, table);
    });
    const columnList = columns.join(', ');
    await knex.raw(
      `insert into ?? (${columnList}) select ${columnList} from ?? order by rowid`,
      [tableName, tmpTableName],
    );
    await knex.schema.dropTable(tmpTableName);
  } else {
    await knex.schema.alterTable(tableName, table => {
      table
        .increments('id', { primaryKey: false })
        .comment('Auto-incrementing id');
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @param { string } tableName
 */
async function dropIdColumn(knex, tableName) {
  await knex.schema.alterTable(tableName, table => {
    table.dropColumn('id');
  });
}

/**
 * @param { import("knex").Knex } knex
 */
exports.up = async function up(knex) {
  for (const [tableName, table] of Object.entries(TABLES)) {
    await addIdColumn(knex, tableName, table);
  }
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = async function down(knex) {
  for (const tableName of Object.keys(TABLES)) {
    await dropIdColumn(knex, tableName);
  }
};
