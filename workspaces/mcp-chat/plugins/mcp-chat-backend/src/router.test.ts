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
import { mockErrorHandler, mockServices } from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';
import { ServerConfig } from './types';
import { MCPClientService } from './services';
import { ToolCall } from './providers/base-provider';

describe('createRouter', () => {
  let app: express.Express;
  let mcpClientService: jest.Mocked<MCPClientService>;
  let mockConfig: any;

  const mockServerConfigs: ServerConfig[] = [
    {
      id: 'brave-search',
      name: 'Brave Search Server',
      npxCommand: '@modelcontextprotocol/server-brave-search@latest',
      type: 'stdio',
      env: { BRAVE_API_KEY: 'test-key' },
    },
    {
      id: 'backstage-server',
      name: 'Backstage Server',
      url: 'http://localhost:7007/api/mcp-actions/v1',
      type: 'sse',
      headers: { Authorization: 'Bearer test-token' },
    },
  ];

  const mockToolCall: ToolCall = {
    id: 'call_123',
    type: 'function',
    function: {
      name: 'search_web',
      arguments: JSON.stringify({ query: 'test query' }),
    },
  };

  const mockToolResponse = {
    toolName: 'search_web',
    result: 'Search results here',
    success: true,
  };

  beforeEach(async () => {
    // Mock MCPClientService
    mcpClientService = {
      initMCP: jest.fn().mockResolvedValue(undefined),
      processQuery: jest.fn().mockResolvedValue({
        reply: 'Test response',
        toolCalls: [],
        toolResponses: [],
      }),
      getAvailableTools: jest.fn().mockReturnValue([]),
      getProviderConfig: jest.fn().mockResolvedValue({
        provider: 'openai',
        model: 'gpt-4o-mini',
        baseURL: 'https://api.openai.com/v1',
      }),
      getProviderStatus: jest.fn().mockReturnValue({
        connected: true,
        provider: 'openai',
        model: 'gpt-4o-mini',
        baseURL: 'https://api.openai.com/v1',
      }),
      testProviderConnection: jest.fn().mockResolvedValue({
        connected: true,
        models: ['gpt-4o-mini', 'gpt-4'],
      }),
      getMCPServerStatus: jest.fn().mockReturnValue({
        connectedServers: ['Brave Search Server', 'Backstage Server'],
        totalConnectedServers: 2,
        isInitialized: true,
        availableTools: 0,
      }),
    };

    // Mock config service
    mockConfig = {
      getOptionalConfigArray: jest.fn().mockReturnValue([
        {
          getOptionalString: jest.fn((key: string) => {
            const config = mockServerConfigs[0];
            return config[key as keyof ServerConfig];
          }),
          getString: jest.fn((key: string) => {
            const config = mockServerConfigs[0];
            return config[key as keyof ServerConfig];
          }),
          getOptionalStringArray: jest.fn(() => undefined),
          has: jest.fn((key: string) => {
            return key === 'env' || key === 'npxCommand';
          }),
          getConfig: jest.fn((_key: string) => ({
            get: jest.fn(() => mockServerConfigs[0].env),
          })),
          getOptionalConfig: jest.fn((key: string) => {
            if (key === 'env') {
              return { get: jest.fn(() => mockServerConfigs[0].env) };
            }
            if (key === 'headers') {
              return undefined;
            }
            return undefined;
          }),
        },
        {
          getOptionalString: jest.fn((key: string) => {
            const config = mockServerConfigs[1];
            return config[key as keyof ServerConfig];
          }),
          getString: jest.fn((key: string) => {
            const config = mockServerConfigs[1];
            return config[key as keyof ServerConfig];
          }),
          getOptionalStringArray: jest.fn(() => undefined),
          has: jest.fn((key: string) => {
            return key === 'headers' || key === 'url';
          }),
          getConfig: jest.fn((_key: string) => ({
            get: jest.fn(() => mockServerConfigs[1].headers),
          })),
          getOptionalConfig: jest.fn((key: string) => {
            if (key === 'headers') {
              return { get: jest.fn(() => mockServerConfigs[1].headers) };
            }
            if (key === 'env') {
              return undefined;
            }
            return undefined;
          }),
        },
      ]),
    };

    const router = await createRouter({
      httpAuth: mockServices.httpAuth(),
      mcpClientService,
      config: mockConfig,
    });

    app = express();
    app.use(router);
    app.use(mockErrorHandler());
  });

  describe('GET /config/status', () => {
    it('should return configuration status successfully', async () => {
      const response = await request(app).get('/config/status');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        provider: {
          connected: true,
          provider: 'openai',
          model: 'gpt-4o-mini',
          baseURL: 'https://api.openai.com/v1',
        },
        mcpServers: {
          total: 2,
          valid: 2,
          invalid: 0,
          servers: [
            {
              id: 'brave-search',
              name: 'Brave Search Server',
              type: 'stdio',
              configuredType: 'stdio',
              hasUrl: false,
              hasNpxCommand: true,
              hasScriptPath: false,
              hasArgs: false,
              hasEnv: true,
              hasHeaders: false,
              isValid: true,
              validationIssues: [],
            },
            {
              id: 'backstage-server',
              name: 'Backstage Server',
              type: 'sse',
              configuredType: 'sse',
              hasUrl: true,
              hasNpxCommand: false,
              hasScriptPath: false,
              hasArgs: false,
              hasEnv: false,
              hasHeaders: true,
              isValid: true,
              validationIssues: [],
            },
          ],
        },
        summary: {
          hasValidServers: true,
          configurationComplete: true,
          issues: [],
        },
        timestamp: expect.any(String),
      });
      expect(mcpClientService.getProviderStatus).toHaveBeenCalled();
    });

    it('should handle configuration errors gracefully', async () => {
      mcpClientService.getProviderStatus.mockImplementation(() => {
        throw new Error('Provider connection failed');
      });

      const response = await request(app).get('/config/status');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
        }),
      });
    });
  });

  describe('POST /chat', () => {
    const validChatRequest = {
      messages: [
        { role: 'user', content: 'Hello, what can you help me with?' },
      ],
      enabledTools: ['search_web'],
    };

    it('should process chat request without tools successfully', async () => {
      mcpClientService.processQuery.mockResolvedValue({
        reply: 'Hello! I can help you with various tasks.',
        toolCalls: [],
        toolResponses: [],
      });

      const response = await request(app).post('/chat').send(validChatRequest);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        role: 'assistant',
        content: 'Hello! I can help you with various tasks.',
        toolResponses: [],
        toolsUsed: [],
      });
      expect(mcpClientService.initMCP).toHaveBeenCalled();
      expect(mcpClientService.processQuery).toHaveBeenCalledWith(
        validChatRequest.messages,
        validChatRequest.enabledTools,
      );
    });

    it('should process chat request with tools successfully', async () => {
      mcpClientService.processQuery.mockResolvedValue({
        reply: 'I found some search results for you.',
        toolCalls: [mockToolCall],
        toolResponses: [mockToolResponse],
      });

      const response = await request(app).post('/chat').send(validChatRequest);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        role: 'assistant',
        content: 'I found some search results for you.',
        toolResponses: [mockToolResponse],
        toolsUsed: ['search_web'],
      });
    });

    it('should return 400 for empty messages array', async () => {
      const response = await request(app).post('/chat').send({
        messages: [],
        enabledTools: [],
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'No query provided',
      });
    });

    it('should return 400 for messages without content', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          messages: [{ role: 'user' }],
          enabledTools: [],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'No query provided',
      });
    });

    it('should handle MCP initialization errors', async () => {
      mcpClientService.initMCP.mockRejectedValue(new Error('MCP init failed'));

      const response = await request(app).post('/chat').send(validChatRequest);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
        }),
      });
    });

    it('should handle query processing errors', async () => {
      mcpClientService.processQuery.mockRejectedValue(
        new Error('Query processing failed'),
      );

      const response = await request(app).post('/chat').send(validChatRequest);

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
        }),
      });
    });
  });

  describe('GET /tools', () => {
    it('should return tools check information', async () => {
      mcpClientService.getAvailableTools = jest.fn().mockReturnValue([
        { name: 'search_web', description: 'Search the web' },
        { name: 'get_weather', description: 'Get weather information' },
      ]);

      const response = await request(app).get('/tools');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: 'Tools check completed',
        availableTools: expect.arrayContaining([
          { name: 'search_web', description: 'Search the web' },
          { name: 'get_weather', description: 'Get weather information' },
        ]),
        toolCount: 2,
        timestamp: expect.any(String),
      });
    });

    it('should handle tools check errors', async () => {
      mcpClientService.initMCP.mockRejectedValue(
        new Error('Tools check failed'),
      );

      const response = await request(app).get('/tools');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: expect.objectContaining({
          message: expect.any(String),
          name: expect.any(String),
        }),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed JSON in requests', async () => {
      const response = await request(app)
        .post('/chat')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should handle null content in messages', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          messages: [{ role: 'user', content: null }],
          enabledTools: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No query provided');
    });

    it('should handle mixed server configurations', async () => {
      const mixedConfigs = [
        {
          getOptionalString: jest.fn((key: string) => {
            const mapping: Record<string, string> = {
              id: 'stdio-server',
              type: 'stdio',
            };
            return mapping[key];
          }),
          getString: jest.fn(() => 'STDIO Server'),
          getOptionalStringArray: jest.fn(() => undefined),
          has: jest.fn(() => false),
          getConfig: jest.fn(() => ({ get: jest.fn(() => ({})) })),
        },
        {
          getOptionalString: jest.fn((key: string) => {
            const mapping: Record<string, string> = {
              id: 'sse-server',
              url: 'http://example.com/sse',
              type: 'sse',
            };
            return mapping[key];
          }),
          getString: jest.fn(() => 'SSE Server'),
          getOptionalStringArray: jest.fn(() => undefined),
          has: jest.fn((key: string) => key === 'url'),
          getConfig: jest.fn(() => ({ get: jest.fn(() => ({})) })),
        },
      ];

      mockConfig.getOptionalConfigArray.mockReturnValue(mixedConfigs);

      const response = await request(app).get('/config/status');

      expect(response.status).toBe(200);
      expect(response.body.mcpServers.servers).toHaveLength(2);
      expect(response.body.mcpServers.total).toBe(2);
      expect(response.body.mcpServers.valid).toBe(1);
      expect(response.body.mcpServers.invalid).toBe(1);
    });
  });
});
