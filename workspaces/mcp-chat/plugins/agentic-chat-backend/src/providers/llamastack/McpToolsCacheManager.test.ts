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

import type { LoggerService } from '@backstage/backend-plugin-api';
import type { AgenticChatStatus } from '../../types';
import { McpToolsCacheManager } from './McpToolsCacheManager';
import { createMockLogger } from '../../test-utils/mocks';

function createMockStatus(
  mcpServers: Array<{
    id: string;
    name: string;
    url: string;
    connected: boolean;
    tools?: Array<{ name: string }>;
  }>,
) {
  return {
    providerId: 'llamastack',
    provider: { connected: true, model: 'test' },
    vectorStore: { ready: false },
    mcpServers,
    securityMode: 'plugin-only' as const,
    timestamp: new Date().toISOString(),
    ready: true,
    configurationErrors: [],
  } as unknown as AgenticChatStatus;
}

describe('McpToolsCacheManager', () => {
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogger = createMockLogger();
  });

  describe('getCache', () => {
    it('returns empty map initially', () => {
      const manager = new McpToolsCacheManager(
        mockLogger as unknown as LoggerService,
      );
      expect(manager.getCache().size).toBe(0);
    });
  });

  describe('updateFromStatus', () => {
    it('does nothing when status has no mcpServers', () => {
      const manager = new McpToolsCacheManager(
        mockLogger as unknown as LoggerService,
      );
      const status = {
        ...createMockStatus([]),
        mcpServers: undefined,
      } as unknown as AgenticChatStatus;

      manager.updateFromStatus(status, true, null, null);

      expect(manager.getCache().size).toBe(0);
    });

    it('populates cache from connected servers with tools', () => {
      const manager = new McpToolsCacheManager(
        mockLogger as unknown as LoggerService,
      );
      const status = createMockStatus([
        {
          id: 'server-a',
          name: 'Server A',
          url: 'https://a.example.com',
          connected: true,
          tools: [{ name: 'tool1' }, { name: 'tool2' }],
        },
      ]);

      manager.updateFromStatus(status, true, null, null);

      const cache = manager.getCache();
      expect(cache.size).toBe(1);
      expect(cache.get('server-a')).toEqual(['tool1', 'tool2']);
    });

    it('prunes removed servers from cache', () => {
      const manager = new McpToolsCacheManager(
        mockLogger as unknown as LoggerService,
      );
      const status1 = createMockStatus([
        {
          id: 'server-a',
          name: 'Server A',
          url: 'https://a.example.com',
          connected: true,
          tools: [{ name: 'tool1' }],
        },
      ]);
      manager.updateFromStatus(status1, true, null, null);
      expect(manager.getCache().size).toBe(1);

      const status2 = createMockStatus([
        {
          id: 'server-b',
          name: 'Server B',
          url: 'https://b.example.com',
          connected: true,
          tools: [{ name: 'tool2' }],
        },
      ]);
      manager.updateFromStatus(status2, true, null, null);

      const cache = manager.getCache();
      expect(cache.size).toBe(1);
      expect(cache.has('server-a')).toBe(false);
      expect(cache.get('server-b')).toEqual(['tool2']);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('pruned removed server "server-a"'),
      );
    });

    it('removes disconnected servers from cache', () => {
      const manager = new McpToolsCacheManager(
        mockLogger as unknown as LoggerService,
      );
      const status1 = createMockStatus([
        {
          id: 'server-a',
          name: 'Server A',
          url: 'https://a.example.com',
          connected: true,
          tools: [{ name: 'tool1' }],
        },
      ]);
      manager.updateFromStatus(status1, true, null, null);

      const status2 = createMockStatus([
        {
          id: 'server-a',
          name: 'Server A',
          url: 'https://a.example.com',
          connected: false,
        },
      ]);
      manager.updateFromStatus(status2, true, null, null);

      expect(manager.getCache().size).toBe(0);
    });

    it('logs when tool name conflicts are detected', () => {
      const manager = new McpToolsCacheManager(
        mockLogger as unknown as LoggerService,
      );
      const status = createMockStatus([
        {
          id: 'server-a',
          name: 'Server A',
          url: 'https://a.example.com',
          connected: true,
          tools: [{ name: 'duplicate_tool' }],
        },
        {
          id: 'server-b',
          name: 'Server B',
          url: 'https://b.example.com',
          connected: true,
          tools: [{ name: 'duplicate_tool' }],
        },
      ]);

      manager.updateFromStatus(status, true, null, null);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('tool name conflicts detected'),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('duplicate_tool'),
      );
    });

    it('calls conversations.setProxyMode when conversations is provided', () => {
      const setProxyMode = jest.fn();
      const mockConversations = {
        setProxyMode,
      } as unknown as import('./ConversationService').ConversationService;
      const manager = new McpToolsCacheManager(
        mockLogger as unknown as LoggerService,
      );
      const status = createMockStatus([
        {
          id: 'server-a',
          name: 'Server A',
          url: 'https://a.example.com',
          connected: true,
          tools: [{ name: 'tool1' }],
        },
      ]);
      const mockProxy = {} as import('./McpProxyService').McpProxyService;

      manager.updateFromStatus(status, true, mockProxy, mockConversations);

      expect(setProxyMode).toHaveBeenCalledWith(true, mockProxy);
    });

    it('does not call setProxyMode when conversations is null', () => {
      const setProxyMode = jest.fn();
      const manager = new McpToolsCacheManager(
        mockLogger as unknown as LoggerService,
      );
      const status = createMockStatus([
        {
          id: 'server-a',
          name: 'Server A',
          url: 'https://a.example.com',
          connected: true,
          tools: [{ name: 'tool1' }],
        },
      ]);

      manager.updateFromStatus(status, true, null, null);

      expect(setProxyMode).not.toHaveBeenCalled();
    });
  });
});
