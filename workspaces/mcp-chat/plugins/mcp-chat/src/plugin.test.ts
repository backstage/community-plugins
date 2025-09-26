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
import { mcpChatPlugin, McpChatPage, MCPChatIcon } from './plugin';
import { mcpChatApiRef } from './api';
import { rootRouteRef } from './routes';
import { BotIconComponent } from './components/BotIcon';
import { McpChat } from './api/McpChatApi';

jest.mock('./components/BotIcon', () => ({
  BotIconComponent: jest.fn(() => 'BotIconComponent'),
}));

describe('mcp-chat plugin', () => {
  describe('mcpChatPlugin', () => {
    it('should have correct plugin configuration', () => {
      expect(mcpChatPlugin.getId()).toBe('mcp-chat');
      expect(mcpChatPlugin.routes.root).toBe(rootRouteRef);
    });

    it('should register API factory with correct dependencies', () => {
      const apis = Array.from(mcpChatPlugin.getApis());
      expect(apis).toHaveLength(1);

      const apiFactory = apis[0];
      expect(apiFactory.api).toBe(mcpChatApiRef);
      expect(apiFactory.deps).toEqual({
        discoveryApi: expect.any(Object),
        fetchApi: expect.any(Object),
      });
    });

    it('should create McpChat instance through API factory', () => {
      const apis = Array.from(mcpChatPlugin.getApis());
      const apiFactory = apis[0];

      const mockDiscoveryApi = { getBaseUrl: jest.fn() };
      const mockFetchApi = { fetch: jest.fn() };

      const client = apiFactory.factory({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
      });

      expect(client).toBeInstanceOf(McpChat);
    });
  });

  describe('McpChatPage', () => {
    it('should be a routable extension', () => {
      expect(McpChatPage).toBeDefined();
      expect(typeof McpChatPage).toBe('function');
    });
  });

  describe('MCPChatIcon', () => {
    it('should reference BotIconComponent', () => {
      expect(MCPChatIcon).toBe(BotIconComponent);
    });
  });

  describe('McpChat API implementation', () => {
    let client: McpChat;
    let mockDiscoveryApi: any;
    let mockFetchApi: any;
    let mockFetch: jest.Mock;

    beforeEach(() => {
      mockFetch = jest.fn();
      mockDiscoveryApi = {
        getBaseUrl: jest.fn().mockResolvedValue('http://localhost:7007/api'),
      };
      mockFetchApi = {
        fetch: mockFetch,
      };
      client = new McpChat({
        discoveryApi: mockDiscoveryApi,
        fetchApi: mockFetchApi,
      });
    });

    it('should implement all required API methods', () => {
      expect(typeof client.sendChatMessage).toBe('function');
      expect(typeof client.getMCPServerStatus).toBe('function');
      expect(typeof client.getAvailableTools).toBe('function');
      expect(typeof client.getProviderStatus).toBe('function');
    });

    it('should handle sendChatMessage with proper parameters', async () => {
      const mockResponse = { role: 'assistant', content: 'Hello' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const result = await client.sendChatMessage(messages, ['tool1']);

      expect(result).toEqual(mockResponse);
      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('mcp-chat');
    });

    it('should handle API methods without optional parameters', async () => {
      const mockServerStatus = {
        total: 0,
        valid: 0,
        active: 0,
        servers: [],
        timestamp: '2024-01-01',
      };
      const mockTools = { tools: [] };
      const mockProviderStatus = { providers: [] };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockServerStatus),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockTools),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockProviderStatus),
        });

      const serverStatus = await client.getMCPServerStatus();
      const tools = await client.getAvailableTools();
      const providerStatus = await client.getProviderStatus();

      expect(serverStatus).toEqual(mockServerStatus);
      expect(tools).toEqual(mockTools);
      expect(providerStatus).toEqual(mockProviderStatus);
    });
  });

  describe('API reference', () => {
    it('should have correct API reference configuration', () => {
      expect(mcpChatApiRef.id).toBe('plugin.mcp-chat.service');
    });
  });
});
