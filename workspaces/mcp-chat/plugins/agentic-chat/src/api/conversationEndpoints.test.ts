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

import type { ConversationApiDeps } from './conversationEndpoints';
import {
  listConversations,
  getConversation,
  getConversationInputs,
  deleteConversation,
  createConversation,
  getConversationItems,
  getConversationMessages,
  walkResponseChain,
} from './conversationEndpoints';
import { createMockResponse } from '../test-utils/factories';

describe('conversationEndpoints', () => {
  const baseUrl = 'http://localhost:7007/api/agentic-chat';

  function createDeps(
    overrides: Partial<ConversationApiDeps> = {},
  ): ConversationApiDeps {
    return {
      fetchJson: jest.fn(),
      fetchJsonSafe: jest.fn(),
      discoveryApi: {
        getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
      } as unknown as ConversationApiDeps['discoveryApi'],
      fetchApi: {
        fetch: jest.fn(),
      } as unknown as ConversationApiDeps['fetchApi'],
      ...overrides,
    };
  }

  describe('listConversations', () => {
    it('should fetch conversations with limit and order', async () => {
      const deps = createDeps();
      const mockData = {
        conversations: [
          {
            responseId: 'resp-1',
            preview: 'Hello',
            createdAt: '2025-01-15T10:00:00Z',
            model: 'llama',
            status: 'completed',
          },
        ],
        hasMore: true,
        lastId: 'resp-1',
      };

      (deps.fetchJson as jest.Mock).mockResolvedValue(mockData);

      const result = await listConversations(deps, 10, 'desc');

      expect(deps.fetchJson).toHaveBeenCalledWith(
        '/conversations?limit=10&order=desc',
      );
      expect(result.conversations).toHaveLength(1);
      expect(result.conversations[0].responseId).toBe('resp-1');
      expect(result.conversations[0].createdAt).toEqual(
        new Date('2025-01-15T10:00:00Z'),
      );
      expect(result.hasMore).toBe(true);
      expect(result.lastId).toBe('resp-1');
    });

    it('should include after param when provided', async () => {
      const deps = createDeps();
      (deps.fetchJson as jest.Mock).mockResolvedValue({
        conversations: [],
        hasMore: false,
      });

      await listConversations(deps, 5, 'asc', 'cursor-xyz');

      expect(deps.fetchJson).toHaveBeenCalledWith(
        '/conversations?limit=5&order=asc&after=cursor-xyz',
      );
    });

    it('should handle empty response', async () => {
      const deps = createDeps();
      (deps.fetchJson as jest.Mock).mockResolvedValue({});

      const result = await listConversations(deps, 10, 'desc');

      expect(result.conversations).toEqual([]);
      expect(result.hasMore).toBe(false);
    });

    it('should propagate fetch errors', async () => {
      const deps = createDeps();
      (deps.fetchJson as jest.Mock).mockRejectedValue(new Error('List failed'));

      await expect(listConversations(deps, 10, 'desc')).rejects.toThrow(
        'List failed',
      );
    });
  });

  describe('getConversation', () => {
    it('should return conversation when found', async () => {
      const deps = createDeps();
      const mockData = {
        conversation: {
          id: 'resp-1',
          model: 'llama',
          status: 'completed',
          createdAt: '2025-01-15T10:00:00Z',
          input: [],
          output: [
            { role: 'assistant', content: [{ type: 'text', text: 'Hi' }] },
          ],
          previousResponseId: null,
        },
      };

      (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockData),
        }),
      );

      const result = await getConversation(deps, 'resp-1');

      expect(deps.discoveryApi.getBaseUrl).toHaveBeenCalledWith('agentic-chat');
      expect(deps.fetchApi.fetch).toHaveBeenCalledWith(
        `${baseUrl}/conversations/resp-1`,
      );
      expect(result).not.toBeNull();
      expect(result!.id).toBe('resp-1');
      expect(result!.createdAt).toEqual(new Date('2025-01-15T10:00:00Z'));
    });

    it('should return null for 404', async () => {
      const deps = createDeps();
      (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({ ok: false, status: 404 }),
      );

      const result = await getConversation(deps, 'nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when conversation is missing in response', async () => {
      const deps = createDeps();
      (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({
          ok: true,
          json: jest.fn().mockResolvedValue({}),
        }),
      );

      const result = await getConversation(deps, 'resp-1');

      expect(result).toBeNull();
    });

    it('should throw on non-404 error', async () => {
      const deps = createDeps();
      const errorResponse = createMockResponse({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(errorResponse);

      await expect(getConversation(deps, 'resp-1')).rejects.toThrow();
    });
  });

  describe('getConversationInputs', () => {
    it('should fetch input items', async () => {
      const deps = createDeps();
      const mockData = {
        items: [{ role: 'user', content: [{ type: 'text', text: 'Hi' }] }],
        hasMore: false,
      };

      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue(mockData);

      const result = await getConversationInputs(deps, 'resp-1');

      expect(deps.fetchJsonSafe).toHaveBeenCalledWith(
        '/conversations/resp-1/inputs',
        {},
      );
      expect(result.items).toEqual(mockData.items);
      expect(result.hasMore).toBe(false);
    });

    it('should return fallback when request fails', async () => {
      const deps = createDeps();
      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({});

      const result = await getConversationInputs(deps, 'resp-1');

      expect(result.items).toEqual([]);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('deleteConversation', () => {
    it('should delete by responseId and return true on success', async () => {
      const deps = createDeps();
      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({ success: true });

      const result = await deleteConversation(deps, 'resp-1');

      expect(deps.fetchJsonSafe).toHaveBeenCalledWith(
        '/conversations/resp-1',
        { success: false },
        { method: 'DELETE' },
      );
      expect(result).toBe(true);
    });

    it('should include conversationId in query when provided', async () => {
      const deps = createDeps();
      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({ success: true });

      await deleteConversation(deps, 'resp-1', 'conv-1');

      expect(deps.fetchJsonSafe).toHaveBeenCalledWith(
        '/conversations/resp-1?conversationId=conv-1',
        { success: false },
        { method: 'DELETE' },
      );
    });

    it('should return false when success is not true', async () => {
      const deps = createDeps();
      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({ success: false });

      const result = await deleteConversation(deps, 'resp-1');

      expect(result).toBe(false);
    });
  });

  describe('createConversation', () => {
    it('should create and return conversationId', async () => {
      const deps = createDeps();
      (deps.fetchJson as jest.Mock).mockResolvedValue({
        conversationId: 'conv-new-123',
      });

      const result = await createConversation(deps);

      expect(deps.fetchJson).toHaveBeenCalledWith(
        '/conversations/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({}),
        }),
      );
      expect(result).toEqual({ conversationId: 'conv-new-123' });
    });

    it('should propagate fetch errors', async () => {
      const deps = createDeps();
      (deps.fetchJson as jest.Mock).mockRejectedValue(
        new Error('Create failed'),
      );

      await expect(createConversation(deps)).rejects.toThrow('Create failed');
    });
  });

  describe('getConversationItems', () => {
    it('should fetch items for conversation', async () => {
      const deps = createDeps();
      const mockItems = [{ role: 'user', content: [] }];
      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({ items: mockItems });

      const result = await getConversationItems(deps, 'conv-1');

      expect(deps.fetchJsonSafe).toHaveBeenCalledWith(
        '/conversations/by-conversation/conv-1/items',
        {},
      );
      expect(result.items).toEqual(mockItems);
    });

    it('should return empty array when no items', async () => {
      const deps = createDeps();
      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({});

      const result = await getConversationItems(deps, 'conv-1');

      expect(result.items).toEqual([]);
    });
  });

  describe('getConversationMessages', () => {
    it('should fetch processed messages', async () => {
      const deps = createDeps();
      const mockMessages = [
        { role: 'user' as const, text: 'Hi' },
        { role: 'assistant' as const, text: 'Hello' },
      ];
      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({
        messages: mockMessages,
      });

      const result = await getConversationMessages(deps, 'conv-1');

      expect(deps.fetchJsonSafe).toHaveBeenCalledWith(
        '/conversations/by-conversation/conv-1/messages',
        {},
      );
      expect(result).toEqual(mockMessages);
    });

    it('should return empty array when no messages', async () => {
      const deps = createDeps();
      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({});

      const result = await getConversationMessages(deps, 'conv-1');

      expect(result).toEqual([]);
    });
  });

  describe('walkResponseChain', () => {
    it('should fetch chain messages', async () => {
      const deps = createDeps();
      const mockMessages = [
        { role: 'user' as const, text: 'Q1' },
        { role: 'assistant' as const, text: 'A1' },
      ];
      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({
        messages: mockMessages,
      });

      const result = await walkResponseChain(deps, 'resp-1');

      expect(deps.fetchJsonSafe).toHaveBeenCalledWith(
        '/conversations/by-response/resp-1/chain',
        {},
      );
      expect(result.messages).toEqual(mockMessages);
    });

    it('should return empty messages when fallback', async () => {
      const deps = createDeps();
      (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({});

      const result = await walkResponseChain(deps, 'resp-1');

      expect(result.messages).toEqual([]);
    });
  });
});
