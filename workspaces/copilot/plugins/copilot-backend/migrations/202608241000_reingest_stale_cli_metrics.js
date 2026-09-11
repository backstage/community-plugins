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
 * Forces re-ingestion of `copilot_metrics_by_cli` rows that were stored with
 * token sums stuck at `0`.
 *
 * `DatabaseHandlerV2.insertByCli` previously used `.onConflict(...).ignore()`
 * (see `DatabaseHandlerV2.ts`), so once a row existed for a given
 * `(day, metrics_type, entity_id, team_slug)` — even one written before the
 * `output_tokens_sum` / `prompt_tokens_sum` overflow fix, or before GitHub's
 * report reliably populated `token_usage`, or from a chunked insert that
 * partially failed — any later re-ingestion attempt for that same day was
 * silently discarded and the stale `0` values were never corrected. That
 * method has now been changed to `.merge([...])`, but existing stale rows
 * still need a fresh ingestion pass to actually pick up the fix, and
 * `TaskManagementV2.getMissingDays` only re-ingests days that don't already
 * have a `success` row in `copilot_ingestion_log` (`cli` is not tracked as
 * its own required component there).
 *
 * This migration deletes the `copilot_ingestion_log` rows for days where the
 * stored `copilot_metrics_by_cli` row shows real CLI activity
 * (`prompt_count`/`request_count`/`session_count` > 0) but both token sums
 * are `0` — a combination that only happens when token usage failed to be
 * recorded. Deleting the log entry makes `getMissingDays` treat the day as
 * missing again, so the next scheduled gap-fill run (or a manual
 * `/v2/backfill` call) automatically re-ingests it and, thanks to the merge
 * fix, overwrites the stale row in place.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const staleRows = await knex('copilot_metrics_by_cli')
    .where('output_tokens_sum', 0)
    .where('prompt_tokens_sum', 0)
    .where(builder =>
      builder
        .where('prompt_count', '>', 0)
        .orWhere('request_count', '>', 0)
        .orWhere('session_count', '>', 0),
    )
    .select('day', 'metrics_type', 'entity_id');

  for (const {
    day,
    metrics_type: metricsType,
    entity_id: entityId,
  } of staleRows) {
    await knex('copilot_ingestion_log')
      .where({ day, metrics_type: metricsType, entity_id: entityId })
      .where('status', 'success')
      .del();
  }
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
