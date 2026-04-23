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
import {
  MCPClientService,
  ChatConversationStore,
  SummarizationService,
} from './services';
import { ChatMessage, MCPServerType } from './types';

describe('createRouter', () => {
  let app: express.Express;
  let mcpClientService: jest.Mocked<MCPClientService>;
  let conversationStore: jest.Mocked<ChatConversationStore>;
  let summarizationService: jest.Mocked<SummarizationService>;
  let mockHttpAuth: ReturnType<typeof mockServices.httpAuth.mock>;

  beforeEach(async () => {
    mcpClientService = {
      initializeMCPServers: jest.fn(),
      processQuery: jest.fn(),
      processApprovalDecisions: jest.fn(),
      getAvailableTools: jest.fn(),
      getProviderStatus: jest.fn(),
      getMCPServerStatus: jest.fn(),
    };

    conversationStore = {
      saveConversation: jest.fn(),
      getConversations: jest.fn(),
      getConversationById: jest.fn(),
      deleteUserConversations: jest.fn(),
      deleteConversation: jest.fn(),
      toggleStarred: jest.fn(),
      updateTitle: jest.fn(),
    } as unknown as jest.Mocked<ChatConversationStore>;

    summarizationService = {
      summarizeConversation: jest.fn().mockResolvedValue('Test Title'),
    } as unknown as jest.Mocked<SummarizationService>;

    mockHttpAuth = mockServices.httpAuth.mock();

    const router = await createRouter({
      logger: mockServices.logger.mock(),
      mcpClientService,
      conversationStore,
      httpAuth: mockHttpAuth,
      summarizationService,
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
            type: MCPServerType.STREAMABLE_HTTP,
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
    const userQuery = 'Hello, what can you help me with?';
    const mockToolCall = {
      id: 'call_123',
      type: 'function' as const,
      function: {
        name: 'search_web',
        arguments: JSON.stringify({ query: 'test' }),
      },
    };

    const buildUserMessage = (query: string): ChatMessage => {
      return {
        role: 'user',
        content: query,
        metadata: {
          id: '2',
          timestamp: new Date(2),
        },
      };
    };

    const parseMessages = (messages: ChatMessage[]): ChatMessage[] => {
      return JSON.parse(JSON.stringify(messages));
    };

    it('should process chat request without tools', async () => {
      const mockResponse: ChatMessage[] = [
        buildUserMessage(userQuery),
        {
          role: 'assistant',
          content: 'Hello! I can help you with various tasks.',
          metadata: { id: '2', timestamp: new Date(2) },
        },
      ];

      mcpClientService.processQuery.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/chat')
        .send({ messages: [], userMessage: userQuery, enabledTools: [] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        messages: parseMessages(mockResponse),
        conversationId: expect.any(String),
      });
      expect(mcpClientService.processQuery).toHaveBeenCalledWith(
        [],
        userQuery,
        [],
      );
    });

    it('should process chat request with tools', async () => {
      const mockResponse: ChatMessage[] = [
        buildUserMessage(userQuery),
        {
          role: 'assistant',
          content: null,
          tool_calls: [mockToolCall],
          metadata: { id: '2', timestamp: new Date(2) },
        },
        {
          role: 'tool',
          content: 'Results here',
          tool_call_id: 'call_123',
          metadata: { id: '3', timestamp: new Date(3) },
        },
        {
          role: 'assistant',
          content: 'I found some search results.',
          metadata: { id: '4', timestamp: new Date(4) },
        },
      ];

      mcpClientService.processQuery.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/chat')
        .send({
          messages: [],
          userMessage: userQuery,
          enabledTools: ['search_web'],
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        messages: parseMessages(mockResponse),
        conversationId: expect.any(String),
      });
    });

    it('should continue on a started conversation', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant',
          metadata: { id: '1', timestamp: new Date(1) },
        },
        {
          role: 'user',
          content: userQuery,
          metadata: { id: '2', timestamp: new Date(2) },
        },
        {
          role: 'assistant',
          content: 'Hello! I can help you with various tasks.',
          metadata: { id: '3', timestamp: new Date(3) },
        },
      ];
      const newQuery = 'I have to leave now';
      const mockResponse: ChatMessage[] = [
        ...messages,
        {
          role: 'user',
          content: newQuery,
          metadata: { id: '4', timestamp: new Date(4) },
        },
        {
          role: 'assistant',
          content: 'Okay, bye!',
          metadata: { id: '5', timestamp: new Date(5) },
        },
      ];

      mcpClientService.processQuery.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/chat')
        .send({ messages: messages, userMessage: userQuery, enabledTools: [] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        messages: parseMessages(mockResponse),
        conversationId: expect.any(String),
      });
      expect(mcpClientService.processQuery).toHaveBeenCalledWith(
        parseMessages(messages),
        userQuery,
        [],
      );
    });

    it('should return 400 for empty user message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({ messages: [], userMessage: '', enabledTools: [] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'A message from user is required',
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
          messages: [{ role: 'system', content: null }],
          userMessage: userQuery,
          enabledTools: [],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Message at index 0 has empty content',
      });
    });

    it('should return 400 for non-user and non-assistant last message', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          messages: [
            { role: 'user', content: 'Hello' },
            {
              role: 'assistant',
              content: null,
              tool_calls: [mockToolCall],
            },
            { role: 'tool', content: 'result', tool_call_id: 'call_123' },
          ],
          userMessage: userQuery,
          enabledTools: [],
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Last message must be from user or assistant',
      });
    });

    it('should return 400 for non-array enabledTools', async () => {
      const response = await request(app).post('/chat').send({
        messages: [],
        userMessage: userQuery,
        enabledTools: 'not-array',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'enabledTools must be an array',
      });
    });

    it('should return 400 for non-string enabledTools elements', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          messages: [],
          userMessage: userQuery,
          enabledTools: [123, 'valid'],
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'All enabledTools must be strings',
      });
    });

    it('should handle processQuery errors', async () => {
      mcpClientService.processQuery.mockRejectedValue(
        new Error('Query processing failed'),
      );

      const response = await request(app)
        .post('/chat')
        .send({ messages: [], userMessage: userQuery, enabledTools: [] });

      expect(response.status).toBe(500);
    });

    it('should handle enabledTools being undefined', async () => {
      const mockResponse: ChatMessage[] = [
        buildUserMessage(userQuery),
        {
          role: 'assistant',
          content: 'Response without tools',
          metadata: { id: '2', timestamp: new Date(2) },
        },
      ];

      mcpClientService.processQuery.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/chat')
        .send({ messages: [], userMessage: userQuery });

      expect(response.status).toBe(200);
      expect(mcpClientService.processQuery).toHaveBeenCalledWith(
        [],
        userQuery,
        undefined,
      );
    });
  });

  describe('POST /chat/approve', () => {
    const metadata = { id: '1', timestamp: new Date(1) };

    const pendingToolCall = {
      id: 'call_1',
      type: 'function' as const,
      function: { name: 'search', arguments: '{}' },
      metadata: { serverId: 'server-1', approval_status: 'pending' as const },
    };

    const pendingMessages: ChatMessage[] = [
      { role: 'user', content: 'Search for cats', metadata },
      {
        role: 'assistant',
        content: null,
        tool_calls: [pendingToolCall],
        metadata,
      },
    ];

    const parseMessages = (messages: ChatMessage[]): ChatMessage[] => {
      return JSON.parse(JSON.stringify(messages));
    };

    it('should process approval decisions successfully', async () => {
      const mockResponse: ChatMessage[] = [
        ...pendingMessages,
        {
          role: 'tool',
          content: 'cat results',
          tool_call_id: 'call_1',
          metadata,
        },
        { role: 'assistant', content: 'Here are some cats!', metadata },
      ];

      mcpClientService.processApprovalDecisions.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: pendingMessages,
          decisions: { call_1: 'approved' },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        messages: parseMessages(mockResponse),
        conversationId: expect.any(String),
      });
      expect(mcpClientService.processApprovalDecisions).toHaveBeenCalledWith(
        parseMessages(pendingMessages),
        { call_1: 'approved' },
      );
    });

    it('should process rejection decisions successfully', async () => {
      const mockResponse: ChatMessage[] = [
        ...pendingMessages,
        { role: 'tool', content: 'rejected', tool_call_id: 'call_1', metadata },
        { role: 'assistant', content: 'Understood, skipping that.', metadata },
      ];

      mcpClientService.processApprovalDecisions.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: pendingMessages,
          decisions: { call_1: 'rejected' },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        messages: parseMessages(mockResponse),
        conversationId: expect.any(String),
      });
    });

    it('should pass conversationId through', async () => {
      const convId = '550e8400-e29b-41d4-a716-446655440000';
      const mockResponse: ChatMessage[] = [
        ...pendingMessages,
        { role: 'tool', content: 'result', tool_call_id: 'call_1', metadata },
        { role: 'assistant', content: 'Done.', metadata },
      ];

      mcpClientService.processApprovalDecisions.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: pendingMessages,
          decisions: { call_1: 'approved' },
          conversationId: convId,
        });

      expect(response.status).toBe(200);
    });

    it('should return 400 for invalid conversationId format', async () => {
      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: pendingMessages,
          decisions: { call_1: 'approved' },
          conversationId: 'not-a-uuid',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid conversation ID format',
      });
    });

    it('should return 400 for missing messages', async () => {
      const response = await request(app)
        .post('/chat/approve')
        .send({ decisions: { call_1: 'approved' } });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Messages field is required',
      });
    });

    it('should return 400 for empty messages array', async () => {
      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: [],
          decisions: { call_1: 'approved' },
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'At least one message is required',
      });
    });

    it('should return 400 when last message is not from assistant', async () => {
      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: [{ role: 'user', content: 'Hello', metadata }],
          decisions: { call_1: 'approved' },
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Last message must be from assistant',
      });
    });

    it('should return 400 when last assistant message has no tool_calls', async () => {
      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: [{ role: 'assistant', content: 'Hi', metadata }],
          decisions: { call_1: 'approved' },
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Last message must have an array of tool_calls with at least one item',
      });
    });

    it('should return 400 when tool calls are not pending', async () => {
      const approvedMessages: ChatMessage[] = [
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              ...pendingToolCall,
              metadata: { serverId: 'server-1', approval_status: 'approved' },
            },
          ],
          metadata,
        },
      ];

      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: approvedMessages,
          decisions: { call_1: 'approved' },
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Last message must declare tool_calls with pending approval status',
      });
    });

    it('should return 400 for missing decisions', async () => {
      const response = await request(app)
        .post('/chat/approve')
        .send({ messages: pendingMessages });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Decisions must be a non-empty object mapping tool call IDs to "approved" or "rejected"',
      });
    });

    it('should return 400 for empty decisions object', async () => {
      const response = await request(app).post('/chat/approve').send({
        messages: pendingMessages,
        decisions: {},
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Decisions must be a non-empty object mapping tool call IDs to "approved" or "rejected"',
      });
    });

    it('should return 400 when decision count does not match tool calls', async () => {
      const twoToolMessages: ChatMessage[] = [
        {
          role: 'assistant',
          content: null,
          tool_calls: [pendingToolCall, { ...pendingToolCall, id: 'call_2' }],
          metadata,
        },
      ];

      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: twoToolMessages,
          decisions: { call_1: 'approved' },
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Number of decisions (1) does not match number of pending tool calls (2)',
      });
    });

    it('should return 400 for invalid decision value', async () => {
      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: pendingMessages,
          decisions: { call_1: 'pending' },
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Invalid decision value for tool call "call_1": must be "approved" or "rejected"',
      });
    });

    it('should return 400 for decision key not matching any tool call', async () => {
      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: pendingMessages,
          decisions: { wrong_id: 'approved' },
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Decision key "wrong_id" does not match any pending tool call IDs',
      });
    });

    it('should handle processApprovalDecisions errors', async () => {
      mcpClientService.processApprovalDecisions.mockRejectedValue(
        new Error('Approval processing failed'),
      );

      const response = await request(app)
        .post('/chat/approve')
        .send({
          messages: pendingMessages,
          decisions: { call_1: 'approved' },
        });

      expect(response.status).toBe(500);
    });
  });
});
