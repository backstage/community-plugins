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

    it('should exclude disabled tools from available tools (STDIO)', async () => {
      const serverConfigs = [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/script.py',
          disabledTools: ['dangerous_tool'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'safe_tool', description: 'Safe tool', inputSchema: {} },
          {
            name: 'dangerous_tool',
            description: 'Dangerous tool',
            inputSchema: {},
          },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();
      const tools = service.getAvailableTools();

      expect(tools).toHaveLength(1);
      expect(tools[0].function.name).toBe('safe_tool');
    });

    it('should exclude disabled tools from available tools (Responses API)', async () => {
      providerFactory.getProviderConfig.mockReturnValue({
        type: 'openai-responses',
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4',
      });

      const serverConfigs = [
        {
          id: 'http-server',
          name: 'http-server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'https://example.com/mcp',
          disabledTools: ['pods_delete', 'pods_exec'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'pods_list', description: 'List pods', inputSchema: {} },
          { name: 'pods_delete', description: 'Delete pod', inputSchema: {} },
          { name: 'pods_exec', description: 'Exec in pod', inputSchema: {} },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();
      const tools = service.getAvailableTools();

      expect(tools).toHaveLength(1);
      expect(tools[0].function.name).toBe('pods_list');
    });

    it('should log warning for invalid disabled tool names', async () => {
      const serverConfigs = [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/script.py',
          disabledTools: ['nonexistent_tool'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'real_tool', description: 'Real tool', inputSchema: {} },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Unable to exclude tool 'nonexistent_tool'"),
      );
    });

    it('should list all tool names in warning when server has few tools', async () => {
      const serverConfigs = [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/script.py',
          disabledTools: ['missing_tool'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'tool_a', description: 'A', inputSchema: {} },
          { name: 'tool_b', description: 'B', inputSchema: {} },
          { name: 'tool_c', description: 'C', inputSchema: {} },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Available tools are: tool_a, tool_b, tool_c'),
      );
    });

    it('should truncate tool names in warning when server has many tools', async () => {
      const serverConfigs = [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/script.py',
          disabledTools: ['missing_tool'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: Array.from({ length: 8 }, (_, i) => ({
          name: `tool_${i}`,
          description: `Tool ${i}`,
          inputSchema: {},
        })),
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('and 3 others'),
      );
      expect(mockLogger.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('tool_5'),
      );
    });

    it('should deduplicate disabledTools and only log once per tool', async () => {
      const serverConfigs = [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/script.py',
          disabledTools: ['dangerous_tool', 'dangerous_tool', 'dangerous_tool'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'safe_tool', description: 'Safe', inputSchema: {} },
          { name: 'dangerous_tool', description: 'Dangerous', inputSchema: {} },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();
      const tools = service.getAvailableTools();

      expect(tools).toHaveLength(1);
      expect(tools[0].function.name).toBe('safe_tool');
      // "disabled tools:" info should mention the tool only once
      const disabledInfoCalls = mockLogger.info.mock.calls.filter(
        (call: any[]) =>
          typeof call[0] === 'string' && call[0].includes('disabled tools:'),
      );
      expect(disabledInfoCalls).toHaveLength(1);
      expect(disabledInfoCalls[0][0]).toBe(
        "MCP Server 'test-server': disabled tools: dangerous_tool",
      );
    });

    it('should log info when tools are disabled', async () => {
      const serverConfigs = [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/script.py',
          disabledTools: ['dangerous_tool'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'safe_tool', description: 'Safe tool', inputSchema: {} },
          {
            name: 'dangerous_tool',
            description: 'Dangerous tool',
            inputSchema: {},
          },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('disabled tools: dangerous_tool'),
      );
    });

    it('should not affect behavior when no disabledTools configured', async () => {
      const serverConfigs = [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/script.py',
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'tool_a', description: 'Tool A', inputSchema: {} },
          { name: 'tool_b', description: 'Tool B', inputSchema: {} },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();
      const tools = service.getAvailableTools();

      expect(tools).toHaveLength(2);
    });

    it('should treat disabledTools: [] the same as no config', async () => {
      const serverConfigs = [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/script.py',
          disabledTools: [],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'tool_a', description: 'Tool A', inputSchema: {} },
          { name: 'tool_b', description: 'Tool B', inputSchema: {} },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();
      const tools = service.getAvailableTools();

      expect(tools).toHaveLength(2);
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('disabled tools:'),
      );
    });

    it('should not produce allowedTools when all disabledTools are invalid', async () => {
      providerFactory.getProviderConfig.mockReturnValue({
        type: 'openai-responses',
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4',
      });

      const serverConfigs = [
        {
          id: 'http-server',
          name: 'http-server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'https://example.com/mcp',
          disabledTools: ['typo_tool', 'another_typo'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'pods_list', description: 'List pods', inputSchema: {} },
          { name: 'pods_get', description: 'Get pod', inputSchema: {} },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();
      const tools = service.getAvailableTools();

      // All tools should still be available since nothing actually matched
      expect(tools).toHaveLength(2);
      // Warnings should be logged for invalid tool names
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Unable to exclude tool 'typo_tool'"),
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Unable to exclude tool 'another_typo'"),
      );
      // No "disabled tools:" info log since nothing was actually disabled
      expect(mockLogger.info).not.toHaveBeenCalledWith(
        expect.stringContaining('disabled tools:'),
      );
    });

    it('should return empty tools when all tools are disabled for a server', async () => {
      const serverConfigs = [
        {
          id: 'test-server',
          name: 'test-server',
          type: MCPServerType.STDIO,
          scriptPath: '/path/to/script.py',
          disabledTools: ['tool_a', 'tool_b'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'tool_a', description: 'Tool A', inputSchema: {} },
          { name: 'tool_b', description: 'Tool B', inputSchema: {} },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();
      const tools = service.getAvailableTools();

      expect(tools).toHaveLength(0);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('disabled tools: tool_a, tool_b'),
      );
    });

    it('should exclude disabled tools with HTTP transport and Chat Completions provider', async () => {
      // Default provider is 'openai' (Chat Completions), not 'openai-responses'
      const serverConfigs = [
        {
          id: 'http-server',
          name: 'http-server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'https://example.com/mcp',
          disabledTools: ['deploy_service'],
        },
      ];

      utils.loadServerConfigs.mockReturnValue(serverConfigs);
      mockClient.listTools.mockResolvedValue({
        tools: [
          {
            name: 'list_services',
            description: 'List services',
            inputSchema: {},
          },
          {
            name: 'deploy_service',
            description: 'Deploy service',
            inputSchema: {},
          },
          { name: 'get_logs', description: 'Get logs', inputSchema: {} },
        ],
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      await service.initializeMCPServers();
      const tools = service.getAvailableTools();

      expect(tools).toHaveLength(2);
      expect(tools.map((t: any) => t.function.name)).toEqual(
        expect.arrayContaining(['list_services', 'get_logs']),
      );
      expect(tools.map((t: any) => t.function.name)).not.toContain(
        'deploy_service',
      );
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
