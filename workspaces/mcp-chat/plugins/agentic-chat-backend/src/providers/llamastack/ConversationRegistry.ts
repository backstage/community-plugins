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
import { LoggerService, DatabaseService } from '@backstage/backend-plugin-api';
import { MAX_CONVERSATION_REGISTRY_SIZE } from '../../constants';
import { toErrorMessage } from '../../services/utils';

/**
 * ConversationRegistry
 *
 * Manages the mapping between Llama Stack response IDs and conversation IDs.
 * Used to enrich the sidebar listing with conversationId so the frontend can
 * load full history via the Conversations API.
 *
 * - In-memory cache (bounded) for fast lookups
 * - Optional database persistence when DatabaseService is provided
 * - Tracks first stored turn per conversation for store: true/false logic
 */
export class ConversationRegistry {
  private responseToConversation = new Map<string, string>();
  private storedConversationIds = new Set<string>();

  private static readonly MAX_STORED_IDS = MAX_CONVERSATION_REGISTRY_SIZE;
  private static readonly TABLE_NAME = 'agentic_chat_conversation_registry';

  /** Knex client — lazily initialized from DatabaseService */
  private db: Awaited<ReturnType<DatabaseService['getClient']>> | null = null;

  constructor(
    private readonly database: DatabaseService | undefined,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Set up the database table if DatabaseService is available.
   * Falls back to in-memory if no database is configured.
   */
  async initializeDatabase(): Promise<void> {
    if (!this.database) {
      this.logger.info(
        'No DatabaseService provided — conversation registry will use in-memory storage',
      );
      return;
    }

    try {
      this.db = await this.database.getClient();

      const hasTable = await this.db.schema.hasTable(
        ConversationRegistry.TABLE_NAME,
      );
      if (!hasTable) {
        try {
          await this.db.schema.createTable(
            ConversationRegistry.TABLE_NAME,
            table => {
              table.string('response_id').primary().notNullable();
              table.string('conversation_id').notNullable();
              table.timestamp('created_at').defaultTo(this.db!.fn.now());
            },
          );
          this.logger.info(
            `Created ${ConversationRegistry.TABLE_NAME} table for persistent conversation registry`,
          );
        } catch (createError) {
          const existsNow = await this.db.schema.hasTable(
            ConversationRegistry.TABLE_NAME,
          );
          if (!existsNow) throw createError;
          this.logger.info(
            `${ConversationRegistry.TABLE_NAME} table was created by another instance`,
          );
        }
      } else {
        this.logger.info(
          `Using existing ${ConversationRegistry.TABLE_NAME} table for conversation registry`,
        );
      }
    } catch (error) {
      const msg = toErrorMessage(error);
      this.logger.warn(
        `Failed to initialize database for conversation registry, falling back to in-memory: ${msg}`,
      );
      this.db = null;
    }
  }

  /**
   * Records a conversation's first stored turn. Returns true if this is
   * the first call for this conversationId (i.e. it was not yet tracked).
   * Side-effect: adds the conversationId to the tracked set so subsequent
   * calls return false.
   *
   * This drives the `store` flag: first turn → store: true (appears
   * in sidebar listing), subsequent turns → store: false (hidden
   * from listing but still populates conversation items).
   */
  markFirstStoredTurn(conversationId: string): boolean {
    if (this.storedConversationIds.has(conversationId)) {
      return false;
    }
    if (
      this.storedConversationIds.size >= ConversationRegistry.MAX_STORED_IDS
    ) {
      const firstKey = this.storedConversationIds.values().next().value;
      if (firstKey !== undefined) {
        this.storedConversationIds.delete(firstKey);
      }
    }
    this.storedConversationIds.add(conversationId);
    return true;
  }

  /**
   * Register a mapping from a response ID to its conversation ID.
   * Called after a response completes so the sidebar listing can
   * enrich entries with the correct conversationId.
   *
   * Persisted to the database when available; always cached in memory.
   * In-memory cache is capped at 10 000 entries.
   */
  async registerResponse(
    conversationId: string,
    responseId: string,
  ): Promise<void> {
    // In-memory cache (bounded)
    if (this.responseToConversation.size >= MAX_CONVERSATION_REGISTRY_SIZE) {
      const firstKey = this.responseToConversation.keys().next().value;
      if (firstKey) this.responseToConversation.delete(firstKey);
    }
    this.responseToConversation.set(responseId, conversationId);

    // Persist to database if available
    if (this.db) {
      try {
        await this.db(ConversationRegistry.TABLE_NAME)
          .insert({ response_id: responseId, conversation_id: conversationId })
          .onConflict('response_id')
          .merge();
      } catch (error) {
        const msg = toErrorMessage(error);
        this.logger.warn(
          `Failed to persist conversation registry entry: ${msg}`,
        );
      }
    }

    this.logger.debug(
      `Registered response ${responseId} → conversation ${conversationId}`,
    );
  }

  /**
   * Look up the conversationId for a response (if known).
   * Checks in-memory cache first, falls back to database.
   */
  async getConversationForResponse(
    responseId: string,
  ): Promise<string | undefined> {
    // Fast path: in-memory cache hit
    const cached = this.responseToConversation.get(responseId);
    if (cached) return cached;

    // Slow path: database lookup (only if db is available)
    if (this.db) {
      try {
        const row = await this.db(ConversationRegistry.TABLE_NAME)
          .where('response_id', responseId)
          .first<{ conversation_id: string } | undefined>();
        if (row) {
          this.responseToConversation.set(responseId, row.conversation_id);
          return row.conversation_id;
        }
      } catch (error) {
        const msg = toErrorMessage(error);
        this.logger.warn(
          `Failed to look up conversation registry from database: ${msg}`,
        );
      }
    }

    return undefined;
  }

  /** Returns the current size of the response→conversation cache (for logging). */
  getRegistrySize(): number {
    return this.responseToConversation.size;
  }
}
