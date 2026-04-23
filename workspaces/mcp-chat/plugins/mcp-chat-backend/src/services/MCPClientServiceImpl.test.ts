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
import { MCPClientServiceImpl } from './MCPClientServiceImpl';
import { ChatResponse, ToolCall, MCPServerType, ChatMessage } from '../types';

jest.mock('@modelcontextprotocol/sdk/client/index.js');
jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js');
jest.mock('@modelcontextprotocol/sdk/client/stdio.js');
jest.mock('@modelcontextprotocol/sdk/client/sse.js');
jest.mock('../providers/provider-factory');
jest.mock('../utils');

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const {
  StreamableHTTPClientTransport,
} = require('@modelcontextprotocol/sdk/client/streamableHttp.js');
const {
  StdioClientTransport,
} = require('@modelcontextprotocol/sdk/client/stdio.js');
const providerFactory = require('../providers/provider-factory');
const utils = require('../utils');

describe('MCPClientServiceImpl', () => {
  let service: MCPClientServiceImpl;
  let mockLogger: ReturnType<typeof mockServices.logger.mock>;
  let mockConfig: ReturnType<typeof mockServices.rootConfig.mock>;
  let mockLLMProvider: any;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = mockServices.logger.mock();
    mockConfig = mockServices.rootConfig.mock();

    mockLLMProvider = {
      sendMessage: jest.fn(),
      testConnection: jest.fn(),
    };

    mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      listTools: jest.fn().mockResolvedValue({ tools: [] }),
      callTool: jest.fn(),
    };

    providerFactory.getProviderConfig.mockReturnValue({
      type: 'openai',
      apiKey: 'test-key',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4',
    });

    providerFactory.ProviderFactory.createProvider.mockReturnValue(
      mockLLMProvider,
    );

    providerFactory.getProviderInfo.mockReturnValue({
      provider: 'openai',
      model: 'gpt-4',
      baseURL: 'https://api.openai.com/v1',
    });

    utils.loadServerConfigs.mockReturnValue([]);
    utils.findNpxPath.mockResolvedValue('/usr/local/bin/npx');
    utils.executeToolCall.mockResolvedValue({
      id: 'call_1',
      name: 'test_tool',
      arguments: { arg1: 'value1' },
      result: 'tool result',
      serverId: 'test-server',
    });
    utils.sanitizeForLLM.mockImplementation(
      (messages: ChatMessage[]) => messages,
    );

    Client.mockImplementation(() => mockClient);
  });

  describe('Service Initialization', () => {
    it('should initialize successfully with valid configuration', () => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      expect(service).toBeDefined();
      expect(providerFactory.getProviderConfig).toHaveBeenCalledWith(
        mockConfig,
      );
      expect(providerFactory.ProviderFactory.createProvider).toHaveBeenCalled();
    });

    it('should throw error when LLM provider configuration is invalid', () => {
      providerFactory.getProviderConfig.mockImplementation(() => {
        throw new Error('Invalid provider configuration');
      });

      expect(
        () =>
          new MCPClientServiceImpl({
            logger: mockLogger,
            config: mockConfig,
          }),
      ).toThrow('Invalid provider configuration');
    });
  });

  describe('Query Processing', () => {
    const expectMessages = (
      expectedMessages: any[],
      actualMessages: ChatMessage[],
    ) => {
      expect(expectedMessages.length).toEqual(actualMessages.length);

      for (let i = 0; i < expectedMessages.length; i++) {
        const expectedMessage = expectedMessages[i];
        const actualMessage = actualMessages[i];

        expect(expectedMessage.role).toEqual(actualMessage.role);
        if (expectedMessage.role !== 'system') {
          expect(expectedMessage.content).toEqual(actualMessage.content);
        }
        if (expectedMessage.tool_calls) {
          expect(expectedMessage.tool_calls.length).toEqual(
            actualMessage.tool_calls?.length,
          );
          for (let j = 0; j < expectedMessage.tool_calls.length; j++) {
            const { metadata, ...toolCall } = actualMessage.tool_calls![j];
            expect(expectedMessage.tool_calls[j]).toEqual(toolCall);
          }
        }
      }
    };

    beforeEach(() => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });
    });

    it('should process simple query without tools', async () => {
      const mockResponse: ChatResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you?',
            },
          },
        ],
      };

      mockLLMProvider.sendMessage.mockResolvedValue(mockResponse);

      const result = await service.processQuery([], 'Hello');

      expectMessages(
        [
          { role: 'system' },
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hello! How can I help you?' },
        ],
        result,
      );
    });

    it('should process query with tool execution', async () => {
      const toolCall: ToolCall = {
        id: 'call_1',
        type: 'function',
        function: {
          name: 'test_tool',
          arguments: '{"query": "test"}',
        },
      };

      const initialResponse: ChatResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const followUpResponse: ChatResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Based on the tool result: tool result',
            },
          },
        ],
      };

      mockLLMProvider.sendMessage
        .mockResolvedValueOnce(initialResponse)
        .mockResolvedValueOnce(followUpResponse);

      const result = await service.processQuery([], 'Use the test tool');

      expectMessages(
        [
          {
            role: 'system',
          },
          {
            role: 'user',
            content: 'Use the test tool',
          },
          {
            role: 'assistant',
            content: null,
            tool_calls: [toolCall],
          },
          {
            role: 'tool',
            content: 'tool result',
          },
          {
            role: 'assistant',
            content: 'Based on the tool result: tool result',
          },
        ],
        result,
      );
      expect(utils.executeToolCall).toHaveBeenCalledWith(
        toolCall,
        expect.any(Array),
        expect.any(Map),
      );
    });

    it('should handle tool execution errors gracefully', async () => {
      const toolCall: ToolCall = {
        id: 'call_1',
        type: 'function',
        function: {
          name: 'failing_tool',
          arguments: '{}',
        },
      };

      const initialResponse: ChatResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [toolCall],
            },
          },
        ],
      };

      const followUpResponse: ChatResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'I encountered an error with the tool.',
            },
          },
        ],
      };

      mockLLMProvider.sendMessage
        .mockResolvedValueOnce(initialResponse)
        .mockResolvedValueOnce(followUpResponse);

      utils.executeToolCall.mockRejectedValue(
        new Error('Tool execution failed'),
      );

      const result = await service.processQuery([], 'Use the failing tool');

      expectMessages(
        [
          {
            role: 'system',
          },
          {
            role: 'user',
            content: 'Use the failing tool',
          },
          {
            role: 'assistant',
            content: null,
            tool_calls: [toolCall],
          },
          {
            role: 'tool',
            content:
              "Error executing tool 'failing_tool': Tool execution failed",
          },
          {
            role: 'assistant',
            content: 'I encountered an error with the tool.',
          },
        ],
        result,
      );
    });

    it('should handle LLM provider errors', async () => {
      mockLLMProvider.sendMessage.mockRejectedValue(
        new Error('LLM connection failed'),
      );

      await expect(service.processQuery([], 'Hello')).rejects.toThrow(
        'LLM connection failed',
      );
    });

    it('should return pending tool calls when requestApproval is true', async () => {
      mockConfig.getOptionalBoolean.mockImplementation((key: string) => {
        if (key === 'mcpChat.requestApproval') return true;
        return undefined;
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      const toolCall: ToolCall = {
        id: 'call_1',
        type: 'function',
        function: { name: 'search', arguments: '{}' },
      };

      mockLLMProvider.sendMessage.mockResolvedValue({
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [toolCall],
            },
          },
        ],
      });

      const result = await service.processQuery([], 'Search for cats');

      // Should NOT execute any tools
      expect(utils.executeToolCall).not.toHaveBeenCalled();
      // Should NOT send a follow-up to the LLM
      expect(mockLLMProvider.sendMessage).toHaveBeenCalledTimes(1);

      const assistantMsg = result.find(
        m => m.role === 'assistant' && m.tool_calls?.length,
      );
      expect(assistantMsg).toBeDefined();
      expect(assistantMsg!.tool_calls![0].metadata?.approval_status).toBe(
        'pending',
      );
    });
  });

  describe('Approval Decisions', () => {
    const meta = { id: '1', timestamp: new Date(1) };

    const pendingToolCall = (id: string, name: string): ToolCall => ({
      id,
      type: 'function',
      function: { name, arguments: '{}' },
      metadata: { serverId: 'server-1', approval_status: 'pending' },
    });

    beforeEach(() => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });
    });

    it('should execute approved tools and return follow-up', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Search', metadata: meta },
        {
          role: 'assistant',
          content: null,
          tool_calls: [pendingToolCall('call_1', 'search')],
          metadata: meta,
        },
      ];

      mockLLMProvider.sendMessage.mockResolvedValue({
        choices: [
          { message: { role: 'assistant', content: 'Here are results.' } },
        ],
      });

      const result = await service.processApprovalDecisions(messages, {
        call_1: 'approved',
      });

      expect(utils.executeToolCall).toHaveBeenCalledTimes(1);
      expect(mockLLMProvider.sendMessage).toHaveBeenCalledTimes(1);

      // Updated tool call should be approved
      const assistantMsg = result.find(m => m.tool_calls?.length);
      expect(assistantMsg!.tool_calls![0].metadata?.approval_status).toBe(
        'approved',
      );

      // Should have tool response and follow-up
      expect(result.find(m => m.role === 'tool')).toBeDefined();
      expect(result[result.length - 1].content).toBe('Here are results.');
    });

    it('should not execute rejected tools', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Search', metadata: meta },
        {
          role: 'assistant',
          content: null,
          tool_calls: [pendingToolCall('call_1', 'search')],
          metadata: meta,
        },
      ];

      mockLLMProvider.sendMessage.mockResolvedValue({
        choices: [{ message: { role: 'assistant', content: 'Understood.' } }],
      });

      const result = await service.processApprovalDecisions(messages, {
        call_1: 'rejected',
      });

      expect(utils.executeToolCall).not.toHaveBeenCalled();

      const assistantMsg = result.find(m => m.tool_calls?.length);
      expect(assistantMsg!.tool_calls![0].metadata?.approval_status).toBe(
        'rejected',
      );

      const toolMsg = result.find(m => m.role === 'tool');
      expect(toolMsg!.content).toContain('rejected');
    });

    it('should handle mixed approve and reject decisions', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Do both', metadata: meta },
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            pendingToolCall('call_1', 'search'),
            pendingToolCall('call_2', 'delete'),
          ],
          metadata: meta,
        },
      ];

      mockLLMProvider.sendMessage.mockResolvedValue({
        choices: [
          { message: { role: 'assistant', content: 'Partial results.' } },
        ],
      });

      const result = await service.processApprovalDecisions(messages, {
        call_1: 'approved',
        call_2: 'rejected',
      });

      // Only the approved tool should be executed
      expect(utils.executeToolCall).toHaveBeenCalledTimes(1);

      const toolMsgs = result.filter(m => m.role === 'tool');
      expect(toolMsgs).toHaveLength(2);

      // Responses should be in the same order as the tool calls
      expect(toolMsgs[0].tool_call_id).toBe('call_1');
      expect(toolMsgs[1].tool_call_id).toBe('call_2');
      expect(toolMsgs[1].content).toContain('rejected');
    });
  });

  describe('Status Reporting', () => {
    beforeEach(() => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });
    });

    it('should return provider status successfully', async () => {
      mockLLMProvider.testConnection.mockResolvedValue({
        connected: true,
        models: ['gpt-4', 'gpt-3.5-turbo'],
      });

      const status = await service.getProviderStatus();

      expect(status.providers).toHaveLength(1);
      expect(status.providers[0]).toMatchObject({
        id: 'openai',
        model: 'gpt-4',
        baseUrl: 'https://api.openai.com/v1',
        connection: {
          connected: true,
          models: ['gpt-4', 'gpt-3.5-turbo'],
        },
      });
      expect(status.summary.healthyProviders).toBe(1);
      expect(status.timestamp).toBeDefined();
    });

    it('should handle provider status errors', async () => {
      providerFactory.getProviderInfo.mockImplementation(() => {
        throw new Error('Provider info failed');
      });

      const status = await service.getProviderStatus();

      expect(status.providers).toHaveLength(0);
      expect(status.summary.totalProviders).toBe(0);
      expect(status.summary.error).toBe('Provider info failed');
      expect(status.timestamp).toBeDefined();
    });

    it('should return MCP server status', async () => {
      const status = await service.getMCPServerStatus();

      expect(status).toMatchObject({
        total: expect.any(Number),
        valid: expect.any(Number),
        active: expect.any(Number),
        servers: expect.any(Array),
        timestamp: expect.any(String),
      });
    });
  });

  describe('Server Configuration Handling', () => {
    it('should handle STDIO server configuration', async () => {
      const serverConfigs = [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/script.py',
          args: ['--verbose'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'test_tool', description: 'Test tool', inputSchema: {} },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      const servers = await service.initializeMCPServers();

      expect(utils.loadServerConfigs).toHaveBeenCalledWith(mockConfig);
      expect(servers).toHaveLength(1);
      expect(servers[0].name).toBe('test-server');
    });

    it('should handle HTTP server configuration', async () => {
      const serverConfigs = [
        {
          id: 'http-server',
          name: 'http-server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'https://example.com/mcp',
          headers: { Authorization: 'Bearer token' },
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      const servers = await service.initializeMCPServers();

      expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
        new URL('https://example.com/mcp'),
        {
          requestInit: {
            headers: { Authorization: 'Bearer token' },
          },
        },
      );
      expect(servers).toHaveLength(1);
    });

    it('should handle npx command configuration', async () => {
      const serverConfigs = [
        {
          id: 'fs-server',
          name: 'fs-server',
          type: MCPServerType.STDIO,
          npxCommand: '@modelcontextprotocol/server-filesystem',
          args: ['/tmp'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();

      expect(utils.findNpxPath).toHaveBeenCalled();
      expect(StdioClientTransport).toHaveBeenCalledWith({
        command: '/usr/local/bin/npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
        env: expect.objectContaining({
          PATH: expect.stringContaining('/usr/local/bin'),
        }),
      });
    });

    it('should handle connection failures gracefully', async () => {
      const serverConfigs = [
        {
          id: 'failing-server',
          name: 'failing-server',
          type: MCPServerType.STDIO,
          scriptPath: '/failing.py',
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.connect.mockRejectedValue(new Error('Connection failed'));

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      const servers = await service.initializeMCPServers();

      expect(servers).toHaveLength(1);
      expect(servers[0].status.connected).toBe(false);
      expect(servers[0].status.error).toBe('Connection failed');
    });
  });

  describe('Tool Management', () => {
    it('should return available tools', () => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      const tools = service.getAvailableTools();
      expect(Array.isArray(tools)).toBe(true);
    });
  });

  describe('System Prompt Configuration', () => {
    it('should use custom system prompt when configured', async () => {
      const customPrompt = 'You are a specialized assistant for DevOps tasks.';
      mockConfig.getOptionalString.mockImplementation((key: string) => {
        if (key === 'mcpChat.systemPrompt') {
          return customPrompt;
        }
        return undefined;
      });

      const mockResponse: ChatResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Response content',
            },
          },
        ],
      };

      mockLLMProvider.sendMessage.mockResolvedValue(mockResponse);

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.processQuery([], 'Hello', []);

      expect(mockLLMProvider.sendMessage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: customPrompt,
          }),
        ]),
        expect.any(Array),
      );
    });

    it('should use default system prompt when not configured', async () => {
      mockConfig.getOptionalString.mockImplementation((key: string) => {
        if (key === 'mcpChat.systemPrompt') {
          return undefined;
        }
        return undefined;
      });

      const mockResponse: ChatResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Response content',
            },
          },
        ],
      };

      mockLLMProvider.sendMessage.mockResolvedValue(mockResponse);

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.processQuery([], 'Hello', []);

      const defaultPrompt =
        "You are a helpful assistant. When using tools, provide a clear, readable summary of the results rather than showing raw data. Focus on answering the user's question with the information gathered.";

      expect(mockLLMProvider.sendMessage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: defaultPrompt,
          }),
        ]),
        expect.any(Array),
      );
    });

    it('should not override existing system message', async () => {
      const customPrompt = 'Custom system prompt';
      const userProvidedSystemMessage = 'User provided system message';

      mockConfig.getOptionalString.mockImplementation((key: string) => {
        if (key === 'mcpChat.systemPrompt') {
          return customPrompt;
        }
        return undefined;
      });

      const mockResponse: ChatResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Response content',
            },
          },
        ],
      };

      mockLLMProvider.sendMessage.mockResolvedValue(mockResponse);

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.processQuery(
        [
          {
            role: 'system',
            content: userProvidedSystemMessage,
            metadata: { id: '1', timestamp: new Date(1) },
          },
        ],
        'Hello',
        [],
      );

      expect(mockLLMProvider.sendMessage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: userProvidedSystemMessage,
          }),
        ]),
        expect.any(Array),
      );

      // Verify that custom prompt was NOT added
      const sentMessages = mockLLMProvider.sendMessage.mock.calls[0][0];
      const systemMessages = sentMessages.filter(
        (msg: any) => msg.role === 'system',
      );
      expect(systemMessages).toHaveLength(1);
      expect(systemMessages[0].content).toBe(userProvidedSystemMessage);
    });
  });
});
