/*
 * Copyright 2025 The Backstage Authors
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
  await knex.schema.createTable('mcp_chat_conversations', table => {
    table.comment('Stores chat conversation history for MCP Chat plugin');
    table
      .uuid('id')
      .primary()
      .notNullable()
      .comment('Unique identifier for the conversation');
    table
      .string('user_id')
      .notNullable()
      .comment('User ID who owns this conversation');
    table.text('messages').notNullable().comment('JSON array of chat messages');
    table
      .text('tools_used')
      .nullable()
      .comment('JSON array of tools used in the conversation');
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Timestamp when the conversation was created');
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Timestamp when the conversation was last updated');

    table.index('user_id', 'idx_mcp_chat_conversations_user_id');
    table.index(
      ['user_id', 'created_at'],
      'idx_mcp_chat_conversations_user_created',
    );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('mcp_chat_conversations');
};
