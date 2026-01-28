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
import { ConfigReader } from '@backstage/config';
import { ChatConversationStore } from './ChatConversationStore';
import { ChatMessage, ConversationRow } from '../types';

// Helper to create a mock Knex query builder
const createMockQueryBuilder = () => {
  const queryBuilder: any = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn().mockResolvedValue([1]),
    update: jest.fn().mockResolvedValue(1),
    delete: jest.fn().mockResolvedValue(1),
  };
  return queryBuilder;
};

describe('ChatConversationStore', () => {
  let store: ChatConversationStore;
  let mockDb: jest.Mock;
  let mockQueryBuilder: ReturnType<typeof createMockQueryBuilder>;
  let mockLogger: ReturnType<typeof mockServices.logger.mock>;
  let mockConfig: ConfigReader;

  const userId = 'user:default/test-user';
  const conversationId = '123e4567-e89b-12d3-a456-426614174000';

  const sampleMessages: ChatMessage[] = [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' },
  ];

  const sampleRow: ConversationRow = {
    id: conversationId,
    user_id: userId,
    messages: JSON.stringify(sampleMessages),
    tools_used: JSON.stringify(['search_tool']),
    title: 'Test Conversation',
    is_starred: false,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-02'),
  };

  beforeEach(() => {
    mockQueryBuilder = createMockQueryBuilder();
    mockDb = jest.fn().mockReturnValue(mockQueryBuilder);
    mockLogger = mockServices.logger.mock();
    mockConfig = new ConfigReader({
      mcpChat: {
        conversationHistory: {
          displayLimit: 20,
        },
      },
    });

    // Access private constructor via reflection for testing
    store = Object.create(ChatConversationStore.prototype);
    (store as any).db = mockDb;
    (store as any).logger = mockLogger;
    (store as any).config = mockConfig;
  });

  describe('saveConversation', () => {
    it('creates a new conversation when no ID provided', async () => {
      const result = await store.saveConversation(userId, sampleMessages, [
        'tool1',
      ]);

      expect(mockDb).toHaveBeenCalledWith('mcp_chat_conversations');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          messages: JSON.stringify(sampleMessages),
          tools_used: JSON.stringify(['tool1']),
          is_starred: false,
        }),
      );
      expect(result.userId).toBe(userId);
      expect(result.messages).toEqual(sampleMessages);
      expect(result.isStarred).toBe(false);
    });

    it('updates existing conversation when ID is provided and exists', async () => {
      mockQueryBuilder.first.mockResolvedValue(sampleRow);

      const result = await store.saveConversation(
        userId,
        sampleMessages,
        ['tool1'],
        conversationId,
      );

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        id: conversationId,
        user_id: userId,
      });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: JSON.stringify(sampleMessages),
          tools_used: JSON.stringify(['tool1']),
        }),
      );
      expect(result.id).toBe(conversationId);
    });

    it('creates new conversation when provided ID does not exist', async () => {
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const result = await store.saveConversation(
        userId,
        sampleMessages,
        undefined,
        conversationId,
      );

      expect(mockQueryBuilder.insert).toHaveBeenCalled();
      expect(result.id).toBe(conversationId);
    });

    it('handles save errors', async () => {
      mockQueryBuilder.insert.mockRejectedValue(new Error('DB error'));

      await expect(
        store.saveConversation(userId, sampleMessages),
      ).rejects.toThrow('DB error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getConversations', () => {
    it('retrieves conversations ordered by updated_at desc', async () => {
      mockQueryBuilder.limit.mockResolvedValue([sampleRow]);

      const result = await store.getConversations(userId);

      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ user_id: userId });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'updated_at',
        'desc',
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(conversationId);
    });

    it('uses provided limit', async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);

      await store.getConversations(userId, 5);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
    });

    it('uses config limit when no limit provided', async () => {
      mockQueryBuilder.limit.mockResolvedValue([]);

      await store.getConversations(userId);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(20);
    });

    it('handles retrieval errors', async () => {
      mockQueryBuilder.limit.mockRejectedValue(new Error('DB error'));

      await expect(store.getConversations(userId)).rejects.toThrow('DB error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getConversationById', () => {
    it('returns conversation when found', async () => {
      mockQueryBuilder.first.mockResolvedValue(sampleRow);

      const result = await store.getConversationById(userId, conversationId);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        id: conversationId,
        user_id: userId,
      });
      expect(result?.id).toBe(conversationId);
      expect(result?.messages).toEqual(sampleMessages);
    });

    it('returns null when not found', async () => {
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const result = await store.getConversationById(userId, conversationId);

      expect(result).toBeNull();
    });
  });

  describe('deleteConversation', () => {
    it('returns true when conversation is deleted', async () => {
      mockQueryBuilder.delete.mockResolvedValue(1);

      const result = await store.deleteConversation(userId, conversationId);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        id: conversationId,
        user_id: userId,
      });
      expect(result).toBe(true);
    });

    it('returns false when conversation not found', async () => {
      mockQueryBuilder.delete.mockResolvedValue(0);

      const result = await store.deleteConversation(userId, conversationId);

      expect(result).toBe(false);
    });
  });

  describe('toggleStarred', () => {
    it('toggles starred from false to true', async () => {
      mockQueryBuilder.first.mockResolvedValue({
        ...sampleRow,
        is_starred: false,
      });

      const result = await store.toggleStarred(userId, conversationId);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ is_starred: true }),
      );
      expect(result).toBe(true);
    });

    it('toggles starred from true to false', async () => {
      mockQueryBuilder.first.mockResolvedValue({
        ...sampleRow,
        is_starred: true,
      });

      const result = await store.toggleStarred(userId, conversationId);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ is_starred: false }),
      );
      expect(result).toBe(false);
    });

    it('returns false when conversation not found', async () => {
      mockQueryBuilder.first.mockResolvedValue(undefined);

      const result = await store.toggleStarred(userId, conversationId);

      expect(result).toBe(false);
      expect(mockQueryBuilder.update).not.toHaveBeenCalled();
    });
  });

  describe('updateTitle', () => {
    it('updates the title', async () => {
      await store.updateTitle(userId, conversationId, 'New Title');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({
        id: conversationId,
        user_id: userId,
      });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Title' }),
      );
    });
  });

  describe('deleteUserConversations', () => {
    it('deletes all conversations for a user', async () => {
      await store.deleteUserConversations(userId);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ user_id: userId });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('rowToRecord conversion', () => {
    it('handles corrupted messages JSON gracefully', async () => {
      const corruptedRow = { ...sampleRow, messages: 'invalid json' };
      mockQueryBuilder.first.mockResolvedValue(corruptedRow);

      const result = await store.getConversationById(userId, conversationId);

      expect(result?.messages).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('handles corrupted tools_used JSON gracefully', async () => {
      const corruptedRow = { ...sampleRow, tools_used: 'invalid json' };
      mockQueryBuilder.first.mockResolvedValue(corruptedRow);

      const result = await store.getConversationById(userId, conversationId);

      expect(result?.toolsUsed).toBeUndefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('handles null title correctly', async () => {
      const rowWithNullTitle = { ...sampleRow, title: null };
      mockQueryBuilder.first.mockResolvedValue(rowWithNullTitle);

      const result = await store.getConversationById(userId, conversationId);

      expect(result?.title).toBeUndefined();
    });
  });
});
