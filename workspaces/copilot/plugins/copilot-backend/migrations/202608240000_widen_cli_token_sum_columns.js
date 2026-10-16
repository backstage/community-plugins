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
 * Widens `copilot_metrics_by_cli.output_tokens_sum` and `.prompt_tokens_sum`
 * from `integer` (4-byte, max 2,147,483,647) to `bigint` (8-byte).
 *
 * These columns store per-day, per-entity sums of CLI token usage, which for
 * a large org can exceed the 32-bit signed integer range. On Postgres this
 * causes ingestion to fail with `value "..." is out of range for type
 * integer`. SQLite does not enforce fixed-width integer storage (values are
 * stored using as many bytes as needed, up to 64-bit), which is why this
 * only surfaces on Postgres-backed deployments.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('copilot_metrics_by_cli', table => {
    table.bigInteger('output_tokens_sum').alter();
    table.bigInteger('prompt_tokens_sum').alter();
  });
};

/**
 * Note: reverting to `integer` will fail (or truncate data) if any stored
 * value already exceeds the 32-bit signed integer range.
 *
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('copilot_metrics_by_cli', table => {
    table.integer('output_tokens_sum').alter();
    table.integer('prompt_tokens_sum').alter();
  });
};
