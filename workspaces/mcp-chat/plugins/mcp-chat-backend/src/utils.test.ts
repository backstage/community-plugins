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
import {
  loadServerConfigs,
  executeToolCall,
  validateConfig,
  validateMessages,
  validateEnabledTools,
  validateToolApprovalMessage,
  validateDecisions,
  sanitizeForLLM,
} from './utils';
import { ChatMessage, MCPServerType } from './types';

jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn(),
}));

describe('Utils', () => {
  const mockToolCall = {
    id: 'call_123',
    type: 'function' as const,
    function: {
      name: 'test_tool',
      arguments: JSON.stringify({ param: 'value' }),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadServerConfigs', () => {
    it('should load basic server configurations', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            mcpServers: [
              {
                id: 'server1',
                name: 'Test Server',
                scriptPath: '/path/to/script',
                args: ['--arg1', '--arg2'],
              },
            ],
          },
        },
      });

      const result = loadServerConfigs(mockConfig);

      expect(result).toEqual([
        {
          id: 'server1',
          name: 'Test Server',
          scriptPath: '/path/to/script',
          args: ['--arg1', '--arg2'],
          type: MCPServerType.STDIO,
          env: undefined,
          headers: undefined,
          npxCommand: undefined,
          url: undefined,
        },
      ]);
    });

    it('should handle optional fields', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            mcpServers: [
              {
                id: 'server1',
                name: 'Test Server',
                scriptPath: '/path/to/script',
                headers: {
                  Authorization: 'Bearer token',
                  'Content-Type': 'application/json',
                },
                env: {
                  NODE_ENV: 'test',
                  API_KEY: 'secret',
                },
              },
            ],
          },
        },
      });

      const result = loadServerConfigs(mockConfig);

      expect(result[0]).toMatchObject({
        id: 'server1',
        name: 'Test Server',
        headers: {
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
        },
        env: {
          NODE_ENV: 'test',
          API_KEY: 'secret',
        },
      });
    });

    it('should infer streamable-http type when url is present', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            mcpServers: [
              {
                id: 'server1',
                name: 'HTTP Server',
                url: 'http://example.com/mcp',
              },
            ],
          },
        },
      });

      const result = loadServerConfigs(mockConfig);

      expect(result[0].type).toBe(MCPServerType.STREAMABLE_HTTP);
    });

    it('should infer streamable-http type when type is explicitly set', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            mcpServers: [
              {
                id: 'server1',
                name: 'HTTP Server',
                type: MCPServerType.STREAMABLE_HTTP,
                scriptPath: '/path/to/script',
              },
            ],
          },
        },
      });

      const result = loadServerConfigs(mockConfig);

      expect(result[0].type).toBe(MCPServerType.STREAMABLE_HTTP);
    });

    it('should handle empty server configurations', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {},
        },
      });

      const result = loadServerConfigs(mockConfig);

      expect(result).toEqual([]);
    });

    it('should handle missing mcpServers configuration', () => {
      const mockConfig = mockServices.rootConfig({
        data: {},
      });

      const result = loadServerConfigs(mockConfig);

      expect(result).toEqual([]);
    });
  });

  describe('validateConfig', () => {
    it('should throw error when no providers are configured', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            mcpServers: [],
          },
        },
      });

      expect(() => validateConfig(mockConfig)).toThrow(
        'No LLM providers configured in mcpChat.providers. Please add at least one provider.',
      );
    });

    it('should validate provider requirements', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            providers: [
              {
                id: 'test-provider',
                model: 'test-model',
              },
            ],
          },
        },
      });

      expect(() => validateConfig(mockConfig)).not.toThrow();
    });

    it('should validate MCP server headers configuration', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            providers: [{ id: 'test' }],
            mcpServers: [
              {
                id: 'server1',
                name: 'Test Server',
                headers: 'invalid-headers',
              },
            ],
          },
        },
      });

      expect(() => validateConfig(mockConfig)).toThrow(
        'Invalid configuration for MCP server at index 0',
      );
    });

    it('should validate MCP server env configuration', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            providers: [{ id: 'test' }],
            mcpServers: [
              {
                id: 'server1',
                name: 'Test Server',
                env: ['invalid-env'],
              },
            ],
          },
        },
      });

      expect(() => validateConfig(mockConfig)).toThrow(
        'Invalid configuration for MCP server at index 0',
      );
    });

    it('should validate quickPrompts required fields', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            providers: [{ id: 'test' }],
            quickPrompts: [
              {
                title: 'Test Prompt',
                description: 'Test Description',
                category: 'Test Category',
              },
            ],
          },
        },
      });

      expect(() => validateConfig(mockConfig)).toThrow(
        "QuickPrompt at index 0 is missing required field: 'prompt'",
      );
    });

    it('should validate quickPrompts empty values', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            providers: [{ id: 'test' }],
            quickPrompts: [
              {
                title: '',
                description: 'Test Description',
                prompt: 'Test Prompt',
                category: 'Test Category',
              },
            ],
          },
        },
      });

      expect(() => validateConfig(mockConfig)).toThrow();
    });

    it('should pass validation with valid configuration', () => {
      const mockConfig = mockServices.rootConfig({
        data: {
          mcpChat: {
            providers: [{ id: 'test' }],
            mcpServers: [
              {
                id: 'server1',
                name: 'Test Server',
                headers: { 'Content-Type': 'application/json' },
                env: { NODE_ENV: 'test' },
              },
            ],
            quickPrompts: [
              {
                title: 'Test Prompt',
                description: 'Test Description',
                prompt: 'Test Prompt Content',
                category: 'Test Category',
              },
            ],
          },
        },
      });

      expect(() => validateConfig(mockConfig)).not.toThrow();
    });
  });

  describe('validateMessages', () => {
    it('should validate basic message structure', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
        { role: 'user', content: 'How are you?' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(true);
    });

    it('should require messages field', () => {
      const result = validateMessages(null);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Messages field is required');
    });

    it('should require messages to be an array', () => {
      const result = validateMessages('not an array');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Messages must be an array');
    });

    it('should validate message object structure', () => {
      const messages = ['not an object'];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message at index 0 must be an object');
    });

    it('should validate required role field', () => {
      const messages = [{ content: 'Hello' }];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Message at index 0 is missing required field 'role'",
      );
    });

    it('should validate required content field', () => {
      const messages = [{ role: 'user' }];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Message at index 0 is missing required field 'content'",
      );
    });

    it('should validate role values', () => {
      const messages = [{ role: 'invalid', content: 'Hello' }];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain(
        "Message at index 0 has invalid role 'invalid'",
      );
    });

    it('should validate content types', () => {
      const messages = [{ role: 'user', content: 123 }];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Message at index 0 content must be a string or null',
      );
    });

    it('should validate content length', () => {
      const longContent = 'a'.repeat(100001);
      const messages = [{ role: 'user', content: longContent }];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Message at index 0 content exceeds maximum length of 100,000 characters',
      );
    });

    it('should validate empty content for non-tool messages', () => {
      const messages = [{ role: 'user', content: '' }];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Message at index 0 has empty content');
    });

    it('should allow empty content for tool messages', () => {
      const messages = [
        { role: 'tool', content: '', tool_call_id: 'call_123' },
        { role: 'user', content: 'Hello' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(true);
    });

    it('should validate tool message tool_call_id', () => {
      const messages = [
        { role: 'tool', content: 'result' },
        { role: 'user', content: 'Hello' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Tool message at index 0 must have a valid tool_call_id',
      );
    });

    it('should validate tool_calls array structure', () => {
      const messages = [
        {
          role: 'assistant',
          content: 'Let me help',
          tool_calls: 'not an array',
        },
        { role: 'user', content: 'Hello' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Message at index 0 tool_calls must be an array',
      );
    });

    it('should validate tool_calls object structure', () => {
      const messages = [
        {
          role: 'assistant',
          content: 'Let me help',
          tool_calls: ['not an object'],
        },
        { role: 'user', content: 'Hello' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Tool call at index 0 in message 0 must be an object',
      );
    });

    it('should validate tool_calls id field', () => {
      const messages = [
        {
          role: 'assistant',
          content: 'Let me help',
          tool_calls: [{ function: { name: 'test' } }],
        },
        { role: 'user', content: 'Hello' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Tool call at index 0 in message 0 must have a valid id',
      );
    });

    it('should validate tool_calls function structure', () => {
      const messages = [
        {
          role: 'assistant',
          content: 'Let me help',
          tool_calls: [{ id: 'call_123' }],
        },
        { role: 'user', content: 'Hello' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Tool call at index 0 in message 0 must have a valid function object',
      );
    });

    it('should validate tool_calls function name', () => {
      const messages = [
        {
          role: 'assistant',
          content: 'Let me help',
          tool_calls: [{ id: 'call_123', function: {} }],
        },
        { role: 'user', content: 'Hello' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Tool call at index 0 in message 0 must have a valid function name',
      );
    });

    it('should require last message to be from user or assistant', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        {
          role: 'assistant',
          content: null,
          tool_calls: [mockToolCall],
        },
        { role: 'tool', content: 'result', tool_call_id: mockToolCall.id },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Last message must be from user or assistant');
    });

    it('should warn about consecutive messages but still validate', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'user', content: 'Are you there?' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Consecutive messages with same role detected in conversation',
      );
      consoleSpy.mockRestore();
    });

    it('should reject assistant message with empty tool_calls array', () => {
      const messages = [
        {
          role: 'assistant',
          content: null,
          tool_calls: [],
        },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Message at index 0 is from assistant but has empty array 'tool_calls'. Expected an array with minimum length 1 when 'tool_calls' is provided.",
      );
    });

    it('should reject tool message not preceded by assistant with tool_calls', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'tool', content: 'result', tool_call_id: 'call_1' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Messages with role 'tool' must be preceded by a valid 'assistant' message. Found invalid sequence at 1 and 0.",
      );
    });

    it('should reject tool message preceded by assistant without tool_calls', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Let me help' },
        { role: 'tool', content: 'result', tool_call_id: 'call_1' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Messages with role 'tool' must be preceded by a valid 'assistant' message. Found invalid sequence at 2 and 1.",
      );
    });

    it('should accept tool messages preceded by assistant with tool_calls', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call_1',
              type: 'function',
              function: { name: 'search', arguments: '{}' },
            },
            {
              id: 'call_2',
              type: 'function',
              function: { name: 'get_weather', arguments: '{"city":"NYC"}' },
            },
          ],
        },
        { role: 'tool', content: 'search result', tool_call_id: 'call_1' },
        { role: 'tool', content: 'sunny 72F', tool_call_id: 'call_2' },
        { role: 'assistant', content: 'Here are the results.' },
      ];

      const result = validateMessages(messages);

      expect(result.error).toBeUndefined();
      expect(result.isValid).toBe(true);
    });

    it('should reject second tool message when first is not preceded by assistant with tool_calls', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'tool', content: 'first result', tool_call_id: 'call_1' },
        { role: 'tool', content: 'second result', tool_call_id: 'call_2' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Messages with role 'tool' must be preceded by a valid 'assistant' message. Found invalid sequence at 1 and 0.",
      );
    });

    it('should reject consecutive tool messages preceded by assistant without tool_calls', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Let me help' },
        { role: 'tool', content: 'first result', tool_call_id: 'call_1' },
        { role: 'tool', content: 'second result', tool_call_id: 'call_2' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Messages with role 'tool' must be preceded by a valid 'assistant' message. Found invalid sequence at 2 and 1.",
      );
    });
  });

  describe('executeToolCall', () => {
    let mockClient: any;
    let mockClients: Map<string, any>;
    let mockTools: any[];

    beforeEach(() => {
      mockClient = {
        callTool: jest.fn(),
      };
      mockClients = new Map([['server1', mockClient]]);
      mockTools = [
        {
          function: { name: 'test_tool' },
          serverId: 'server1',
        },
      ];
    });

    it('should execute tool call successfully', async () => {
      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'Tool result' }],
      });

      const result = await executeToolCall(
        mockToolCall,
        mockTools,
        mockClients,
      );

      expect(result).toEqual({
        id: 'call_123',
        name: 'test_tool',
        arguments: { param: 'value' },
        result: 'Tool result',
        serverId: 'server1',
      });
    });

    it('should handle different result formats', async () => {
      const toolCall = {
        id: 'call_123',
        type: 'function' as const,
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: 'Direct string result',
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result.result).toBe('Direct string result');
    });

    it('should handle empty arguments', async () => {
      const toolCall = {
        id: 'call_123',
        type: 'function' as const,
        function: {
          name: 'test_tool',
          arguments: '',
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'Success' }],
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

      expect(result.arguments).toEqual({});
    });

    it('should throw error when tool not found', async () => {
      const toolCall = {
        id: 'call_123',
        type: 'function' as const,
        function: {
          name: 'nonexistent_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      await expect(
        executeToolCall(toolCall, mockTools, mockClients),
      ).rejects.toThrow("Tool 'nonexistent_tool' not found");
    });

    it('should throw error when client not found', async () => {
      const toolCall = {
        id: 'call_123',
        type: 'function' as const,
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      const toolsWithMissingServer = [
        {
          type: 'function' as const,
          function: {
            name: 'test_tool',
            description: 'Test tool',
            parameters: {},
          },
          serverId: 'missing_server',
        },
      ];

      await expect(
        executeToolCall(toolCall, toolsWithMissingServer, mockClients),
      ).rejects.toThrow("Client for server 'missing_server' not found");
    });

    it('should handle malformed JSON arguments', async () => {
      const toolCall = {
        id: 'call_123',
        type: 'function' as const,
        function: {
          name: 'test_tool',
          arguments: 'invalid json{',
        },
      };

      await expect(
        executeToolCall(toolCall, mockTools, mockClients),
      ).rejects.toThrow();
    });

    it('should propagate client errors', async () => {
      const toolCall = {
        id: 'call_123',
        type: 'function' as const,
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      mockClient.callTool.mockRejectedValue(new Error('Tool execution failed'));

      await expect(
        executeToolCall(toolCall, mockTools, mockClients),
      ).rejects.toThrow('Tool execution failed');
    });
  });

  describe('validateConfig - systemPrompt validation', () => {
    it('should accept valid systemPrompt', () => {
      const mockConfig = {
        getOptionalConfigArray: jest.fn((key: string) => {
          if (key === 'mcpChat.providers') {
            return [
              {
                getString: jest.fn((innerKey: string) => {
                  if (innerKey === 'id') return 'openai';
                  if (innerKey === 'model') return 'gpt-4';
                  return 'test-value';
                }),
                getOptionalString: jest.fn(),
                has: jest.fn(),
              },
            ];
          }
          if (key === 'mcpChat.mcpServers') {
            return [
              {
                getString: jest.fn(),
                getOptionalString: jest.fn(),
                getOptionalConfig: jest.fn(),
                has: jest.fn(),
              },
            ];
          }
          if (key === 'mcpChat.quickPrompts') {
            return [];
          }
          return [];
        }),
        getOptionalString: jest.fn((key: string) => {
          if (key === 'mcpChat.systemPrompt') {
            return 'You are a helpful assistant specialized in DevOps.';
          }
          return undefined;
        }),
      } as any;

      expect(() => validateConfig(mockConfig)).not.toThrow();
    });

    it('should accept undefined systemPrompt', () => {
      const mockConfig = {
        getOptionalConfigArray: jest.fn((key: string) => {
          if (key === 'mcpChat.providers') {
            return [
              {
                getString: jest.fn((innerKey: string) => {
                  if (innerKey === 'id') return 'openai';
                  if (innerKey === 'model') return 'gpt-4';
                  return 'test-value';
                }),
                getOptionalString: jest.fn(),
                has: jest.fn(),
              },
            ];
          }
          if (key === 'mcpChat.mcpServers') {
            return [
              {
                getString: jest.fn(),
                getOptionalString: jest.fn(),
                getOptionalConfig: jest.fn(),
                has: jest.fn(),
              },
            ];
          }
          if (key === 'mcpChat.quickPrompts') {
            return [];
          }
          return [];
        }),
        getOptionalString: jest.fn((key: string) => {
          if (key === 'mcpChat.systemPrompt') {
            return undefined;
          }
          return undefined;
        }),
      } as any;

      expect(() => validateConfig(mockConfig)).not.toThrow();
    });

    it('should reject empty systemPrompt', () => {
      const mockConfig = {
        getOptionalConfigArray: jest.fn((key: string) => {
          if (key === 'mcpChat.providers') {
            return [
              {
                getString: jest.fn((innerKey: string) => {
                  if (innerKey === 'id') return 'openai';
                  if (innerKey === 'model') return 'gpt-4';
                  return 'test-value';
                }),
                getOptionalString: jest.fn(),
                has: jest.fn(),
              },
            ];
          }
          if (key === 'mcpChat.mcpServers') {
            return [
              {
                getString: jest.fn(),
                getOptionalString: jest.fn(),
                getOptionalConfig: jest.fn(),
                has: jest.fn(),
              },
            ];
          }
          if (key === 'mcpChat.quickPrompts') {
            return [];
          }
          return [];
        }),
        getOptionalString: jest.fn((key: string) => {
          if (key === 'mcpChat.systemPrompt') {
            return '';
          }
          return undefined;
        }),
      } as any;

      expect(() => validateConfig(mockConfig)).toThrow(
        'systemPrompt cannot be empty or whitespace-only',
      );
    });

    it('should reject whitespace-only systemPrompt', () => {
      const mockConfig = {
        getOptionalConfigArray: jest.fn((key: string) => {
          if (key === 'mcpChat.providers') {
            return [
              {
                getString: jest.fn((innerKey: string) => {
                  if (innerKey === 'id') return 'openai';
                  if (innerKey === 'model') return 'gpt-4';
                  return 'test-value';
                }),
                getOptionalString: jest.fn(),
                has: jest.fn(),
              },
            ];
          }
          if (key === 'mcpChat.mcpServers') {
            return [
              {
                getString: jest.fn(),
                getOptionalString: jest.fn(),
                getOptionalConfig: jest.fn(),
                has: jest.fn(),
              },
            ];
          }
          if (key === 'mcpChat.quickPrompts') {
            return [];
          }
          return [];
        }),
        getOptionalString: jest.fn((key: string) => {
          if (key === 'mcpChat.systemPrompt') {
            return '   \n\t  ';
          }
          return undefined;
        }),
      } as any;

      expect(() => validateConfig(mockConfig)).toThrow(
        'systemPrompt cannot be empty or whitespace-only',
      );
    });

    it('should reject non-string systemPrompt', () => {
      const mockConfig = {
        getOptionalConfigArray: jest.fn((key: string) => {
          if (key === 'mcpChat.providers') {
            return [
              {
                getString: jest.fn((innerKey: string) => {
                  if (innerKey === 'id') return 'openai';
                  if (innerKey === 'model') return 'gpt-4';
                  return 'test-value';
                }),
                getOptionalString: jest.fn(),
                has: jest.fn(),
              },
            ];
          }
          if (key === 'mcpChat.mcpServers') {
            return [
              {
                getString: jest.fn(),
                getOptionalString: jest.fn(),
                getOptionalConfig: jest.fn(),
                has: jest.fn(),
              },
            ];
          }
          if (key === 'mcpChat.quickPrompts') {
            return [];
          }
          return [];
        }),
        getOptionalString: jest.fn((key: string) => {
          if (key === 'mcpChat.systemPrompt') {
            return 123 as any;
          }
          return undefined;
        }),
      } as any;

      expect(() => validateConfig(mockConfig)).toThrow(
        'systemPrompt must be a string',
      );
    });
  });

  describe('validateEnabledTools', () => {
    it('should accept undefined enabledTools', () => {
      const result = validateEnabledTools(undefined);
      expect(result.isValid).toBe(true);
    });

    it('should accept null enabledTools', () => {
      const result = validateEnabledTools(null);
      expect(result.isValid).toBe(true);
    });

    it('should accept an empty array', () => {
      const result = validateEnabledTools([]);
      expect(result.isValid).toBe(true);
    });

    it('should accept an array of strings', () => {
      const result = validateEnabledTools(['tool_1', 'tool_2']);
      expect(result.isValid).toBe(true);
    });

    it('should reject non-array values', () => {
      const result = validateEnabledTools('not-an-array');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('enabledTools must be an array');
    });

    it('should reject arrays containing non-string elements', () => {
      const result = validateEnabledTools(['valid', 123, true]);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('All enabledTools must be strings');
    });
  });

  describe('validateToolApprovalMessage', () => {
    const metadata = { id: '1', timestamp: new Date().toISOString() };

    const pendingToolCall = {
      id: 'call_1',
      type: 'function' as const,
      function: { name: 'search', arguments: '{}' },
      metadata: { serverId: 'server-1', approval_status: 'pending' as const },
    };

    it('should accept assistant message with pending tool calls', () => {
      const messages: ChatMessage[] = [
        {
          role: 'assistant',
          content: null,
          tool_calls: [pendingToolCall],
          metadata,
        },
      ];

      const result = validateToolApprovalMessage(messages);
      expect(result.isValid).toBe(true);
    });

    it('should reject when last message is not from assistant', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello', metadata },
      ];

      const result = validateToolApprovalMessage(messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Last message must be from assistant');
    });

    it('should reject assistant message without tool_calls', () => {
      const messages: ChatMessage[] = [
        { role: 'assistant', content: 'Sure', metadata },
      ];

      const result = validateToolApprovalMessage(messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Last message must have an array of tool_calls with at least one item',
      );
    });

    it('should reject assistant message with empty tool_calls', () => {
      const messages: ChatMessage[] = [
        { role: 'assistant', content: null, tool_calls: [], metadata },
      ];

      const result = validateToolApprovalMessage(messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Last message must have an array of tool_calls with at least one item',
      );
    });

    it('should reject when a tool call has non-pending approval status', () => {
      const messages: ChatMessage[] = [
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            { ...pendingToolCall, metadata: { approval_status: 'approved' } },
          ],
          metadata,
        },
      ];

      const result = validateToolApprovalMessage(messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Last message must declare tool_calls with pending approval status',
      );
    });

    it('should reject when a tool call has no metadata', () => {
      const messages: ChatMessage[] = [
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: 'call_1',
              type: 'function',
              function: { name: 'search', arguments: '{}' },
            },
          ],
          metadata,
        },
      ];

      const result = validateToolApprovalMessage(messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Last message must declare tool_calls with pending approval status',
      );
    });
  });

  describe('validateDecisions', () => {
    const metadata = { id: '1', timestamp: new Date().toISOString() };

    const makeMessages = (toolCallIds: string[]): ChatMessage[] => [
      {
        role: 'assistant',
        content: null,
        tool_calls: toolCallIds.map(id => ({
          id,
          type: 'function' as const,
          function: { name: `tool_${id}`, arguments: '{}' },
          metadata: { approval_status: 'pending' as const },
        })),
        metadata,
      },
    ];

    it('should accept valid decisions matching all pending tool calls', () => {
      const messages = makeMessages(['call_1', 'call_2']);
      const decisions = {
        call_1: 'approved' as const,
        call_2: 'rejected' as const,
      };

      const result = validateDecisions(decisions, messages);
      expect(result.isValid).toBe(true);
    });

    it('should reject undefined decisions', () => {
      const messages = makeMessages(['call_1']);
      const result = validateDecisions(undefined, messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Decisions must be a non-empty object mapping tool call IDs to "approved" or "rejected"',
      );
    });

    it('should reject an empty object', () => {
      const messages = makeMessages(['call_1']);
      const result = validateDecisions({} as any, messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Decisions must be a non-empty object mapping tool call IDs to "approved" or "rejected"',
      );
    });

    it('should reject an array', () => {
      const messages = makeMessages(['call_1']);
      const result = validateDecisions([] as any, messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Decisions must be a non-empty object mapping tool call IDs to "approved" or "rejected"',
      );
    });

    it('should reject when decision count does not match tool call count', () => {
      const messages = makeMessages(['call_1', 'call_2']);
      const decisions = { call_1: 'approved' as const };

      const result = validateDecisions(decisions, messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Number of decisions (1) does not match number of pending tool calls (2)',
      );
    });

    it('should reject invalid decision values', () => {
      const messages = makeMessages(['call_1']);
      const decisions = { call_1: 'pending' as any };

      const result = validateDecisions(decisions, messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Invalid decision value for tool call "call_1": must be "approved" or "rejected"',
      );
    });

    it('should reject decision keys that do not match any tool call ID', () => {
      const messages = makeMessages(['call_1']);
      const decisions = { wrong_id: 'approved' as const };

      const result = validateDecisions(decisions, messages);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'Decision key "wrong_id" does not match any pending tool call IDs',
      );
    });
  });

  describe('sanitizeForLLM', () => {
    const meta = { id: '1', timestamp: new Date().toISOString() };

    const msg = (
      overrides: Partial<ChatMessage> & Pick<ChatMessage, 'role' | 'content'>,
    ): ChatMessage => ({ metadata: meta, ...overrides } as ChatMessage);

    const tc = (id: string, name: string) => ({
      id,
      type: 'function' as const,
      function: { name, arguments: '{}' },
      metadata: { serverId: 's1', approval_status: 'approved' as const },
    });

    it('should strip metadata from all messages', () => {
      const messages = [
        msg({ role: 'system', content: 'prompt' }),
        msg({ role: 'user', content: 'hi' }),
      ];

      const result = sanitizeForLLM(messages);

      for (const m of result) {
        expect((m as any).metadata).toBeUndefined();
      }
    });

    describe('new query (last message is not tool)', () => {
      it('should keep system, user, and plain assistant messages', () => {
        const messages = [
          msg({ role: 'system', content: 'prompt' }),
          msg({ role: 'user', content: 'q1' }),
          msg({ role: 'assistant', content: 'a1' }),
          msg({ role: 'user', content: 'q2' }),
        ];

        const result = sanitizeForLLM(messages);

        expect(result).toEqual([
          { role: 'system', content: 'prompt' },
          { role: 'user', content: 'q1' },
          { role: 'assistant', content: 'a1' },
          { role: 'user', content: 'q2' },
        ]);
      });

      it('should drop tool messages', () => {
        const messages = [
          msg({ role: 'user', content: 'q1' }),
          msg({
            role: 'assistant',
            content: null,
            tool_calls: [tc('c1', 'search')],
          }),
          msg({ role: 'tool', content: 'result', tool_call_id: 'c1' }),
          msg({ role: 'assistant', content: 'summary' }),
          msg({ role: 'user', content: 'q2' }),
        ];

        const result = sanitizeForLLM(messages);

        expect(result.some(m => m.role === 'tool')).toBe(false);
      });

      it('should collapse assistant tool_calls messages to content-only', () => {
        const messages = [
          msg({ role: 'user', content: 'q1' }),
          msg({
            role: 'assistant',
            content: 'I used a tool',
            tool_calls: [tc('c1', 'search')],
          }),
          msg({ role: 'tool', content: 'result', tool_call_id: 'c1' }),
          msg({ role: 'assistant', content: 'final answer' }),
          msg({ role: 'user', content: 'q2' }),
        ];

        const result = sanitizeForLLM(messages);

        const assistantMsgs = result.filter(m => m.role === 'assistant');
        expect(assistantMsgs).toEqual([
          { role: 'assistant', content: 'I used a tool' },
          { role: 'assistant', content: 'final answer' },
        ]);
        for (const m of assistantMsgs) {
          expect(m.tool_calls).toBeUndefined();
        }
      });

      it('should drop assistant tool_calls message with no content', () => {
        const messages = [
          msg({ role: 'user', content: 'q1' }),
          msg({
            role: 'assistant',
            content: null,
            tool_calls: [tc('c1', 'search')],
          }),
          msg({ role: 'tool', content: 'result', tool_call_id: 'c1' }),
          msg({ role: 'assistant', content: 'done' }),
          msg({ role: 'user', content: 'q2' }),
        ];

        const result = sanitizeForLLM(messages);

        expect(result).toEqual([
          { role: 'user', content: 'q1' },
          { role: 'assistant', content: 'done' },
          { role: 'user', content: 'q2' },
        ]);
      });
    });

    describe('tool follow-up (last message is tool)', () => {
      it('should keep the active tool round with tool_calls and responses', () => {
        const messages = [
          msg({ role: 'user', content: 'q1' }),
          msg({
            role: 'assistant',
            content: null,
            tool_calls: [tc('c1', 'search')],
          }),
          msg({ role: 'tool', content: 'result', tool_call_id: 'c1' }),
        ];

        const result = sanitizeForLLM(messages);

        expect(result).toHaveLength(3);
        expect(result[1].tool_calls).toBeDefined();
        expect(result[1].tool_calls![0].id).toBe('c1');
        expect(result[2].role).toBe('tool');
      });

      it('should strip metadata from tool_calls in the active round', () => {
        const messages = [
          msg({ role: 'user', content: 'q1' }),
          msg({
            role: 'assistant',
            content: null,
            tool_calls: [tc('c1', 'search')],
          }),
          msg({ role: 'tool', content: 'result', tool_call_id: 'c1' }),
        ];

        const result = sanitizeForLLM(messages);

        expect((result[1].tool_calls![0] as any).metadata).toBeUndefined();
      });

      it('should collapse older tool rounds into summaries', () => {
        const messages = [
          msg({ role: 'user', content: 'q1' }),
          // Older round
          msg({
            role: 'assistant',
            content: 'old summary',
            tool_calls: [tc('old1', 'old_tool')],
          }),
          msg({ role: 'tool', content: 'old result', tool_call_id: 'old1' }),
          msg({ role: 'assistant', content: 'mid answer' }),
          msg({ role: 'user', content: 'q2' }),
          // Active round
          msg({
            role: 'assistant',
            content: null,
            tool_calls: [tc('new1', 'new_tool')],
          }),
          msg({ role: 'tool', content: 'new result', tool_call_id: 'new1' }),
        ];

        const result = sanitizeForLLM(messages);

        // Older assistant with tool_calls collapsed to content-only
        expect(result[1]).toEqual({
          role: 'assistant',
          content: 'old summary',
        });
        // Older tool response dropped
        expect(result.filter(m => m.role === 'tool')).toHaveLength(1);
        expect(result.find(m => m.role === 'tool')!.tool_call_id).toBe('new1');
        // Active round kept
        expect(result.find(m => m.tool_calls)!.tool_calls![0].id).toBe('new1');
      });

      it('should drop older assistant tool_calls with no content', () => {
        const messages = [
          msg({ role: 'user', content: 'q1' }),
          msg({
            role: 'assistant',
            content: null,
            tool_calls: [tc('old1', 'old_tool')],
          }),
          msg({ role: 'tool', content: 'old result', tool_call_id: 'old1' }),
          msg({ role: 'assistant', content: 'answer' }),
          msg({ role: 'user', content: 'q2' }),
          msg({
            role: 'assistant',
            content: null,
            tool_calls: [tc('new1', 'new_tool')],
          }),
          msg({ role: 'tool', content: 'new result', tool_call_id: 'new1' }),
        ];

        const result = sanitizeForLLM(messages);

        // The old null-content assistant is fully dropped
        expect(result[0]).toEqual({ role: 'user', content: 'q1' });
        expect(result[1]).toEqual({ role: 'assistant', content: 'answer' });
      });
    });
  });
});
