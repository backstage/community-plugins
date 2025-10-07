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
} from './utils';
import { MCPServerType } from './types';

jest.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: jest.fn(),
}));

describe('Utils', () => {
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

    it('should require at least one message', () => {
      const result = validateMessages([]);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('At least one message is required');
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

    it('should require last message to be from user', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Last message must be from user');
    });

    it('should warn about consecutive user messages but still validate', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'user', content: 'Are you there?' },
      ];

      const result = validateMessages(messages);

      expect(result.isValid).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Consecutive user messages detected in conversation',
      );
      consoleSpy.mockRestore();
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
      const toolCall = {
        id: 'call_123',
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      mockClient.callTool.mockResolvedValue({
        content: [{ type: 'text', text: 'Tool result' }],
      });

      const result = await executeToolCall(toolCall, mockTools, mockClients);

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
        function: {
          name: 'test_tool',
          arguments: JSON.stringify({ param: 'value' }),
        },
      };

      const toolsWithMissingServer = [
        {
          function: { name: 'test_tool' },
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
});
