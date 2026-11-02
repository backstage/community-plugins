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
 * Adds the AI credits consumption metric introduced by GitHub on 2026-06-19.
 *
 * - copilot_user_metrics.ai_credits_used: per-user AI credits consumed for the
 *   day. This field is only available in the user-level (users-1-day) report.
 * - copilot_daily_totals.total_ai_credits_used: team-level rollup of the
 *   per-user AI credits. Team-level metrics are derived from user data, so this
 *   is only populated for team rows (org/enterprise reports do not expose it).
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('copilot_user_metrics', table => {
    table.float('ai_credits_used');
  });

  await knex.schema.alterTable('copilot_daily_totals', table => {
    table.float('total_ai_credits_used');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  // SQLite does not support DROP COLUMN reliably across versions — leave the
  // added columns in place on down (safe to ignore extras).
  const client = knex.client.config.client;
  if (client === 'sqlite3' || client === 'better-sqlite3') {
    return;
  }

  await knex.schema.alterTable('copilot_user_metrics', table => {
    table.dropColumn('ai_credits_used');
  });

  await knex.schema.alterTable('copilot_daily_totals', table => {
    table.dropColumn('total_ai_credits_used');
  });
};
