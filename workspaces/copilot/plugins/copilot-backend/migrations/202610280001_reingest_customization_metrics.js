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
 * GitHub began returning configured customization names on 2026-10-22.
 * Re-ingest only this bounded recent range so existing successful report days
 * are parsed into the new tables without reopening the full V2 history.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex('copilot_ingestion_log')
    .where('status', 'success')
    .where('day', '>=', '2026-10-22')
    .del();
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void knex;
};
