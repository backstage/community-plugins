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
 * Automatically backfills the `ai_credits_used` / `total_ai_credits_used`
 * metrics (added in 202506200000_add_ai_credits_columns.js) for installations
 * that already had user-level data ingested before that column existed.
 *
 * GitHub started exposing `ai_credits_used` in the `users-1-day` report on
 * 2026-06-19. Any day on/after that date whose ingestion was previously
 * recorded as `success` and included the `users` component was ingested
 * without ever seeing this field, so `copilot_user_metrics.ai_credits_used`
 * and `copilot_daily_totals.total_ai_credits_used` are stuck at NULL for
 * those rows.
 *
 * `TaskManagementV2` decides which days need (re-)ingestion by checking
 * `copilot_ingestion_log` for a `success` row with the required components
 * (see `DatabaseHandlerV2.getMissingDays`). Deleting the log rows for the
 * affected days makes them look "missing" again, so the very next scheduled
 * gap-fill run (or a manual `/v2/backfill` call) will automatically
 * re-ingest them — no operator action required. `insertUserMetrics` and
 * `insertDailyTotals` merge `ai_credits_used` / `total_ai_credits_used` on
 * conflict, so re-ingestion updates the existing rows in place instead of
 * duplicating them.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const AI_CREDITS_INTRODUCED_DAY = '2026-06-19';

  await knex('copilot_ingestion_log')
    .where('status', 'success')
    .where('day', '>=', AI_CREDITS_INTRODUCED_DAY)
    .where('components_loaded', 'like', '%"users"%')
    .del();
};

/**
 * No-op: this migration only removes ingestion log rows to trigger a
 * re-ingestion. Restoring them isn't meaningful or necessary on rollback.
 *
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void knex;
};
