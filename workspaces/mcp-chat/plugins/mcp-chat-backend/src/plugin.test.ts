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
import { startTestBackend } from '@backstage/backend-test-utils';
import { mcpChatPlugin } from './plugin';
import request from 'supertest';
import { TestBackend } from '@backstage/backend-test-utils';

// Mock the MCPClientServiceImpl to avoid actual MCP connections during tests
jest.mock('./services/MCPClientServiceImpl', () => ({
  MCPClientServiceImpl: jest.fn().mockImplementation(() => ({
    initMCP: jest.fn().mockResolvedValue(undefined),
    processQuery: jest.fn().mockResolvedValue({
      reply: 'Mocked response from MCP',
      toolCalls: [],
      toolResponses: [],
    }),
    getAvailableTools: jest.fn().mockReturnValue([]),
    getProviderConfig: jest.fn().mockReturnValue({
      id: 'openai',
      model: 'gpt-4o-mini',
    }),
    getProviderStatus: jest.fn().mockReturnValue({
      connected: true,
      provider: 'openai',
      model: 'gpt-4o-mini',
    }),
  })),
}));

// Mock the provider factory to avoid configuration issues
jest.mock('./providers/provider-factory', () => ({
  getProviderConfig: jest.fn().mockReturnValue({
    type: 'openai',
    id: 'openai',
    model: 'gpt-4o-mini',
    apiKey: 'mock-api-key',
  }),
  getProviderInfo: jest.fn().mockReturnValue({
    name: 'OpenAI',
    supportedModels: ['gpt-4o-mini'],
  }),
  ProviderFactory: {
    createProvider: jest.fn().mockReturnValue({
      generateResponse: jest.fn().mockResolvedValue({
        content: 'Mocked response',
        toolCalls: [],
      }),
    }),
  },
}));

