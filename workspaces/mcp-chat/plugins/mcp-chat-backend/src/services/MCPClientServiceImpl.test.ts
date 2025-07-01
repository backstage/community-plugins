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

import { MCPClientServiceImpl } from './MCPClientServiceImpl';
import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import {
  LLMProvider,
  ChatResponse,
  ToolCall,
} from '../providers/base-provider';
import { ServerConfig } from '../types';

// Mock external dependencies
jest.mock('@modelcontextprotocol/sdk/client/index.js');
jest.mock('@modelcontextprotocol/sdk/client/streamableHttp.js');
jest.mock('@modelcontextprotocol/sdk/client/stdio.js');
jest.mock('@modelcontextprotocol/sdk/client/sse.js');
jest.mock('../providers/provider-factory');
jest.mock('../utils');

// Import after mocking
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const {
  StreamableHTTPClientTransport,
} = require('@modelcontextprotocol/sdk/client/streamableHttp.js');
const {
  StdioClientTransport,
} = require('@modelcontextprotocol/sdk/client/stdio.js');
const {
  SSEClientTransport,
} = require('@modelcontextprotocol/sdk/client/sse.js');
const providerFactory = require('../providers/provider-factory');
const utils = require('../utils');

describe('MCPClientServiceImpl', () => {
  let service: MCPClientServiceImpl;
  let mockLogger: jest.Mocked<LoggerService>;
  let mockConfig: jest.Mocked<RootConfigService>;
  let mockLLMProvider: jest.Mocked<LLMProvider>;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock logger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      child: jest.fn(),
    } as any;

    // Mock config
    mockConfig = {
      getOptionalConfigArray: jest.fn(),
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    } as any;

    // Mock LLM provider
    mockLLMProvider = {
      sendMessage: jest.fn(),
      testConnection: jest.fn(),
    } as any;

    // Mock client
    mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      listTools: jest.fn().mockResolvedValue({ tools: [] }),
      callTool: jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'tool result' }],
      }),
    };

    // Mock provider factory
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

    // Mock utils
    utils.findNpxPath.mockResolvedValue('/usr/local/bin/npx');
    utils.executeToolCall.mockResolvedValue({
      id: 'call_1',
      name: 'test_tool',
      arguments: { arg1: 'value1' },
      result: 'tool result',
      serverId: 'test-server',
    });

    // Mock Client constructor
    Client.mockImplementation(() => mockClient);
  });

  describe('constructor', () => {
    it('should initialize with logger and config', () => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Initializing MCPClientService',
      );
      expect(providerFactory.getProviderConfig).toHaveBeenCalledWith(
        mockConfig,
      );
      expect(providerFactory.ProviderFactory.createProvider).toHaveBeenCalled();
    });

    it('should throw error if LLM provider initialization fails', () => {
      providerFactory.getProviderConfig.mockImplementation(() => {
        throw new Error('Provider config error');
      });

      expect(
        () =>
          new MCPClientServiceImpl({
            logger: mockLogger,
            config: mockConfig,
          }),
      ).toThrow('Provider config error');
    });
  });

  describe('initMCP', () => {
    beforeEach(() => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });
    });

    it('should not reinitialize if already connected', async () => {
      const serverConfigs: ServerConfig[] = [
        {
          name: 'test-server',
          scriptPath: '/path/to/script.py',
        },
      ];

      await service.initMCP(serverConfigs);

      // Reset mock call count
      Client.mockClear();

      // Second initialization should return early
      await service.initMCP(serverConfigs);

      // Should not have been called again
      expect(Client).not.toHaveBeenCalled();
    });

    it('should connect via STDIO with script path', async () => {
      const serverConfigs: ServerConfig[] = [
        {
          name: 'test-server',
          scriptPath: '/path/to/script.py',
          args: ['--arg1', 'value1'],
          env: { TEST_VAR: 'test' },
        },
      ];

      await service.initMCP(serverConfigs);

      expect(Client).toHaveBeenCalledWith({
        name: 'test-server-client',
        version: '1.0.0',
      });

      expect(StdioClientTransport).toHaveBeenCalledWith({
        command: 'python3',
        args: ['/path/to/script.py', '--arg1', 'value1'],
        env: expect.objectContaining({
          TEST_VAR: 'test',
        }),
      });

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.listTools).toHaveBeenCalled();
    });

    it('should connect via STDIO with npx command', async () => {
      const serverConfigs: ServerConfig[] = [
        {
          name: 'test-server',
          npxCommand: '@modelcontextprotocol/server-filesystem',
          args: ['/path/to/files'],
        },
      ];

      await service.initMCP(serverConfigs);

      expect(utils.findNpxPath).toHaveBeenCalled();
      expect(StdioClientTransport).toHaveBeenCalledWith({
        command: '/usr/local/bin/npx',
        args: [
          '-y',
          '@modelcontextprotocol/server-filesystem',
          '/path/to/files',
        ],
        env: expect.objectContaining({
          PATH: expect.stringContaining('/usr/local/bin'),
        }),
      });
    });

    it('should connect via Streamable HTTP', async () => {
      const serverConfigs: ServerConfig[] = [
        {
          name: 'test-server',
          type: 'streamable-http',
          url: 'https://example.com/mcp',
          headers: { Authorization: 'Bearer token' },
        },
      ];

      await service.initMCP(serverConfigs);

      expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
        new URL('https://example.com/mcp'),
        {
          requestInit: {
            headers: { Authorization: 'Bearer token' },
          },
        },
      );
    });

    it('should connect via SSE', async () => {
      const serverConfigs: ServerConfig[] = [
        {
          name: 'test-server',
          type: 'sse',
          url: 'https://example.com/sse',
          headers: { Authorization: 'Bearer token' },
        },
      ];

      await service.initMCP(serverConfigs);

      expect(SSEClientTransport).toHaveBeenCalledWith({
        url: new URL('https://example.com/sse'),
        headers: { Authorization: 'Bearer token' },
      });
    });

    it('should throw error for streamable-http without URL', async () => {
      const serverConfigs: ServerConfig[] = [
        {
          name: 'test-server',
          type: 'streamable-http',
        },
      ];

      await expect(service.initMCP(serverConfigs)).rejects.toThrow(
        "Server config for 'test-server' with streamable-http type must have a url",
      );
    });

    it('should throw error for SSE without URL', async () => {
      const serverConfigs: ServerConfig[] = [
        {
          name: 'test-server',
          type: 'sse',
        },
      ];

      await expect(service.initMCP(serverConfigs)).rejects.toThrow(
        "Server config for 'test-server' with SSE type must have a url",
      );
    });

    it('should throw error for STDIO without script path or npx command', async () => {
      const serverConfigs: ServerConfig[] = [
        {
          name: 'test-server',
        },
      ];

      await expect(service.initMCP(serverConfigs)).rejects.toThrow(
        "Server config for 'test-server' must have either scriptPath, npxCommand, or url",
      );
    });

    it('should handle npx not found error', async () => {
      utils.findNpxPath.mockRejectedValue(new Error('npx not found'));

      const serverConfigs: ServerConfig[] = [
        {
          name: 'test-server',
          npxCommand: '@modelcontextprotocol/server-filesystem',
        },
      ];

      await expect(service.initMCP(serverConfigs)).rejects.toThrow(
        "Failed to find npx for server 'test-server': npx not found",
      );
    });

    it('should use python on Windows for Python scripts', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      try {
        const serverConfigs: ServerConfig[] = [
          {
            name: 'test-server',
            scriptPath: '/path/to/script.py',
          },
        ];

        await service.initMCP(serverConfigs);

        expect(StdioClientTransport).toHaveBeenCalledWith({
          command: 'python',
          args: ['/path/to/script.py'],
          env: expect.any(Object),
        });
      } finally {
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      }
    });

    it('should collect tools from multiple servers', async () => {
      const mockClient1 = {
        connect: jest.fn().mockResolvedValue(undefined),
        listTools: jest.fn().mockResolvedValue({
          tools: [{ name: 'tool1', description: 'Tool 1', inputSchema: {} }],
        }),
        callTool: jest.fn(),
      };

      const mockClient2 = {
        connect: jest.fn().mockResolvedValue(undefined),
        listTools: jest.fn().mockResolvedValue({
          tools: [{ name: 'tool2', description: 'Tool 2', inputSchema: {} }],
        }),
        callTool: jest.fn(),
      };

      Client.mockImplementationOnce(() => mockClient1).mockImplementationOnce(
        () => mockClient2,
      );

      const serverConfigs: ServerConfig[] = [
        { name: 'server1', scriptPath: '/path/to/script1.py' },
        { name: 'server2', scriptPath: '/path/to/script2.py' },
      ];

      await service.initMCP(serverConfigs);

      const tools = service.getAvailableTools();
      expect(tools).toHaveLength(2);
      expect(tools[0]).toMatchObject({
        type: 'function',
        function: { name: 'tool1' },
        serverId: 'server1',
      });
      expect(tools[1]).toMatchObject({
        type: 'function',
        function: { name: 'tool2' },
        serverId: 'server2',
      });
    });
  });

  describe('processQuery', () => {
    beforeEach(async () => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      // Initialize with mock tools
      mockClient.listTools.mockResolvedValue({
        tools: [
          { name: 'test_tool', description: 'Test tool', inputSchema: {} },
        ],
      });

      await service.initMCP([
        {
          name: 'test-server',
          scriptPath: '/path/to/script.py',
        },
      ]);
    });

    it('should process query without tool calls', async () => {
      const mockResponse: ChatResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello, how can I help you?',
            },
          },
        ],
      };

      mockLLMProvider.sendMessage.mockResolvedValue(mockResponse);

      const result = await service.processQuery([
        { role: 'user', content: 'Hello' },
      ]);

      expect(result).toEqual({
        reply: 'Hello, how can I help you?',
        toolCalls: [],
        toolResponses: [],
      });

      expect(mockLLMProvider.sendMessage).toHaveBeenCalledWith(
        [
          {
            role: 'system',
            content: expect.stringContaining('helpful assistant'),
          },
          { role: 'user', content: 'Hello' },
        ],
        expect.any(Array),
      );
    });

    it('should process query with tool calls and follow up', async () => {
      const toolCall: ToolCall = {
        id: 'call_1',
        type: 'function',
        function: {
          name: 'test_tool',
          arguments: '{"arg1": "value1"}',
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

      expect(result).toEqual({
        reply: 'Based on the tool result: tool result',
        toolCalls: [toolCall],
        toolResponses: [
          {
            id: 'call_1',
            name: 'test_tool',
            arguments: { arg1: 'value1' },
            result: 'tool result',
            serverId: 'test-server',
          },
        ],
      });

      expect(utils.executeToolCall).toHaveBeenCalledWith(
        toolCall,
        expect.any(Array),
        expect.any(Map),
      );

      // Should make two calls to LLM - initial and follow-up
      expect(mockLLMProvider.sendMessage).toHaveBeenCalledTimes(2);
    });

    it('should filter tools by enabled servers', async () => {
      const mockResponse: ChatResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Response with filtered tools',
            },
          },
        ],
      };

      mockLLMProvider.sendMessage.mockResolvedValue(mockResponse);

      await service.processQuery(
        [{ role: 'user', content: 'Hello' }],
        ['test-server'],
      );

      // Verify that sendMessage was called with filtered tools
      const [, tools] = mockLLMProvider.sendMessage.mock.calls[0];
      expect(tools).toHaveLength(1);
      expect(tools![0]).not.toHaveProperty('serverId'); // serverId should be removed
    });

    it('should handle LLM provider errors', async () => {
      mockLLMProvider.sendMessage.mockRejectedValue(new Error('LLM error'));

      await expect(
        service.processQuery([{ role: 'user', content: 'Hello' }]),
      ).rejects.toThrow('LLM error');
    });
  });

  describe('getAvailableTools', () => {
    it('should return empty array when not initialized', () => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      expect(service.getAvailableTools()).toEqual([]);
    });

    it('should return tools after initialization', async () => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      mockClient.listTools.mockResolvedValue({
        tools: [{ name: 'tool1', description: 'Tool 1', inputSchema: {} }],
      });

      await service.initMCP([
        {
          name: 'test-server',
          scriptPath: '/path/to/script.py',
        },
      ]);

      const tools = service.getAvailableTools();
      expect(tools).toHaveLength(1);
      expect(tools[0]).toMatchObject({
        type: 'function',
        function: { name: 'tool1' },
        serverId: 'test-server',
      });
    });
  });

  describe('getProviderConfig', () => {
    it('should return provider configuration', async () => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      const config = await service.getProviderConfig();

      expect(config).toEqual({
        provider: 'openai',
        model: 'gpt-4',
        baseURL: 'https://api.openai.com/v1',
      });

      expect(providerFactory.getProviderInfo).toHaveBeenCalledWith(mockConfig);
    });
  });

  describe('getProviderStatus', () => {
    it('should return connected status when provider is working', () => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      const status = service.getProviderStatus();

      expect(status).toEqual({
        provider: 'openai',
        model: 'gpt-4',
        baseURL: 'https://api.openai.com/v1',
        connected: true,
      });
    });

    it('should return error status when provider info fails', () => {
      providerFactory.getProviderInfo.mockImplementation(() => {
        throw new Error('Provider error');
      });

      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });

      const status = service.getProviderStatus();

      expect(status).toEqual({
        provider: 'unknown',
        model: 'unknown',
        baseURL: 'unknown',
        connected: false,
        error: 'Provider error',
      });
    });
  });

  describe('testProviderConnection', () => {
    beforeEach(() => {
      service = new MCPClientServiceImpl({
        logger: mockLogger,
        config: mockConfig,
      });
    });

    it('should return connection test result', async () => {
      const mockResult = {
        connected: true,
        models: ['gpt-4', 'gpt-3.5-turbo'],
      };

      mockLLMProvider.testConnection.mockResolvedValue(mockResult);

      const result = await service.testProviderConnection();

      expect(result).toEqual(mockResult);
      expect(mockLLMProvider.testConnection).toHaveBeenCalled();
    });

    it('should handle connection test errors', async () => {
      mockLLMProvider.testConnection.mockRejectedValue(
        new Error('Connection failed'),
      );

      const result = await service.testProviderConnection();

      expect(result).toEqual({
        connected: false,
        error: 'Connection failed',
      });
    });

    it('should reinitialize provider if not available', async () => {
      // Manually set llmProvider to undefined to simulate the scenario
      (service as any).llmProvider = undefined;

      const mockResult = { connected: true };
      mockLLMProvider.testConnection.mockResolvedValue(mockResult);

      const result = await service.testProviderConnection();

      expect(result).toEqual(mockResult);
      expect(
        providerFactory.ProviderFactory.createProvider,
      ).toHaveBeenCalledTimes(2);
    });
  });
});
