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
/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.table('metrics', table => {
    table
      .string('type', 50)
      .defaultTo('enterprise')
      .notNullable()
      .comment('Type of the metrics data: enterprise, organization');

    table.string('team_name', 255).nullable().comment('Name of the team');

    table.dropPrimary();

    table.unique(['day', 'type', 'team_name'], 'uk_day_type_team_name');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.table('metrics', table => {
    table.dropUnique(['day', 'type', 'team_name']);

    table.dropColumn('type');
    table.dropColumn('team_name');

    table.primary('day');
    table.index('day', 'idx_metrics_day');
  });
};
