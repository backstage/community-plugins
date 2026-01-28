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

/**
 * Creates the mcp_chat_conversations table for storing chat history.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('mcp_chat_conversations', table => {
    table.comment('Stores chat conversation history for MCP Chat plugin');

    // Primary key
    table
      .uuid('id')
      .primary()
      .notNullable()
      .comment('Unique identifier for the conversation');

    // User ownership
    table
      .string('user_id')
      .notNullable()
      .comment('User entity ref who owns this conversation');

    // Conversation data
    table.text('messages').notNullable().comment('JSON array of chat messages');

    table
      .text('tools_used')
      .nullable()
      .comment('JSON array of tools used in the conversation');

    // Display and organization
    table
      .string('title', 255)
      .nullable()
      .comment('AI-generated or user-edited conversation title');

    table
      .boolean('is_starred')
      .notNullable()
      .defaultTo(false)
      .comment('Whether the conversation is starred/favorited');

    // Timestamps
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

    // Indexes for efficient querying
    table.index('user_id', 'idx_mcp_chat_conversations_user_id');
    table.index(
      ['user_id', 'updated_at'],
      'idx_mcp_chat_conversations_user_updated',
    );
    table.index(
      ['user_id', 'is_starred'],
      'idx_mcp_chat_conversations_user_starred',
    );
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('mcp_chat_conversations');
};
