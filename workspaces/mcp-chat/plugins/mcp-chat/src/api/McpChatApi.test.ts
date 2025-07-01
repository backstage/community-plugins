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

import { McpChat } from './McpChatApi';
import type {
  ChatMessage,
  ChatResponse,
  ConfigStatus,
  ToolsResponse,
} from './McpChatApi';

describe('McpChatApi', () => {
  let mcpChat: McpChat;
  let mockDiscoveryApi: any;
  let mockFetchApi: any;
  let mockFetch: jest.Mock;

  const baseUrl = 'http://localhost:7007/api/mcp-chat';

  beforeEach(() => {
    mockFetch = jest.fn();
    mockDiscoveryApi = {
      getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
    };
    mockFetchApi = {
      fetch: mockFetch,
    };

    mcpChat = new McpChat({
      discoveryApi: mockDiscoveryApi,
      fetchApi: mockFetchApi,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with discovery and fetch APIs', () => {
      expect(mcpChat).toBeDefined();
      expect(typeof mcpChat.sendChatMessage).toBe('function');
      expect(typeof mcpChat.getConfigStatus).toBe('function');
      expect(typeof mcpChat.getAvailableTools).toBe('function');
      expect(typeof mcpChat.testProviderConnection).toBe('function');
    });
  });

  describe('sendChatMessage', () => {
    const mockMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];

    const mockResponse: ChatResponse = {
      role: 'assistant',
      content: 'Test response',
      toolResponses: [{ toolName: 'test-tool', result: 'success' }],
      toolsUsed: ['test-tool'],
    };

    it('should send chat message successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await mcpChat.sendChatMessage(mockMessages);

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('mcp-chat');
      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: mockMessages,
          enabledTools: [],
        }),
        signal: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should send chat message with enabled tools', async () => {
      const enabledTools = ['tool1', 'tool2'];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await mcpChat.sendChatMessage(mockMessages, enabledTools);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: mockMessages,
          enabledTools,
        }),
        signal: undefined,
      });
    });

    it('should send chat message with abort signal', async () => {
      const abortController = new AbortController();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await mcpChat.sendChatMessage(mockMessages, [], abortController.signal);

      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: mockMessages,
          enabledTools: [],
        }),
        signal: abortController.signal,
      });
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(mcpChat.sendChatMessage(mockMessages)).rejects.toThrow(
        'Chat request failed: Internal Server Error',
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(mcpChat.sendChatMessage(mockMessages)).rejects.toThrow(
        'Network error',
      );
    });

    it('should handle discovery API errors', async () => {
      const discoveryError = new Error('Discovery failed');
      mockDiscoveryApi.getBaseUrl.mockRejectedValueOnce(discoveryError);

      await expect(mcpChat.sendChatMessage(mockMessages)).rejects.toThrow(
        'Discovery failed',
      );
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect(mcpChat.sendChatMessage(mockMessages)).rejects.toThrow(
        'Invalid JSON',
      );
    });
  });

  describe('getConfigStatus', () => {
    const mockConfigStatus: ConfigStatus = {
      provider: { type: 'openai', model: 'gpt-4' },
      mcpServers: [
        {
          id: '1',
          name: 'test-server',
          type: 'stdio',
          hasUrl: false,
          hasNpxCommand: true,
          hasScriptPath: false,
        },
      ],
    };

    it('should get config status successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockConfigStatus),
      });

      const result = await mcpChat.getConfigStatus();

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('mcp-chat');
      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/config/status`);
      expect(result).toEqual(mockConfigStatus);
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(mcpChat.getConfigStatus()).rejects.toThrow(
        'Config status request failed: Not Found',
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(mcpChat.getConfigStatus()).rejects.toThrow('Network error');
    });
  });

  describe('getAvailableTools', () => {
    const mockToolsResponse: ToolsResponse = {
      message: 'Tools fetched successfully',
      serverConfigs: [
        {
          name: 'test-server',
          type: 'stdio',
          hasUrl: false,
          hasNpxCommand: true,
          hasScriptPath: false,
        },
      ],
      availableTools: [
        {
          type: 'function',
          function: {
            name: 'test-function',
            description: 'A test function',
            parameters: { type: 'object', properties: {} },
          },
          serverId: 'test-server',
        },
      ],
      toolCount: 1,
      timestamp: '2025-01-01T00:00:00Z',
    };

    it('should get available tools successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsResponse),
      });

      const result = await mcpChat.getAvailableTools();

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('mcp-chat');
      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/test/tools`);
      expect(result).toEqual(mockToolsResponse);
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Service Unavailable',
      });

      await expect(mcpChat.getAvailableTools()).rejects.toThrow(
        'Tools request failed: Service Unavailable',
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Connection timeout');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(mcpChat.getAvailableTools()).rejects.toThrow(
        'Connection timeout',
      );
    });
  });

  describe('testProviderConnection', () => {
    const mockConnectionResponse = {
      connected: true,
      models: ['gpt-4', 'gpt-3.5-turbo'],
      message: 'Connection successful',
      timestamp: '2025-01-01T00:00:00Z',
    };

    it('should test provider connection successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockConnectionResponse),
      });

      const result = await mcpChat.testProviderConnection();

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('mcp-chat');
      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/test/provider-connection`,
      );
      expect(result).toEqual(mockConnectionResponse);
    });

    it('should handle connection failure', async () => {
      const failureResponse = {
        connected: false,
        error: 'Invalid API key',
        message: 'Connection failed',
        timestamp: '2025-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(failureResponse),
      });

      const result = await mcpChat.testProviderConnection();

      expect(result).toEqual(failureResponse);
      expect(result.connected).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(mcpChat.testProviderConnection()).rejects.toThrow(
        'Provider connection test failed: Unauthorized',
      );
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Request timeout');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(mcpChat.testProviderConnection()).rejects.toThrow(
        'Request timeout',
      );
    });
  });

  describe('error handling edge cases', () => {
    it('should handle undefined response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(undefined),
      });

      const result = await mcpChat.getConfigStatus();
      expect(result).toBeUndefined();
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      const result = await mcpChat.getConfigStatus();
      expect(result).toEqual({});
    });

    it('should handle discovery API returning null', async () => {
      mockDiscoveryApi.getBaseUrl.mockResolvedValueOnce(null);

      await expect(mcpChat.getConfigStatus()).rejects.toThrow();
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const mockResponse1 = {
        role: 'assistant' as const,
        content: 'Response 1',
      };
      const mockResponse2 = {
        role: 'assistant' as const,
        content: 'Response 2',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse1),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponse2),
        });

      const [result1, result2] = await Promise.all([
        mcpChat.sendChatMessage([{ role: 'user', content: 'Message 1' }]),
        mcpChat.sendChatMessage([{ role: 'user', content: 'Message 2' }]),
      ]);

      expect(result1).toEqual(mockResponse1);
      expect(result2).toEqual(mockResponse2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
