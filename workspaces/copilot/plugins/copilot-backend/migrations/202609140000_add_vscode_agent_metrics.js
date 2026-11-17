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
 * Adds support for the "VS Code Agents window" metrics GitHub introduced on
 * 2026-09-11 (see
 * https://github.blog/changelog/2026-09-11-add-vs-code-agents-to-copilot-usage-metrics/):
 *
 * - `daily_active_vscode_agent_users` on the org/enterprise daily-totals
 *   aggregate (mirrors the existing `daily_active_cli_users` column).
 * - `used_vscode_agent` on the per-user daily metrics row (mirrors
 *   `used_cli`).
 * - `copilot_metrics_by_vscode_agent`, a new team-level breakdown table
 *   storing `session_count`/`total_user_messages` per day/entity/team
 *   (mirrors `copilot_metrics_by_cli`).
 *
 * All new fields are optional/nullable, matching GitHub's backward-compatible
 * rollout — existing rows are unaffected until re-ingested.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('copilot_daily_totals', table => {
    table.integer('daily_active_vscode_agent_users');
  });

  await knex.schema.alterTable('copilot_user_metrics', table => {
    table.boolean('used_vscode_agent');
  });

  await knex.schema.createTable('copilot_metrics_by_vscode_agent', table => {
    table.increments('id').primary();
    table.date('day').notNullable();
    table.string('metrics_type').notNullable();
    table.string('entity_id').notNullable();
    table.string('team_slug').notNullable().defaultTo('');
    table.integer('session_count');
    table.integer('total_user_messages');
    table.unique(['day', 'metrics_type', 'entity_id', 'team_slug']);
  });

  await knex.schema.alterTable('copilot_metrics_by_vscode_agent', table => {
    table.index(
      ['metrics_type', 'entity_id', 'team_slug', 'day'],
      'idx_copilot_metrics_by_vscode_agent_type_entity_team_day',
    );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('copilot_metrics_by_vscode_agent');

  // SQLite does not support DROP COLUMN — leave the columns in place on down
  // (safe to ignore extras), matching the convention used by
  // 202506031200_add_missing_metric_columns.js.
  const client = knex.client.config.client;
  if (client === 'sqlite3' || client === 'better-sqlite3') {
    return;
  }

  await knex.schema.alterTable('copilot_daily_totals', table => {
    table.dropColumn('daily_active_vscode_agent_users');
  });

  await knex.schema.alterTable('copilot_user_metrics', table => {
    table.dropColumn('used_vscode_agent');
  });
};
