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
import { InputError } from '@backstage/errors';
import express from 'express';
import request from 'supertest';
import { createRouter } from './router';
import { MCPClientService } from './services/MCPClientService';
import { MCPServerType } from './types';

describe('createRouter', () => {
  let app: express.Express;
  let mcpClientService: jest.Mocked<MCPClientService>;

  beforeEach(async () => {
    mcpClientService = {
      initializeMCPServers: jest.fn(),
      processQuery: jest.fn(),
      getAvailableTools: jest.fn(),
      getProviderStatus: jest.fn(),
      getMCPServerStatus: jest.fn(),
    };

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      mcpClientService,
    });

    app = express();
    app.use(router);

    // Add error handling middleware
    app.use(
      (
        err: any,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        if (err instanceof InputError) {
          return res
            .status(400)
            .json({ error: { name: err.name, message: err.message } });
        }
        return res.status(500).json({ error: err.message });
      },
    );
  });

  describe('GET /provider/status', () => {
    it('should return provider status successfully', async () => {
      const mockStatus = {
        providers: [
          {
            id: 'openai',
            model: 'gpt-4o-mini',
            baseUrl: 'https://api.openai.com/v1',
            connection: {
              connected: true,
            },
          },
        ],
        summary: {
          totalProviders: 1,
          healthyProviders: 1,
        },
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      mcpClientService.getProviderStatus.mockResolvedValue(mockStatus);

      const response = await request(app).get('/provider/status');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStatus);
      expect(mcpClientService.getProviderStatus).toHaveBeenCalledTimes(1);
    });

    it('should handle provider status errors', async () => {
      mcpClientService.getProviderStatus.mockRejectedValue(
        new Error('Provider connection failed'),
      );

      const response = await request(app).get('/provider/status');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /mcp/status', () => {
    it('should return MCP server status successfully', async () => {
      const mockStatus = {
        total: 2,
        valid: 2,
        active: 2,
        servers: [
          {
            id: 'brave-search',
            name: 'Brave Search',
            type: MCPServerType.STDIO,
            status: {
              valid: true,
              connected: true,
            },
          },
          {
            id: 'backstage-server',
            name: 'Backstage Server',
            type: MCPServerType.SSE,
            status: {
              valid: true,
              connected: true,
            },
          },
        ],
        timestamp: '2025-01-01T00:00:00.000Z',
      };

      mcpClientService.getMCPServerStatus.mockResolvedValue(mockStatus);

      const response = await request(app).get('/mcp/status');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStatus);
      expect(mcpClientService.getMCPServerStatus).toHaveBeenCalledTimes(1);
    });

    it('should handle MCP status errors', async () => {
      mcpClientService.getMCPServerStatus.mockRejectedValue(
        new Error('MCP status failed'),
      );

      const response = await request(app).get('/mcp/status');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /tools', () => {
    it('should return available tools successfully', async () => {
      const mockTools = [
        {
          serverId: 'brave-search',
          type: 'function' as const,
          function: {
            name: 'search_web',
            description: 'Search the web',
            parameters: {},
          },
        },
        {
          serverId: 'weather-server',
          type: 'function' as const,
          function: {
            name: 'get_weather',
            description: 'Get weather information',
            parameters: {},
          },
        },
      ];

      mcpClientService.getAvailableTools.mockReturnValue(mockTools);

      const response = await request(app).get('/tools');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        availableTools: mockTools,
        toolCount: 2,
        timestamp: expect.any(String),
      });
      expect(mcpClientService.getAvailableTools).toHaveBeenCalledTimes(1);
    });

    it('should return empty tools list', async () => {
      mcpClientService.getAvailableTools.mockReturnValue([]);

      const response = await request(app).get('/tools');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        availableTools: [],
        toolCount: 0,
        timestamp: expect.any(String),
      });
    });
  });

  describe('POST /chat', () => {
    const validMessages = [
      { role: 'user', content: 'Hello, what can you help me with?' },
    ];

    it('should process chat request without tools', async () => {
      const mockResponse = {
        reply: 'Hello! I can help you with various tasks.',
        toolCalls: [],
        toolResponses: [],
      };

      mcpClientService.processQuery.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/chat')
        .send({ messages: validMessages, enabledTools: [] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        role: 'assistant',
        content: 'Hello! I can help you with various tasks.',
        toolResponses: [],
        toolsUsed: [],
      });
      expect(mcpClientService.processQuery).toHaveBeenCalledWith(
        validMessages,
        [],
      );
    });

    it('should process chat request with tools', async () => {
      const mockToolCall = {
        id: 'call_123',
        type: 'function' as const,
        function: {
          name: 'search_web',
          arguments: JSON.stringify({ query: 'test' }),
        },
      };

      const mockResponse = {
        reply: 'I found some search results.',
        toolCalls: [mockToolCall],
        toolResponses: [{ toolName: 'search_web', result: 'Results here' }],
      };

      mcpClientService.processQuery.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/chat')
        .send({ messages: validMessages, enabledTools: ['search_web'] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        role: 'assistant',
        content: 'I found some search results.',
        toolResponses: [{ toolName: 'search_web', result: 'Results here' }],
        toolsUsed: ['search_web'],
      });
    });

    it('should return 400 for empty messages array', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ messages: [], enabledTools: [] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'At least one message is required',
      });
    });

    it('should return 400 for missing messages', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ enabledTools: [] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Messages field is required',
      });
    });

    it('should return 400 for invalid message structure', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ messages: [{ role: 'user' }], enabledTools: [] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Message at index 0 is missing required field 'content'",
      });
    });

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          messages: [{ role: 'invalid', content: 'test' }],
          enabledTools: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('invalid role');
    });

    it('should return 400 for empty content', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          messages: [{ role: 'user', content: '' }],
          enabledTools: [],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Message at index 0 has empty content',
      });
    });

    it('should return 400 for null content', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          messages: [{ role: 'user', content: null }],
          enabledTools: [],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Message at index 0 has empty content',
      });
    });

    it('should return 400 for non-user last message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          messages: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there' },
          ],
          enabledTools: [],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Last message must be from user',
      });
    });

    it('should return 400 for non-array enabledTools', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ messages: validMessages, enabledTools: 'not-array' });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        name: 'InputError',
        message: 'enabledTools must be an array',
      });
    });

    it('should return 400 for non-string enabledTools elements', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ messages: validMessages, enabledTools: [123, 'valid'] });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        name: 'InputError',
        message: 'All enabledTools must be strings',
      });
    });

    it('should handle processQuery errors', async () => {
      mcpClientService.processQuery.mockRejectedValue(
        new Error('Query processing failed'),
      );

      const response = await request(app)
        .post('/chat')
        .send({ messages: validMessages, enabledTools: [] });

      expect(response.status).toBe(500);
    });

    it('should handle enabledTools being undefined', async () => {
      const mockResponse = {
        reply: 'Response without tools',
        toolCalls: [],
        toolResponses: [],
      };

      mcpClientService.processQuery.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/chat')
        .send({ messages: validMessages });

      expect(response.status).toBe(200);
      expect(mcpClientService.processQuery).toHaveBeenCalledWith(
        validMessages,
        [],
      );
    });
  });
});