describe('mcpChatPlugin', () => {
  let backend: TestBackend;

  beforeEach(async () => {
    backend = await startTestBackend({
      features: [mcpChatPlugin],
    });
  });

  afterEach(async () => {
    await backend?.stop();
  });

  describe('Plugin Registration', () => {
    it('should register the plugin successfully', async () => {
      expect(backend).toBeDefined();
      expect(backend.server).toBeDefined();
    });
  });

  describe('HTTP Routes', () => {
    describe('GET /api/mcp-chat/config/status', () => {
      it('should return configuration status', async () => {
        const response = await request(backend.server)
          .get('/api/mcp-chat/config/status')
          .expect(200);

        expect(response.body).toHaveProperty('provider');
        expect(response.body).toHaveProperty('mcpServers');
        expect(Array.isArray(response.body.mcpServers)).toBe(true);
      });
    });

    describe('POST /api/mcp-chat/chat', () => {
      it('should process chat messages successfully', async () => {
        const chatRequest = {
          messages: [
            { role: 'user', content: 'Hello, what tools are available?' },
          ],
          enabledTools: [],
        };

        const response = await request(backend.server)
          .post('/api/mcp-chat/chat')
          .send(chatRequest)
          .expect(200);

        expect(response.body).toHaveProperty('role');
        expect(response.body).toHaveProperty('content');
        expect(response.body.role).toBe('assistant');
      });

      it('should handle chat request with enabled tools', async () => {
        const chatRequest = {
          messages: [{ role: 'user', content: 'Search for latest news' }],
          enabledTools: ['search_web'],
        };

        const response = await request(backend.server)
          .post('/api/mcp-chat/chat')
          .send(chatRequest)
          .expect(200);

        expect(response.body.role).toBe('assistant');
        expect(response.body).toHaveProperty('content');
        expect(response.body).toHaveProperty('toolResponses');
      });

      it('should return 400 for empty messages', async () => {
        const response = await request(backend.server)
          .post('/api/mcp-chat/chat')
          .send({
            messages: [],
            enabledTools: [],
          })
          .expect(400);

        expect(response.body.error).toBe('No query provided');
      });

      it('should return 400 for missing content in last message', async () => {
        const response = await request(backend.server)
          .post('/api/mcp-chat/chat')
          .send({
            messages: [{ role: 'user' }],
            enabledTools: [],
          })
          .expect(400);

        expect(response.body.error).toBe('No query provided');
      });

      it('should handle malformed JSON requests', async () => {
        await request(backend.server)
          .post('/api/mcp-chat/chat')
          .set('Content-Type', 'application/json')
          .send('invalid json')
          .expect(400);
      });

      it('should handle missing messages field', async () => {
        const response = await request(backend.server)
          .post('/api/mcp-chat/chat')
          .send({
            enabledTools: [],
          })
          .expect(400);

        expect(response.body.error).toBe('No query provided');
      });
    });

    describe('GET /api/mcp-chat/test/latest-news', () => {
      it('should return test response for latest news', async () => {
        const response = await request(backend.server)
          .get('/api/mcp-chat/test/latest-news')
          .expect(200);

        expect(response.body).toHaveProperty('prompt');
        expect(response.body).toHaveProperty('reply');
        expect(response.body).toHaveProperty('toolCalls');
        expect(response.body).toHaveProperty('toolResponses');
        expect(response.body).toHaveProperty('serverConfigs');
        expect(response.body).toHaveProperty('role');
      });

      it('should include current month and year in prompt', async () => {
        const response = await request(backend.server)
          .get('/api/mcp-chat/test/latest-news')
          .expect(200);

        const now = new Date();
        const currentMonth = now.toLocaleString('en-US', { month: 'long' });
        const currentYear = now.getFullYear();

        expect(response.body.prompt).toContain(currentMonth);
        expect(response.body.prompt).toContain(currentYear.toString());
      });
    });

    describe('GET /api/mcp-chat/test/tools', () => {
      it('should return tools information', async () => {
        const response = await request(backend.server)
          .get('/api/mcp-chat/test/tools')
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('serverConfigs');
        expect(response.body).toHaveProperty('availableTools');
        expect(response.body).toHaveProperty('toolCount');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body.message).toBe('Tools check completed');
      });

      it('should include server configuration details', async () => {
        const response = await request(backend.server)
          .get('/api/mcp-chat/test/tools')
          .expect(200);

        expect(Array.isArray(response.body.serverConfigs)).toBe(true);
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should allow unauthenticated access to all endpoints', async () => {
      // Test that endpoints are accessible without authentication
      await request(backend.server)
        .get('/api/mcp-chat/config/status')
        .expect(200);

      await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send({
          messages: [{ role: 'user', content: 'test' }],
          enabledTools: [],
        })
        .expect(200);

      await request(backend.server)
        .get('/api/mcp-chat/test/latest-news')
        .expect(200);

      await request(backend.server).get('/api/mcp-chat/test/tools').expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid route gracefully', async () => {
      await request(backend.server)
        .get('/api/mcp-chat/nonexistent')
        .expect(404);
    });

    it('should handle invalid HTTP methods', async () => {
      await request(backend.server)
        .put('/api/mcp-chat/config/status')
        .expect(404);

      await request(backend.server).delete('/api/mcp-chat/chat').expect(404);
    });

    it('should handle large payloads', async () => {
      const largeMessage = 'a'.repeat(100000);
      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send({
          messages: [{ role: 'user', content: largeMessage }],
          enabledTools: [],
        });

      // Should either succeed or fail gracefully
      expect([200, 413, 500]).toContain(response.status);
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent chat requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) =>
        request(backend.server)
          .post('/api/mcp-chat/chat')
          .send({
            messages: [{ role: 'user', content: `Message ${i}` }],
            enabledTools: [],
          }),
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect([200, 500]).toContain(response.status);
      });
    });

    it('should handle concurrent config status requests', async () => {
      const requests = Array.from({ length: 3 }, () =>
        request(backend.server).get('/api/mcp-chat/config/status'),
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Tool Integration', () => {
    it('should handle empty enabled tools array', async () => {
      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send({
          messages: [{ role: 'user', content: 'test' }],
          enabledTools: [],
        })
        .expect(200);

      expect(response.body.role).toBe('assistant');
    });

    it('should handle missing enabled tools field', async () => {
      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send({
          messages: [{ role: 'user', content: 'test' }],
        })
        .expect(200);

      expect(response.body.role).toBe('assistant');
    });

    it('should handle various tool names', async () => {
      const toolSets = [
        ['search_web'],
        ['get_weather', 'search_web'],
        ['nonexistent_tool'],
        [],
      ];

      for (const enabledTools of toolSets) {
        const response = await request(backend.server)
          .post('/api/mcp-chat/chat')
          .send({
            messages: [{ role: 'user', content: 'test' }],
            enabledTools,
          });

        expect([200, 500]).toContain(response.status);
      }
    });
  });

  describe('Message Format Validation', () => {
    it('should handle various message formats', async () => {
      const messageFormats = [
        [{ role: 'user', content: 'simple message' }],
        [
          { role: 'system', content: 'You are helpful' },
          { role: 'user', content: 'help me' },
        ],
        [
          { role: 'user', content: 'first' },
          { role: 'assistant', content: 'response' },
          { role: 'user', content: 'follow up' },
        ],
      ];

      for (const messages of messageFormats) {
        const response = await request(backend.server)
          .post('/api/mcp-chat/chat')
          .send({
            messages,
            enabledTools: [],
          });

        expect([200, 400, 500]).toContain(response.status);
      }
    });

    it('should handle messages with special characters', async () => {
      const specialMessages = [
        'Hello 🌍 world!',
        'Test with "quotes" and \'apostrophes\'',
        'Unicode: café, naïve, résumé',
        'Emoji: 😀 😃 😄 😁',
        'Newlines\nand\ttabs',
        JSON.stringify({ nested: 'object' }),
      ];

      for (const content of specialMessages) {
        const response = await request(backend.server)
          .post('/api/mcp-chat/chat')
          .send({
            messages: [{ role: 'user', content }],
            enabledTools: [],
          });

        expect([200, 400, 500]).toContain(response.status);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string content', async () => {
      const response = await request(backend.server)
        .post('/api/mcp-chat/chat')
        .send({
          messages: [{ role: 'user', content: '' }],
          enabledTools: [],
        })
        .expect(400);

      expect(response.body.error).toBe('No query provided');
    });

    it('should handle null and undefined values', async () => {
      const badRequests = [
        { messages: null, enabledTools: [] },
        { messages: undefined, enabledTools: [] },
        { messages: [{ role: 'user', content: null }], enabledTools: [] },
        { messages: [{ role: 'user', content: undefined }], enabledTools: [] },
      ];

      for (const badRequest of badRequests) {
        const response = await request(backend.server)
          .post('/api/mcp-chat/chat')
          .send(badRequest);

        expect([400, 500]).toContain(response.status);
      }
    });

    it('should handle missing required fields', async () => {
      const badRequests = [
        { enabledTools: [] }, // missing messages
        { messages: [] }, // missing enabledTools is OK, empty messages is not
        {}, // missing everything
      ];

      for (const badRequest of badRequests) {
        const response = await request(backend.server)
          .post('/api/mcp-chat/chat')
          .send(badRequest);

        expect(response.status).toBe(400);
      }
    });
  });
});
