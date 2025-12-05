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
import { ChatMessage, ConversationRecord, ConversationRow } from '../types';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

const TABLE_NAME = 'mcp_chat_conversations';
const DEFAULT_DISPLAY_LIMIT = 10;

/**
 * Service for storing and retrieving chat conversations from the database
 */
export class ChatConversationStore {
  constructor(
    private readonly db: Knex,
    private readonly logger: LoggerService,
    private readonly config: Config,
  ) {}

  /**
   * Save a new conversation to the database
   * Note: ALL conversations are stored permanently. Display limit is controlled by config.
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
      // Check if conversation exists
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

          this.logger.info(
            `Updated conversation ${id} for user ${userId} with ${messages.length} messages`,
          );

          return {
            id,
            userId,
            messages,
            toolsUsed,
            createdAt: new Date(existing.created_at),
            updatedAt: now,
          };
        }
      }

      // Create new conversation
      const row: Omit<ConversationRow, 'created_at' | 'updated_at'> = {
        id,
        user_id: userId,
        messages: JSON.stringify(messages),
        tools_used: toolsUsed ? JSON.stringify(toolsUsed) : null,
      };

      await this.db(TABLE_NAME).insert({
        ...row,
        created_at: now,
        updated_at: now,
      });

      this.logger.info(
        `Created new conversation ${id} for user ${userId} with ${messages.length} messages`,
      );

      // Note: We no longer delete old conversations - all are kept in DB
      // Display limit is controlled by config in getConversations()

      return {
        id,
        userId,
        messages,
        toolsUsed,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error) {
      this.logger.error(`Failed to save conversation: ${error}`);
      throw error;
    }
  }

  /**
   * Retrieve conversations for a specific user, ordered by last update (newest first)
   * Limit is controlled by config (mcpChat.conversationHistory.displayLimit)
   * Note: ALL conversations are stored in DB, this only limits what's returned
   */
  async getConversations(
    userId: string,
    limit?: number,
  ): Promise<ConversationRecord[]> {
    try {
      // Get display limit from config, or use provided limit, or fall back to default
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

      return rows.map(this.rowToRecord);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve conversations for user ${userId}: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Retrieve a specific conversation by ID (with user verification)
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
   * Convert a database row to a ConversationRecord
   */
  private rowToRecord(row: ConversationRow): ConversationRecord {
    return {
      id: row.id,
      userId: row.user_id,
      messages: JSON.parse(row.messages),
      toolsUsed: row.tools_used ? JSON.parse(row.tools_used) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Delete all conversations (useful for testing)
   */
  async deleteAllConversations(): Promise<void> {
    try {
      await this.db(TABLE_NAME).delete();
      this.logger.info('Deleted all conversations');
    } catch (error) {
      this.logger.error(`Failed to delete all conversations: ${error}`);
      throw error;
    }
  }
}
