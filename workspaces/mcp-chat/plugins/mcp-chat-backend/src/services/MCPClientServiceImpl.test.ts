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
import { ChatResponse, ToolCall, MCPServerType } from '../types';

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

      const result = await service.processQuery([
        { role: 'user', content: 'Hello' },
      ]);

      expect(result).toEqual({
        reply: 'Hello! How can I help you?',
        toolCalls: [],
        toolResponses: [],
      });
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

      const result = await service.processQuery([
        { role: 'user', content: 'Use the test tool' },
      ]);

      expect(result.reply).toBe('Based on the tool result: tool result');
      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolResponses).toHaveLength(1);
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

      const result = await service.processQuery([
        { role: 'user', content: 'Use the failing tool' },
      ]);

      expect(result.reply).toBe('I encountered an error with the tool.');
      expect(result.toolResponses[0].result).toContain('Tool execution failed');
      expect(result.toolResponses[0].serverId).toBe('error');
    });

    it('should handle LLM provider errors', async () => {
      mockLLMProvider.sendMessage.mockRejectedValue(
        new Error('LLM connection failed'),
      );

      await expect(
        service.processQuery([{ role: 'user', content: 'Hello' }]),
      ).rejects.toThrow('LLM connection failed');
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

      await service.processQuery([{ role: 'user', content: 'Hello' }], []);

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

      await service.processQuery([{ role: 'user', content: 'Hello' }], []);

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
          { role: 'system', content: userProvidedSystemMessage },
          { role: 'user', content: 'Hello' },
        ],
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
