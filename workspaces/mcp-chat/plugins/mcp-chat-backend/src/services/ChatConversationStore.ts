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

import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';
import {
  DatabaseService,
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { ChatMessage, ConversationRecord, ConversationRow } from '../types';

const TABLE_NAME = 'mcp_chat_conversations';
const DEFAULT_DISPLAY_LIMIT = 10;

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-mcp-chat-backend',
  'migrations',
);

/**
 * Options for creating a ChatConversationStore instance.
 *
 * @public
 */
export interface ChatConversationStoreOptions {
  database: DatabaseService;
  logger: LoggerService;
  config: Config;
}

/**
 * Service for storing and retrieving chat conversations from the database.
 * Follows the Backstage pattern used by playlist-backend/DatabaseHandler.
 *
 * @public
 */
export class ChatConversationStore {
  /**
   * Creates a new ChatConversationStore instance.
   * Handles database migrations automatically.
   *
   * @param options - Configuration options
   * @returns A new ChatConversationStore instance
   */
  static async create(
    options: ChatConversationStoreOptions,
  ): Promise<ChatConversationStore> {
    const { database, logger, config } = options;
    const client = await database.getClient();

    // Run migrations (following playlist-backend pattern)
    await client.migrate.latest({
      directory: migrationsDir,
    });

    logger.info('MCP Chat database migrations completed');

    return new ChatConversationStore(client, logger, config);
  }

  private constructor(
    private readonly db: Knex,
    private readonly logger: LoggerService,
    private readonly config: Config,
  ) {}

