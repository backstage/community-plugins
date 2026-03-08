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

import { randomUUID } from 'crypto';
import type {
  LoggerService,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import {
  MAX_SESSION_LIST_LIMIT,
  DEFAULT_SESSION_LIST_LIMIT,
} from '../constants';
import { toErrorMessage } from './utils';

export interface ChatSession {
  id: string;
  title: string;
  userRef: string;
  conversationId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatSessionRow {
  id: string;
  title: string;
  user_ref: string;
  conversation_id: string | null;
  created_at: string;
  updated_at: string;
}

const TABLE_NAME = 'agentic_chat_sessions';

/**
 * Manages chat sessions in a local database (SQLite for dev, Postgres for prod).
 * Each session links to a LlamaStack conversation_id (set on first message).
 * Mirrors the ai-virtual-agent pattern: the DB is the source of truth for
 * the sidebar, LlamaStack is the source of truth for message content.
 */
export class ChatSessionService {
  private readonly logger: LoggerService;
  private db: Awaited<ReturnType<DatabaseService['getClient']>> | null = null;

  constructor(
    private readonly database: DatabaseService,
    logger: LoggerService,
  ) {
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    try {
      this.db = await this.database.getClient();

      const hasTable = await this.db.schema.hasTable(TABLE_NAME);
      if (!hasTable) {
        try {
          await this.db.schema.createTable(TABLE_NAME, table => {
            table.string('id').primary().notNullable();
            table.string('title').notNullable();
            table
              .string('user_ref')
              .notNullable()
              .defaultTo('user:default/guest');
            table.string('conversation_id').nullable();
            table
              .timestamp('created_at')
              .notNullable()
              .defaultTo(this.db!.fn.now());
            table
              .timestamp('updated_at')
              .notNullable()
              .defaultTo(this.db!.fn.now());
            table.index(['user_ref', 'updated_at']);
          });
          this.logger.info(`Created ${TABLE_NAME} table`);
        } catch (createError) {
          const existsNow = await this.db.schema.hasTable(TABLE_NAME);
          if (!existsNow) throw createError;
          this.logger.info(
            `${TABLE_NAME} table was created by another instance`,
          );
        }
      } else {
        // Add user_ref column if missing (migration for existing tables)
        const hasUserRef = await this.db.schema.hasColumn(
          TABLE_NAME,
          'user_ref',
        );
        if (!hasUserRef) {
          try {
            await this.db.schema.alterTable(TABLE_NAME, table => {
              table
                .string('user_ref')
                .notNullable()
                .defaultTo('user:default/guest');
              table.index(['user_ref', 'updated_at']);
            });
            this.logger.info(`Added user_ref column to ${TABLE_NAME} table`);
          } catch (alterError) {
            const hasUserRefNow = await this.db.schema.hasColumn(
              TABLE_NAME,
              'user_ref',
            );
            if (!hasUserRefNow) throw alterError;
            this.logger.info(
              `user_ref column in ${TABLE_NAME} was added by another instance`,
            );
          }
        }
        this.logger.info(`Using existing ${TABLE_NAME} table`);
      }
    } catch (error) {
      const msg = toErrorMessage(error);
      this.logger.error(`Failed to initialize chat sessions database: ${msg}`);
      throw error;
    }
  }

  private rowToSession(row: ChatSessionRow): ChatSession {
    return {
      id: row.id,
      title: row.title,
      userRef: row.user_ref,
      conversationId: row.conversation_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createSession(userRef: string, title?: string): Promise<ChatSession> {
    if (!this.db) throw new Error('Database not initialized');

    const id = randomUUID();
    const now = new Date().toISOString();
    const sessionTitle = title || `Chat ${now.slice(0, 16).replace('T', ' ')}`;

    await this.db(TABLE_NAME).insert({
      id,
      title: sessionTitle,
      user_ref: userRef,
      conversation_id: null,
      created_at: now,
      updated_at: now,
    });

    this.logger.info(`Created session ${id} for ${userRef}: "${sessionTitle}"`);
    return {
      id,
      title: sessionTitle,
      userRef,
      conversationId: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async listSessions(
    userRef: string,
    limit: number = 50,
  ): Promise<ChatSession[]> {
    if (!this.db) throw new Error('Database not initialized');

    const cappedLimit = Math.min(Math.max(1, limit), MAX_SESSION_LIST_LIMIT);
    const rows: ChatSessionRow[] = await this.db(TABLE_NAME)
      .select('*')
      .where('user_ref', userRef)
      .orderBy('updated_at', 'desc')
      .limit(cappedLimit);

    return rows.map(r => this.rowToSession(r));
  }

  /**
   * List all sessions across all users.
   * @remarks Admin-only: callers must verify admin access before invoking.
   */
  async listAllSessions(
    limit: number = DEFAULT_SESSION_LIST_LIMIT,
  ): Promise<ChatSession[]> {
    if (!this.db) throw new Error('Database not initialized');

    const cappedLimit = Math.min(Math.max(1, limit), MAX_SESSION_LIST_LIMIT);
    const rows: ChatSessionRow[] = await this.db(TABLE_NAME)
      .select('*')
      .orderBy('updated_at', 'desc')
      .limit(cappedLimit);

    return rows.map(r => this.rowToSession(r));
  }

  async getSession(
    sessionId: string,
    userRef: string,
  ): Promise<ChatSession | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row: ChatSessionRow | undefined = await this.db(TABLE_NAME)
      .where('id', sessionId)
      .where('user_ref', userRef)
      .first();

    return row ? this.rowToSession(row) : null;
  }

  /**
   * Retrieve any session by ID without user_ref filtering.
   * @remarks Admin-only: callers must verify admin access before invoking.
   */
  async getSessionById(sessionId: string): Promise<ChatSession | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row: ChatSessionRow | undefined = await this.db(TABLE_NAME)
      .where('id', sessionId)
      .first();

    return row ? this.rowToSession(row) : null;
  }

  async deleteSession(sessionId: string, userRef: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const deleted = await this.db(TABLE_NAME)
      .where('id', sessionId)
      .where('user_ref', userRef)
      .delete();

    if (deleted > 0) {
      this.logger.info(`Deleted session ${sessionId} for ${userRef}`);
    }
    return deleted > 0;
  }

  /**
   * Set the LlamaStack conversation_id for a session.
   * Called after the first message creates a conversation in LlamaStack.
   */
  async setConversationId(
    sessionId: string,
    userRef: string,
    conversationId: string,
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db(TABLE_NAME)
      .where('id', sessionId)
      .where('user_ref', userRef)
      .update({
        conversation_id: conversationId,
        updated_at: new Date().toISOString(),
      });

    this.logger.info(
      `Linked session ${sessionId} to conversation ${conversationId} for ${userRef}`,
    );
  }

  /**
   * Update the session title (e.g., from the first user message).
   */
  async updateTitle(
    sessionId: string,
    userRef: string,
    title: string,
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db(TABLE_NAME)
      .where('id', sessionId)
      .where('user_ref', userRef)
      .update({
        title,
        updated_at: new Date().toISOString(),
      });
  }

  /**
   * Touch the updated_at timestamp (called after each message).
   */
  async touch(sessionId: string, userRef: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db(TABLE_NAME)
      .where('id', sessionId)
      .where('user_ref', userRef)
      .update({ updated_at: new Date().toISOString() });
  }
}
