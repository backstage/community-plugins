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

import { mockServices } from '@backstage/backend-test-utils';
import { ChatConversationStore } from './ChatConversationStore';
import { ChatMessage } from '../types';
import { ConfigReader } from '@backstage/config';
import { Knex, knex } from 'knex';

describe('ChatConversationStore', () => {
  let db: Knex;
  const logger = mockServices.logger.mock();
  const config = new ConfigReader({
    mcpChat: {
      conversationHistory: {
        displayLimit: 25,
      },
    },
  });

  beforeAll(async () => {
    // Use in-memory SQLite database for testing
    db = knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    // Run migrations to create tables
    await db.migrate.latest({
      directory: './plugins/mcp-chat-backend/migrations',
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    // Clear all data before each test
    await db('mcp_chat_conversations').del();
  });

  it('should save and retrieve conversations', async () => {
    const store = new ChatConversationStore(db, logger, config);

    const userId = 'user:default/testuser';
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];

    // Save conversation
    const saved = await store.saveConversation(userId, messages);
    expect(saved.id).toBeDefined();
    expect(saved.userId).toBe(userId);
    expect(saved.messages).toEqual(messages);
    expect(saved.createdAt).toBeInstanceOf(Date);

    // Retrieve conversations
    const conversations = await store.getConversations(userId);
    expect(conversations).toHaveLength(1);
    expect(conversations[0].messages).toEqual(messages);

    // Retrieve by ID
    const retrieved = await store.getConversationById(userId, saved.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.messages).toEqual(messages);
  });

  it('should save conversations with tools used', async () => {
    const store = new ChatConversationStore(db, logger, config);
    const userId = 'user:default/testuser';

    const messages: ChatMessage[] = [
      { role: 'user', content: 'Search for something' },
      { role: 'assistant', content: 'Here are the results' },
    ];
    const toolsUsed = ['brave_search', 'kubernetes_query'];

    const saved = await store.saveConversation(userId, messages, toolsUsed);
    expect(saved.toolsUsed).toEqual(toolsUsed);

    const retrieved = await store.getConversationById(userId, saved.id);
    expect(retrieved?.toolsUsed).toEqual(toolsUsed);
  });

  it('should store all conversations but return only displayLimit', async () => {
    const store = new ChatConversationStore(db, logger, config);
    const userId = 'user:default/testuser';

    // Save 30 conversations
    for (let i = 0; i < 30; i++) {
      const messages: ChatMessage[] = [
        { role: 'user', content: `Message ${i}` },
        { role: 'assistant', content: `Response ${i}` },
      ];
      await store.saveConversation(userId, messages);
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Should return only 25 conversations (displayLimit from config)
    const conversations = await store.getConversations(userId);
    expect(conversations.length).toBe(25);

    // Verify they are the most recent ones (Message 29 is the last/most recent)
    const firstMessage = conversations[0].messages[0];
    expect(firstMessage.content).toContain('Message 29');

    // Verify all 30 are actually stored in DB
    const allInDb = await db('mcp_chat_conversations')
      .where({ user_id: userId })
      .count('* as count');
    expect(Number(allInDb[0].count)).toBe(30);
  });

  it('should return null for non-existent conversation', async () => {
    const store = new ChatConversationStore(db, logger, config);
    const userId = 'user:default/testuser';

    const retrieved = await store.getConversationById(
      userId,
      'non-existent-id',
    );
    expect(retrieved).toBeNull();
  });

  it('should delete all conversations', async () => {
    const store = new ChatConversationStore(db, logger, config);
    const userId = 'user:default/testuser';

    // Save some conversations
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Test' },
      { role: 'assistant', content: 'Response' },
    ];
    await store.saveConversation(userId, messages);
    await store.saveConversation(userId, messages);

    // Verify they exist
    let conversations = await store.getConversations(userId);
    expect(conversations.length).toBeGreaterThan(0);

    // Delete all
    await store.deleteAllConversations();

    // Verify they're gone
    conversations = await store.getConversations(userId);
    expect(conversations).toHaveLength(0);
  });
});