  /**
   * Save a conversation to the database.
   * Creates a new conversation or updates an existing one.
   *
   * @param userId - User entity ref who owns this conversation
   * @param messages - Array of chat messages
   * @param toolsUsed - Optional array of tool names used
   * @param conversationId - Optional existing conversation ID to update
   * @returns The saved conversation record
   */
  async saveConversation(
    userId: string,
    messages: ChatMessage[],
    toolsUsed?: string[],
    conversationId?: string,
  ): Promise<ConversationRecord> {
    const id = conversationId || uuid();
    const now = new Date();

    try {
      // Check if conversation exists and belongs to user
      if (conversationId) {
        const existing = await this.db(TABLE_NAME)
          .where({ id: conversationId, user_id: userId })
          .first();

        if (existing) {
          // Update existing conversation
          await this.db(TABLE_NAME)
            .where({ id: conversationId, user_id: userId })
            .update({
              messages: JSON.stringify(messages),
              tools_used: toolsUsed ? JSON.stringify(toolsUsed) : null,
              updated_at: now,
            });

          this.logger.debug(
            `Updated conversation ${id} for user ${userId.split('/').pop()}`,
          );

          return {
            id,
            userId,
            messages,
            toolsUsed,
            title: existing.title || undefined,
            isStarred: existing.is_starred || false,
            createdAt: new Date(existing.created_at),
            updatedAt: now,
          };
        }
      }

      // Create new conversation
      await this.db(TABLE_NAME).insert({
        id,
        user_id: userId,
        messages: JSON.stringify(messages),
        tools_used: toolsUsed ? JSON.stringify(toolsUsed) : null,
        title: null,
        is_starred: false,
        created_at: now,
        updated_at: now,
      });

      this.logger.debug(
        `Created conversation ${id} for user ${userId.split('/').pop()}`,
      );

      return {
        id,
        userId,
        messages,
        toolsUsed,
        title: undefined,
        isStarred: false,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      this.logger.error(`Failed to save conversation: ${error}`);
      throw error;
    }
  }

  /**
   * Retrieve conversations for a specific user, ordered by last update (newest first).
   * Limit is controlled by config or parameter.
   *
   * @param userId - User entity ref
   * @param limit - Optional limit override (default from config)
   * @returns Array of conversation records
   */
  async getConversations(
    userId: string,
    limit?: number,
  ): Promise<ConversationRecord[]> {
    try {
      const displayLimit =
        limit ||
        this.config.getOptionalNumber(
          'mcpChat.conversationHistory.displayLimit',
        ) ||
        DEFAULT_DISPLAY_LIMIT;

      const rows = await this.db(TABLE_NAME)
        .select('*')
        .where({ user_id: userId })
        .orderBy('updated_at', 'desc')
        .limit(displayLimit);

      return rows.map(row => this.rowToRecord(row));
    } catch (error) {
      this.logger.error(
        `Failed to retrieve conversations for user ${userId}: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Retrieve a specific conversation by ID (with user verification).
   *
   * @param userId - User entity ref (for authorization)
   * @param id - Conversation ID
   * @returns The conversation record or null if not found
   */
  async getConversationById(
    userId: string,
    id: string,
  ): Promise<ConversationRecord | null> {
    try {
      const row = await this.db(TABLE_NAME)
        .where({ id, user_id: userId })
        .first();

      if (!row) {
        return null;
      }

      return this.rowToRecord(row);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve conversation ${id} for user ${userId}: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Convert a database row to a ConversationRecord.
   * Includes safe JSON parsing with error handling.
   */
  private rowToRecord(row: ConversationRow): ConversationRecord {
    let messages: ChatMessage[] = [];
    let toolsUsed: string[] | undefined;

    // Safe JSON parsing for messages
    try {
      messages = JSON.parse(row.messages);
    } catch (error) {
      this.logger.error(
        `Corrupted messages JSON for conversation ${row.id}, returning empty array`,
      );
      messages = [];
    }

    // Safe JSON parsing for tools_used
    if (row.tools_used) {
      try {
        toolsUsed = JSON.parse(row.tools_used);
      } catch (error) {
        this.logger.error(
          `Corrupted tools_used JSON for conversation ${row.id}, ignoring`,
        );
        toolsUsed = undefined;
      }
    }

    return {
      id: row.id,
      userId: row.user_id,
      messages,
      toolsUsed,
      title: row.title || undefined,
      isStarred: row.is_starred || false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Delete all conversations for a user.
   * Useful for account cleanup or testing.
   *
   * @param userId - User entity ref
   */
  async deleteUserConversations(userId: string): Promise<void> {
    try {
      await this.db(TABLE_NAME).where({ user_id: userId }).delete();
      this.logger.info(`Deleted all conversations for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete conversations for user ${userId}: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Delete a specific conversation.
   *
   * @param userId - User entity ref (for authorization)
   * @param id - Conversation ID
   * @returns true if deleted, false if not found
   */
  async deleteConversation(userId: string, id: string): Promise<boolean> {
    try {
      const deleted = await this.db(TABLE_NAME)
        .where({ id, user_id: userId })
        .delete();
      return deleted > 0;
    } catch (error) {
      this.logger.error(`Failed to delete conversation ${id}: ${error}`);
      throw error;
    }
  }

  /**
   * Toggle the starred status of a conversation.
   *
   * @param userId - User entity ref (for authorization)
   * @param id - Conversation ID
   * @returns The new starred status, or false if not found
   */
  async toggleStarred(userId: string, id: string): Promise<boolean> {
    try {
      // First check if conversation exists
      const existing = await this.db(TABLE_NAME)
        .where({ id, user_id: userId })
        .first();

      if (!existing) {
        return false;
      }

      const newStarredStatus = !existing.is_starred;

      await this.db(TABLE_NAME).where({ id, user_id: userId }).update({
        is_starred: newStarredStatus,
        updated_at: new Date(),
      });

      return newStarredStatus;
    } catch (error) {
      this.logger.error(
        `Failed to toggle starred for conversation ${id}: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Update the title of a conversation.
   *
   * @param userId - User entity ref (for authorization)
   * @param id - Conversation ID
   * @param title - New title
   */
  async updateTitle(userId: string, id: string, title: string): Promise<void> {
    try {
      await this.db(TABLE_NAME).where({ id, user_id: userId }).update({
        title,
        updated_at: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to update title for conversation ${id}: ${error}`,
      );
      throw error;
    }
  }
}
