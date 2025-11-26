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

import { OpenAIResponsesProvider } from './openai-responses-provider';
import {
  ProviderConfig,
  ChatMessage,
  MCPServerFullConfig,
  MCPServerType,
  ResponsesApiResponse,
} from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('OpenAIResponsesProvider', () => {
  let provider: OpenAIResponsesProvider;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  const config: ProviderConfig = {
    type: 'openai-responses',
    apiKey: 'test-api-key',
    baseUrl: 'http://test-api.com/v1',
    model: 'gemini/models/gemini-2.5-flash',
  };

  const mockMCPServerFullConfigs: MCPServerFullConfig[] = [
    {
      id: 'k8s',
      name: 'Kubernetes Server',
      type: MCPServerType.STREAMABLE_HTTP,
      url: 'https://kubernetes-mcp-server.example.com/mcp',
    },
    {
      id: 'brave-search',
      name: 'Brave Search',
      type: MCPServerType.STREAMABLE_HTTP,
      url: 'https://brave-search-mcp.example.com/mcp',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new OpenAIResponsesProvider(config);
    provider.setMcpServerConfigs(mockMCPServerFullConfigs);
  });

  describe('constructor', () => {
    it('should initialize with valid config', () => {
      expect(provider).toBeDefined();
    });
  });

  describe('setMcpServerConfigs', () => {
    it('should store MCP server configurations', () => {
      const newConfigs: MCPServerFullConfig[] = [
        {
          id: 'test-server',
          name: 'Test Server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'https://test.com/mcp',
        },
      ];
      provider.setMcpServerConfigs(newConfigs);
      // Configuration is stored internally for use in formatRequest
      expect(provider).toBeDefined();
    });
  });

  describe('sendMessage', () => {
    it('should send message with MCP tools to Responses API', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: 'How many pods in the mcp-servers namespace?',
        },
      ];

      const mockResponse: ResponsesApiResponse = {
        id: 'resp_test_123',
        object: 'response',
        created_at: Date.now(),
        model: 'gemini/models/gemini-2.5-flash',
        status: 'completed',
        output: [
          {
            id: 'mcp_list_1',
            type: 'mcp_list_tools',
            server_label: 'k8s',
            tools: [
              {
                name: 'pods_list_in_namespace',
                description: 'List all pods in a namespace',
                input_schema: {},
              },
            ],
          },
          {
            id: 'mcp_call_1',
            type: 'mcp_call',
            name: 'pods_list_in_namespace',
            arguments: '{"namespace":"mcp-servers"}',
            server_label: 'k8s',
            error: null,
            output: 'Found 12 pods in mcp-servers namespace',
          },
          {
            id: 'msg_1',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [
              {
                type: 'output_text',
                text: 'There are 12 pods in the mcp-servers namespace.',
              },
            ],
          },
        ],
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await provider.sendMessage(messages);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/v1/responses',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          },
          body: JSON.stringify({
            input: 'How many pods in the mcp-servers namespace?',
            model: 'gemini/models/gemini-2.5-flash',
            tools: [
              {
                type: 'mcp',
                server_url: 'https://kubernetes-mcp-server.example.com/mcp',
                server_label: 'k8s',
                require_approval: 'never',
              },
              {
                type: 'mcp',
                server_url: 'https://brave-search-mcp.example.com/mcp',
                server_label: 'brave-search',
                require_approval: 'never',
              },
            ],
          }),
        }),
      );

      expect(result).toEqual({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'There are 12 pods in the mcp-servers namespace.',
              tool_calls: [
                {
                  id: 'mcp_call_1',
                  type: 'function',
                  function: {
                    name: 'pods_list_in_namespace',
                    arguments: '{"namespace":"mcp-servers"}',
                  },
                },
              ],
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      });
    });

    it('should handle response without tool calls', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello, how are you?' },
      ];

      const mockResponse: ResponsesApiResponse = {
        id: 'resp_test_456',
        object: 'response',
        created_at: Date.now(),
        model: 'gemini/models/gemini-2.5-flash',
        status: 'completed',
        output: [
          {
            id: 'msg_1',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [
              {
                type: 'output_text',
                text: 'I am doing well, thank you for asking!',
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await provider.sendMessage(messages);

      expect(result).toEqual({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'I am doing well, thank you for asking!',
              tool_calls: undefined,
            },
          },
        ],
        usage: undefined,
      });
    });

    it('should include system prompt as instructions', async () => {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Help me' },
      ];

      const mockResponse: ResponsesApiResponse = {
        id: 'resp_test_789',
        object: 'response',
        created_at: Date.now(),
        model: 'gemini/models/gemini-2.5-flash',
        status: 'completed',
        output: [
          {
            id: 'msg_1',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [
              {
                type: 'output_text',
                text: 'How can I help you?',
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await provider.sendMessage(messages);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/v1/responses',
        expect.objectContaining({
          body: expect.stringContaining(
            '"instructions":"You are a helpful assistant."',
          ),
        }),
      );
    });

    it('should filter out non-URL servers', async () => {
      const mixedConfigs: MCPServerFullConfig[] = [
        {
          id: 'url-server',
          name: 'URL Server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'https://example.com/mcp',
        },
        {
          id: 'stdio-server',
          name: 'STDIO Server',
          type: MCPServerType.STDIO,
          npxCommand: 'some-mcp-server',
        },
      ];

      provider.setMcpServerConfigs(mixedConfigs);

      const messages: ChatMessage[] = [{ role: 'user', content: 'Test' }];

      const mockResponse: ResponsesApiResponse = {
        id: 'resp_test',
        object: 'response',
        created_at: Date.now(),
        model: 'gemini/models/gemini-2.5-flash',
        status: 'completed',
        output: [
          {
            id: 'msg_1',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'output_text', text: 'Test response' }],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await provider.sendMessage(messages);

      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1]?.body as string);

      // Should only include the URL server
      expect(requestBody.tools).toHaveLength(1);
      expect(requestBody.tools[0].server_label).toBe('url-server');
    });

    it('should handle API errors', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Test' }];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      await expect(provider.sendMessage(messages)).rejects.toThrow(
        'HTTP 500: Internal Server Error',
      );
    });

    it('should handle multiple tool calls', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Check pods and search' },
      ];

      const mockResponse: ResponsesApiResponse = {
        id: 'resp_multi',
        object: 'response',
        created_at: Date.now(),
        model: 'gemini/models/gemini-2.5-flash',
        status: 'completed',
        output: [
          {
            id: 'mcp_call_1',
            type: 'mcp_call',
            name: 'pods_list',
            arguments: '{}',
            server_label: 'k8s',
            error: null,
            output: 'Found 10 pods',
          },
          {
            id: 'mcp_call_2',
            type: 'mcp_call',
            name: 'search',
            arguments: '{"query":"kubernetes"}',
            server_label: 'brave-search',
            error: null,
            output: 'Search results...',
          },
          {
            id: 'msg_1',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [
              {
                type: 'output_text',
                text: 'Found 10 pods and search results.',
              },
            ],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await provider.sendMessage(messages);

      expect(result.choices[0].message.tool_calls).toHaveLength(2);
      expect(result.choices[0].message.tool_calls![0].function.name).toBe(
        'pods_list',
      );
      expect(result.choices[0].message.tool_calls![1].function.name).toBe(
        'search',
      );
    });

    it('should include headers in tools when server has headers', async () => {
      const serverWithHeaders: MCPServerFullConfig[] = [
        {
          id: 'github-server',
          name: 'GitHub Server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'https://api.githubcopilot.com/mcp',
          headers: {
            Authorization: 'Bearer ghp_test_token_123',
          },
        },
      ];

      provider.setMcpServerConfigs(serverWithHeaders);

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test with headers' },
      ];

      const mockResponse: ResponsesApiResponse = {
        id: 'resp_headers',
        object: 'response',
        created_at: Date.now(),
        model: 'gemini/models/gemini-2.5-flash',
        status: 'completed',
        output: [
          {
            id: 'msg_1',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'output_text', text: 'Response' }],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await provider.sendMessage(messages);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/v1/responses',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );

      const callArgs = mockFetch.mock.calls[0];
      const bodyStr = callArgs[1]?.body as string;
      const bodyObj = JSON.parse(bodyStr);

      expect(bodyObj.tools).toHaveLength(1);
      expect(bodyObj.tools[0]).toEqual({
        type: 'mcp',
        server_url: 'https://api.githubcopilot.com/mcp',
        server_label: 'github-server',
        require_approval: 'never',
        headers: {
          Authorization: 'Bearer ghp_test_token_123',
        },
      });
    });

    it('should not include headers field when server has no headers', async () => {
      const serverWithoutHeaders: MCPServerFullConfig[] = [
        {
          id: 'k8s-server',
          name: 'Kubernetes Server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'https://k8s.example.com/mcp',
        },
      ];

      provider.setMcpServerConfigs(serverWithoutHeaders);

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test without headers' },
      ];

      const mockResponse: ResponsesApiResponse = {
        id: 'resp_no_headers',
        object: 'response',
        created_at: Date.now(),
        model: 'gemini/models/gemini-2.5-flash',
        status: 'completed',
        output: [
          {
            id: 'msg_1',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'output_text', text: 'Response' }],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await provider.sendMessage(messages);

      const callArgs = mockFetch.mock.calls[0];
      const bodyStr = callArgs[1]?.body as string;
      const bodyObj = JSON.parse(bodyStr);

      expect(bodyObj.tools).toHaveLength(1);
      expect(bodyObj.tools[0]).toEqual({
        type: 'mcp',
        server_url: 'https://k8s.example.com/mcp',
        server_label: 'k8s-server',
        require_approval: 'never',
      });
      expect(bodyObj.tools[0].headers).toBeUndefined();
    });

    it('should handle multiple servers with mixed header configurations', async () => {
      const mixedServers: MCPServerFullConfig[] = [
        {
          id: 'github-server',
          name: 'GitHub Server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'https://api.githubcopilot.com/mcp',
          headers: {
            Authorization: 'Bearer ghp_token',
            'X-Custom-Header': 'custom-value',
          },
        },
        {
          id: 'k8s-server',
          name: 'Kubernetes Server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'https://k8s.example.com/mcp',
        },
        {
          id: 'backstage-server',
          name: 'Backstage Server',
          type: MCPServerType.STREAMABLE_HTTP,
          url: 'http://localhost:7008/api/mcp',
          headers: {
            Authorization: 'Bearer backstage_token',
          },
        },
      ];

      provider.setMcpServerConfigs(mixedServers);

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test mixed servers' },
      ];

      const mockResponse: ResponsesApiResponse = {
        id: 'resp_mixed',
        object: 'response',
        created_at: Date.now(),
        model: 'gemini/models/gemini-2.5-flash',
        status: 'completed',
        output: [
          {
            id: 'msg_1',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'output_text', text: 'Response' }],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await provider.sendMessage(messages);

      const callArgs = mockFetch.mock.calls[0];
      const bodyStr = callArgs[1]?.body as string;
      const bodyObj = JSON.parse(bodyStr);

      expect(bodyObj.tools).toHaveLength(3);

      // First server with headers
      expect(bodyObj.tools[0]).toEqual({
        type: 'mcp',
        server_url: 'https://api.githubcopilot.com/mcp',
        server_label: 'github-server',
        require_approval: 'never',
        headers: {
          Authorization: 'Bearer ghp_token',
          'X-Custom-Header': 'custom-value',
        },
      });

      // Second server without headers
      expect(bodyObj.tools[1]).toEqual({
        type: 'mcp',
        server_url: 'https://k8s.example.com/mcp',
        server_label: 'k8s-server',
        require_approval: 'never',
      });
      expect(bodyObj.tools[1].headers).toBeUndefined();

      // Third server with headers
      expect(bodyObj.tools[2]).toEqual({
        type: 'mcp',
        server_url: 'http://localhost:7008/api/mcp',
        server_label: 'backstage-server',
        require_approval: 'never',
        headers: {
          Authorization: 'Bearer backstage_token',
        },
      });
    });
  });

  describe('testConnection', () => {
    it('should return connected when API is reachable', async () => {
      const mockResponse: ResponsesApiResponse = {
        id: 'resp_test',
        object: 'response',
        created_at: Date.now(),
        model: 'gemini/models/gemini-2.5-flash',
        status: 'completed',
        output: [
          {
            id: 'msg_1',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'output_text', text: 'test' }],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: true,
        models: ['gemini/models/gemini-2.5-flash'],
      });
    });

    it('should return not connected on 401 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      } as Response);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'Invalid API key. Please check your API key configuration.',
      });
    });

    it('should return not connected on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'Network error',
      });
    });

    it('should handle 429 rate limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Too Many Requests',
      } as Response);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'Rate limit exceeded. Please try again later.',
      });
    });
  });

  describe('getLastResponseOutput', () => {
    it('should return the last response output', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Test' }];

      const mockResponse: ResponsesApiResponse = {
        id: 'resp_test',
        object: 'response',
        created_at: Date.now(),
        model: 'gemini/models/gemini-2.5-flash',
        status: 'completed',
        output: [
          {
            id: 'msg_1',
            type: 'message',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'output_text', text: 'Test' }],
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await provider.sendMessage(messages);
      const output = provider.getLastResponseOutput();

      expect(output).toEqual(mockResponse.output);
    });

    it('should return null before any message is sent', () => {
      const output = provider.getLastResponseOutput();
      expect(output).toBeNull();
    });
  });

  describe('getHeaders', () => {
    it('should include authorization header when API key is provided', () => {
      const headers = (provider as any).getHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-api-key',
      });
    });

    it('should not include authorization header when API key is not provided', () => {
      const configWithoutKey: ProviderConfig = {
        ...config,
        apiKey: undefined,
      };
      const providerWithoutKey = new OpenAIResponsesProvider(configWithoutKey);
      const headers = (providerWithoutKey as any).getHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });
});
