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

import { ResponseError } from '@backstage/errors';
import { McpChat } from './McpChatApi';
import {
  ChatMessage,
  ChatResponse,
  MCPServerStatusData,
  ProviderStatusData,
  ToolsResponse,
  MCPServerType,
} from '../types';

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
      expect(typeof mcpChat.getMCPServerStatus).toBe('function');
      expect(typeof mcpChat.getAvailableTools).toBe('function');
      expect(typeof mcpChat.getProviderStatus).toBe('function');
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
      const response = {
        ok: false,
        statusText: 'Internal Server Error',
      };
      mockFetch.mockResolvedValueOnce(response);
      const mockResponseError = new Error('Internal Server Error') as any;
      mockResponseError.response = response;
      mockResponseError.statusCode = 500;
      mockResponseError.statusText = 'Internal Server Error';
      jest
        .spyOn(ResponseError, 'fromResponse')
        .mockResolvedValueOnce(mockResponseError);

      await expect(mcpChat.sendChatMessage(mockMessages)).rejects.toThrow(
        'Internal Server Error',
      );
    });
  });

  describe('getMCPServerStatus', () => {
    const mockServerStatus: MCPServerStatusData = {
      total: 1,
      valid: 1,
      active: 1,
      servers: [
        {
          id: '1',
          name: 'test-server',
          type: MCPServerType.STDIO,
          status: {
            valid: true,
            connected: true,
          },
          enabled: true,
        },
      ],
      timestamp: '2025-01-01T00:00:00.000Z',
    };

    it('should get MCP server status successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockServerStatus),
      });

      const result = await mcpChat.getMCPServerStatus();

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('mcp-chat');
      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/mcp/status`);
      expect(result).toEqual(mockServerStatus);
    });

    it('should handle HTTP errors', async () => {
      const response = {
        ok: false,
        statusText: 'Not Found',
      };
      mockFetch.mockResolvedValueOnce(response);
      const mockResponseError = new Error('Not Found') as any;
      mockResponseError.response = response;
      mockResponseError.statusCode = 404;
      mockResponseError.statusText = 'Not Found';
      jest
        .spyOn(ResponseError, 'fromResponse')
        .mockResolvedValueOnce(mockResponseError);

      await expect(mcpChat.getMCPServerStatus()).rejects.toThrow('Not Found');
    });
  });

  describe('getAvailableTools', () => {
    const mockToolsResponse: ToolsResponse = {
      message: 'Tools fetched successfully',
      serverConfigs: [
        {
          name: 'test-server',
          type: MCPServerType.STDIO,
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
      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/tools`);
      expect(result).toEqual(mockToolsResponse);
    });

    it('should handle HTTP errors', async () => {
      const response = {
        ok: false,
        statusText: 'Service Unavailable',
      };
      mockFetch.mockResolvedValueOnce(response);
      const mockResponseError = new Error('Service Unavailable') as any;
      mockResponseError.response = response;
      mockResponseError.statusCode = 503;
      mockResponseError.statusText = 'Service Unavailable';
      jest
        .spyOn(ResponseError, 'fromResponse')
        .mockResolvedValueOnce(mockResponseError);

      await expect(mcpChat.getAvailableTools()).rejects.toThrow(
        'Service Unavailable',
      );
    });
  });

  describe('getProviderStatus', () => {
    const mockProviderStatus: ProviderStatusData = {
      providers: [
        {
          id: 'openai',
          model: 'gpt-4',
          baseUrl: 'https://api.openai.com',
          connection: {
            connected: true,
            models: ['gpt-4', 'gpt-3.5-turbo'],
          },
        },
      ],
      summary: {
        totalProviders: 1,
        healthyProviders: 1,
      },
      timestamp: '2025-01-01T00:00:00Z',
    };

    it('should get provider status successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProviderStatus),
      });

      const result = await mcpChat.getProviderStatus();

      expect(mockDiscoveryApi.getBaseUrl).toHaveBeenCalledWith('mcp-chat');
      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/provider/status`);
      expect(result).toEqual(mockProviderStatus);
    });

    it('should handle HTTP errors', async () => {
      const response = {
        ok: false,
        statusText: 'Unauthorized',
      };
      mockFetch.mockResolvedValueOnce(response);
      const mockResponseError = new Error('Unauthorized') as any;
      mockResponseError.response = response;
      mockResponseError.statusCode = 401;
      mockResponseError.statusText = 'Unauthorized';
      jest
        .spyOn(ResponseError, 'fromResponse')
        .mockResolvedValueOnce(mockResponseError);

      await expect(mcpChat.getProviderStatus()).rejects.toThrow('Unauthorized');
    });
  });
});
