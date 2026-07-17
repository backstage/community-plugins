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
 * Adds missing performance indexes to V2 tables.
 *
 * Problem: All V2 tables have unique constraints with `day` as the leading
 * column (e.g. UNIQUE(day, metrics_type, entity_id, team_slug)).  Every read
 * query filters by `metrics_type` + `entity_id` first, then applies a date
 * range, so the existing unique index is largely unusable for reads — the DB
 * must scan every row in the day-ordered index looking for the right entity.
 *
 * Fix: Add a secondary composite index on (metrics_type, entity_id, team_slug,
 * day) for all main metrics tables.  The leading equality columns let the
 * database jump straight to the relevant partition and then range-scan by day.
 *
 * Additional fixes:
 * - copilot_ingestion_log: add (metrics_type, entity_id, status, day) so
 *   getLastIngestedDay / getMissingDays can filter on status without a full scan.
 * - copilot_user_teams: add (metrics_type, entity_id, team_slug) for the
 *   getTeams GROUP-BY query, and (user_id, day, metrics_type, entity_id) for
 *   the join used internally during team aggregation at ingest time.
 * - copilot_user_metrics: add (metrics_type, entity_id, day) to support the
 *   primary read filter used during team aggregation at ingest time.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  // ── Main metrics tables ──────────────────────────────────────────────────
  // All share the same read pattern: WHERE metrics_type = ? AND entity_id = ?
  // [AND team_slug = ?] AND day BETWEEN ? AND ?
  const mainTables = [
    'copilot_daily_totals',
    'copilot_pr_metrics',
    'copilot_metrics_by_feature',
    'copilot_metrics_by_ide',
    'copilot_metrics_by_language_feature',
    'copilot_metrics_by_model_feature',
    'copilot_metrics_by_language_model',
  ];

  for (const tableName of mainTables) {
    await knex.schema.alterTable(tableName, table => {
      // Covers both team-filtered and unfiltered range queries.
      // For unfiltered queries the DB still benefits from the leading
      // (metrics_type, entity_id) equality match before scanning by day.
      table.index(
        ['metrics_type', 'entity_id', 'team_slug', 'day'],
        `idx_${tableName}_type_entity_team_day`,
      );
    });
  }

  // ── copilot_user_metrics ─────────────────────────────────────────────────
  // Team aggregation at ingest time: WHERE metrics_type=? AND entity_id=? AND day BETWEEN ?
  await knex.schema.alterTable('copilot_user_metrics', table => {
    table.index(
      ['metrics_type', 'entity_id', 'day'],
      'idx_user_metrics_type_entity_day',
    );
  });

  // ── copilot_user_teams ───────────────────────────────────────────────────
  // getTeams: WHERE metrics_type=? AND entity_id=? [AND day BETWEEN ?]
  //           GROUP BY team_slug
  await knex.schema.alterTable('copilot_user_teams', table => {
    table.index(
      ['metrics_type', 'entity_id', 'team_slug'],
      'idx_user_teams_type_entity_team',
    );

    // Team aggregation join at ingest time: ON user_id=? AND day=? AND metrics_type=? AND entity_id=?
    table.index(
      ['user_id', 'day', 'metrics_type', 'entity_id'],
      'idx_user_teams_user_day_type_entity',
    );
  });

  // ── copilot_ingestion_log ────────────────────────────────────────────────
  // getLastIngestedDay / getMissingDays:
  //   WHERE metrics_type=? AND entity_id=? AND status='success'
  //   [AND day BETWEEN ? AND ?]  ORDER BY day DESC
  await knex.schema.alterTable('copilot_ingestion_log', table => {
    table.index(
      ['metrics_type', 'entity_id', 'status', 'day'],
      'idx_ingestion_log_type_entity_status_day',
    );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  const mainTables = [
    'copilot_daily_totals',
    'copilot_pr_metrics',
    'copilot_metrics_by_feature',
    'copilot_metrics_by_ide',
    'copilot_metrics_by_language_feature',
    'copilot_metrics_by_model_feature',
    'copilot_metrics_by_language_model',
  ];

  for (const tableName of mainTables) {
    await knex.schema.alterTable(tableName, table => {
      table.dropIndex([], `idx_${tableName}_type_entity_team_day`);
    });
  }

  await knex.schema.alterTable('copilot_user_metrics', table => {
    table.dropIndex([], 'idx_user_metrics_type_entity_day');
  });

  await knex.schema.alterTable('copilot_user_teams', table => {
    table.dropIndex([], 'idx_user_teams_type_entity_team');
    table.dropIndex([], 'idx_user_teams_user_day_type_entity');
  });

  await knex.schema.alterTable('copilot_ingestion_log', table => {
    table.dropIndex([], 'idx_ingestion_log_type_entity_status_day');
  });
};
