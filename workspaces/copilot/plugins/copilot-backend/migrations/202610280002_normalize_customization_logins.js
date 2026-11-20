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
 * User customization queries compare normalized GitHub logins directly so
 * their composite indexes include both the login and requested day range.
 * Normalize rows that may have been stored before write-time normalization.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex('copilot_customization_metrics').update({
    user_login: knex.raw('LOWER(user_login)'),
  });
  await knex('copilot_customization_summaries').update({
    user_login: knex.raw('LOWER(user_login)'),
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void knex;
};
