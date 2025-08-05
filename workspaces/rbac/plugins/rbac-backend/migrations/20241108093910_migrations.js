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

exports.up = async function up(knex) {
  const casbinExists = await knex.schema.hasTable('casbin_rule');
  if (casbinExists) {
    await knex('casbin_rule')
      .whereNotNull('v0')
      .where(function groups() {
        this.where('v0', 'like', 'user:%').orWhere('v0', 'like', 'group:%');
      })
      .update({
        v0: knex.raw('LOWER(??)', ['v0']),
      });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(_knex) {};
