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
import { startTestBackend, mockServices } from '@backstage/backend-test-utils';
import { mcpChatPlugin } from './plugin';
import request from 'supertest';
import { TestBackend } from '@backstage/backend-test-utils';
import { MCPServerType } from './types';

jest.mock('./services/MCPClientServiceImpl', () => ({
  MCPClientServiceImpl: jest.fn().mockImplementation(() => ({
    initializeMCPServers: jest.fn().mockResolvedValue([
      {
        id: 'test-server',
        name: 'test-server',
        type: MCPServerType.STDIO,
        scriptPath: '/path/to/test-script.py',
        status: {
          valid: true,
          connected: true,
        },
      },
    ]),
    processQuery: jest.fn().mockResolvedValue({
      reply: 'Test response',
      toolCalls: [],
      toolResponses: [],
    }),
    getAvailableTools: jest.fn().mockReturnValue([
      {
        type: 'function',
        function: { name: 'test_tool', description: 'Test tool' },
        serverId: 'test-server',
      },
    ]),
    getProviderStatus: jest.fn().mockResolvedValue({
      providers: [
        {
          id: 'openai',
          model: 'gpt-4o-mini',
          baseUrl: 'https://api.openai.com/v1',
          connection: {
            connected: true,
            models: ['gpt-4o-mini'],
          },
        },
      ],
      summary: {
        totalProviders: 1,
        healthyProviders: 1,
      },
      timestamp: new Date().toISOString(),
    }),
    getMCPServerStatus: jest.fn().mockResolvedValue({
      total: 1,
      valid: 1,
      active: 1,
      servers: [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/test-script.py',
          status: {
            valid: true,
            connected: true,
          },
        },
      ],
      timestamp: new Date().toISOString(),
    }),
  })),
}));

jest.mock('./utils', () => ({
  validateConfig: jest.fn(),
  validateMessages: jest.fn().mockReturnValue({ isValid: true }),
}));

const mockConfig = {
  mcpChat: {
    providers: [
      {
        id: 'openai',
        model: 'gpt-4o-mini',
        token: 'test-token',
      },
    ],
    mcpServers: [
      {
        name: 'test-server',
        scriptPath: '/path/to/test-script.py',
      },
    ],
  },
};

describe('mcpChatPlugin', () => {
  let backend: TestBackend;
  const { validateMessages } = require('./utils');

  beforeEach(async () => {
    backend = await startTestBackend({
      features: [
        mcpChatPlugin,
        mockServices.rootConfig.factory({
          data: mockConfig,
        }),
      ],
    });
    validateMessages.mockReturnValue({ isValid: true });
  });

  afterEach(async () => {
    await backend?.stop();
    jest.clearAllMocks();
  });

  describe('Plugin Registration', () => {
    it('should register the plugin successfully', async () => {
      expect(backend).toBeDefined();
      expect(backend.server).toBeDefined();
    });

    it('should set up unauthenticated access policy', async () => {
      const response = await request(backend.server)
        .get('/api/mcp-chat/provider/status')
        .expect(200);

      expect(response.body).toHaveProperty('providers');
    });
  });

  describe('Provider Status Endpoint', () => {
    it('should return provider status information', async () => {
      const response = await request(backend.server)
        .get('/api/mcp-chat/provider/status')
        .expect(200);

      expect(response.body).toHaveProperty('providers');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.providers)).toBe(true);
    });
  });

  describe('MCP Server Status Endpoint', () => {
    it('should return MCP server status information', async () => {
      const response = await request(backend.server)
        .get('/api/mcp-chat/mcp/status')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('valid');
      expect(response.body).toHaveProperty('active');
      expect(response.body).toHaveProperty('servers');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.servers)).toBe(true);
    });
  });

  describe('Chat Endpoint', () => {
    it('should process valid chat requests', async () => {
      const chatRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        enabledTools: [],
      };

      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send(chatRequest)
        .expect(200);

      expect(response.body).toHaveProperty('role', 'assistant');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('toolResponses');
      expect(response.body).toHaveProperty('toolsUsed');
    });

    it('should handle chat requests with tools', async () => {
      const chatRequest = {
        messages: [{ role: 'user', content: 'Use a tool' }],
        enabledTools: ['test-server'],
      };

      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send(chatRequest)
        .expect(200);

      expect(response.body.role).toBe('assistant');
      expect(Array.isArray(response.body.toolResponses)).toBe(true);
      expect(Array.isArray(response.body.toolsUsed)).toBe(true);
    });

    it('should validate messages and return error for invalid messages', async () => {
      validateMessages.mockReturnValue({
        isValid: false,
        error: 'Messages field is required',
      });

      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Messages field is required');
    });

    it('should validate messages and return error for empty messages', async () => {
      validateMessages.mockReturnValue({
        isValid: false,
        error: 'At least one message is required',
      });

      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send({ messages: [], enabledTools: [] })
        .expect(400);

      expect(response.body.error).toBe('At least one message is required');
    });

    it('should reject invalid enabledTools', async () => {
      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send({
          messages: [{ role: 'user', content: 'Hello' }],
          enabledTools: 'not-an-array',
        })
        .expect(400);

      expect(response.body.error).toMatchObject({
        name: 'InputError',
        message: 'enabledTools must be an array',
      });
    });

    it('should reject non-string enabledTools', async () => {
      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send({
          messages: [{ role: 'user', content: 'Hello' }],
          enabledTools: [123, 'valid'],
        })
        .expect(400);

      expect(response.body.error).toMatchObject({
        name: 'InputError',
        message: 'All enabledTools must be strings',
      });
    });
  });

  describe('Tools Endpoint', () => {
    it('should return available tools information', async () => {
      const response = await request(backend.server)
        .get('/api/mcp-chat/tools')
        .expect(200);

      expect(response.body).toHaveProperty('availableTools');
      expect(response.body).toHaveProperty('toolCount');
      expect(response.body).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.availableTools)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes', async () => {
      const response = await request(backend.server)
        .get('/api/mcp-chat/invalid-route')
        .expect(404);

      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.status).toBe(400);
    });
  });
});
