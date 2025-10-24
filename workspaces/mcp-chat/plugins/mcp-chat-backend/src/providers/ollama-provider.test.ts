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

import { OllamaProvider } from './ollama-provider';
import { ProviderConfig, ChatMessage, Tool } from '../types';
import { Ollama } from 'ollama';

// Mock the Ollama library
jest.mock('ollama');

const MockOllama = Ollama as jest.MockedClass<typeof Ollama>;

describe('OllamaProvider', () => {
  let provider: OllamaProvider;
  let mockOllama: jest.Mocked<Ollama>;

  const config: ProviderConfig = {
    type: 'ollama',
    baseUrl: 'http://localhost:11434',
    model: 'llama2',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockOllama = {
      chat: jest.fn(),
      list: jest.fn(),
    } as any;

    MockOllama.mockImplementation(() => mockOllama);

    provider = new OllamaProvider(config);
  });

  describe('constructor', () => {
    it('should initialize with default baseUrl', () => {
      expect(MockOllama).toHaveBeenCalledWith({
        host: 'http://localhost:11434',
      });
    });

    it('should remove /v1 suffix from baseUrl', () => {
      const configWithV1 = {
        ...config,
        baseUrl: 'http://localhost:11434/v1',
      };

      const testProvider = new OllamaProvider(configWithV1);
      expect(testProvider).toBeDefined();

      expect(MockOllama).toHaveBeenCalledWith({
        host: 'http://localhost:11434',
      });
    });

    it('should handle custom baseUrl', () => {
      const customConfig = {
        ...config,
        baseUrl: 'http://custom-ollama:8080',
      };

      const testProvider = new OllamaProvider(customConfig);
      expect(testProvider).toBeDefined();

      expect(MockOllama).toHaveBeenCalledWith({
        host: 'http://custom-ollama:8080',
      });
    });
  });

  describe('sendMessage', () => {
    it('should send simple message without tools', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello, how are you?' },
      ];

      const mockResponse = {
        message: {
          role: 'assistant',
          content: 'I am doing well, thank you!',
        },
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      } as any;

      mockOllama.chat.mockResolvedValue(mockResponse);

      const result = await provider.sendMessage(messages);

      expect(mockOllama.chat).toHaveBeenCalledWith({
        model: 'llama2',
        messages: [
          {
            role: 'user',
            content: 'Hello, how are you?',
            tool_call_id: undefined,
          },
        ],
        tools: undefined,
      });

      expect(result).toEqual({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'I am doing well, thank you!',
              tool_calls: undefined,
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      });
    });

    it('should handle null content by converting to empty string', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: null }];

      const mockResponse = {
        message: {
          role: 'assistant',
          content: 'Hello!',
        },
      } as any;

      mockOllama.chat.mockResolvedValue(mockResponse);

      await provider.sendMessage(messages);

      expect(mockOllama.chat).toHaveBeenCalledWith({
        model: 'llama2',
        messages: [
          {
            role: 'user',
            content: '',
            tool_call_id: undefined,
          },
        ],
        tools: undefined,
      });
    });

    it('should handle tools correctly', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'What is the weather like?' },
      ];

      const tools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get current weather information',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city and state',
                },
              },
              required: ['location'],
            },
          },
        },
      ];

      const mockResponse = {
        message: {
          role: 'assistant',
          content: 'I can help you get weather information.',
          tool_calls: [
            {
              id: 'call_123',
              function: {
                name: 'get_weather',
                arguments: { location: 'New York' },
              },
            },
          ],
        },
      } as any;

      mockOllama.chat.mockResolvedValue(mockResponse);

      const result = await provider.sendMessage(messages, tools);

      expect(mockOllama.chat).toHaveBeenCalledWith({
        model: 'llama2',
        messages: [
          {
            role: 'user',
            content: 'What is the weather like?',
            tool_call_id: undefined,
          },
        ],
        tools: tools,
      });

      expect(result.choices[0].message.tool_calls).toHaveLength(1);
      expect(result.choices[0].message.tool_calls![0]).toEqual({
        id: 'call_123',
        type: 'function',
        function: {
          name: 'get_weather',
          arguments: '{"location":"New York"}',
        },
      });
    });

    it('should convert string tool call arguments to objects', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'assistant',
          content: 'Let me check that for you.',
          tool_calls: [
            {
              id: 'call_123',
              type: 'function',
              function: {
                name: 'get_weather',
                arguments: '{"location":"New York"}', // String arguments
              },
            },
          ],
        },
      ];

      const mockResponse = {
        message: {
          role: 'assistant',
          content: 'Done!',
        },
      } as any;

      mockOllama.chat.mockResolvedValue(mockResponse);

      await provider.sendMessage(messages);

      expect(mockOllama.chat).toHaveBeenCalledWith({
        model: 'llama2',
        messages: [
          {
            role: 'assistant',
            content: 'Let me check that for you.',
            tool_call_id: undefined,
            tool_calls: [
              {
                id: 'call_123',
                type: 'function',
                function: {
                  name: 'get_weather',
                  arguments: { location: 'New York' }, // Converted to object
                },
              },
            ],
          },
        ],
        tools: undefined,
      });
    });

    it('should handle tool call arguments that are already objects', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'assistant',
          content: 'Let me check that for you.',
          tool_calls: [
            {
              id: 'call_123',
              type: 'function',
              function: {
                name: 'get_weather',
                arguments: { location: 'New York' }, // Already an object
              },
            },
          ],
        },
      ];

      const mockResponse = {
        message: {
          role: 'assistant',
          content: 'Done!',
        },
      } as any;

      mockOllama.chat.mockResolvedValue(mockResponse);

      await provider.sendMessage(messages);

      expect(mockOllama.chat).toHaveBeenCalledWith({
        model: 'llama2',
        messages: [
          {
            role: 'assistant',
            content: 'Let me check that for you.',
            tool_call_id: undefined,
            tool_calls: [
              {
                id: 'call_123',
                type: 'function',
                function: {
                  name: 'get_weather',
                  arguments: { location: 'New York' },
                },
              },
            ],
          },
        ],
        tools: undefined,
      });
    });

    it('should handle tool messages', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'tool',
          content: '{"temperature": "72°F", "condition": "sunny"}',
          tool_call_id: 'call_123',
        },
      ];

      const mockResponse = {
        message: {
          role: 'assistant',
          content: 'The weather is sunny and 72°F.',
        },
      } as any;

      mockOllama.chat.mockResolvedValue(mockResponse);

      await provider.sendMessage(messages);

      expect(mockOllama.chat).toHaveBeenCalledWith({
        model: 'llama2',
        messages: [
          {
            role: 'tool',
            content: '{"temperature": "72°F", "condition": "sunny"}',
            tool_call_id: 'call_123',
          },
        ],
        tools: undefined,
      });
    });

    it('should handle response with alternative tool call format', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test message' },
      ];

      const mockResponse = {
        message: {
          role: 'assistant',
          content: 'I can help with that.',
          tool_calls: [
            {
              // Alternative format without nested function
              name: 'get_info',
              arguments: { query: 'test' },
            },
          ],
        },
      } as any;

      mockOllama.chat.mockResolvedValue(mockResponse);

      const result = await provider.sendMessage(messages);

      expect(result.choices[0].message.tool_calls).toHaveLength(1);
      expect(result.choices[0].message.tool_calls![0]).toEqual({
        id: 'call_0',
        type: 'function',
        function: {
          name: 'get_info',
          arguments: '{"query":"test"}',
        },
      });
    });

    it('should handle response without usage metadata', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const mockResponse = {
        message: {
          role: 'assistant',
          content: 'Hi there!',
        },
        // No usage field
        prompt_eval_count: 5,
        eval_count: 8,
      } as any;

      mockOllama.chat.mockResolvedValue(mockResponse);

      const result = await provider.sendMessage(messages);

      expect(result.usage).toEqual({
        prompt_tokens: 5,
        completion_tokens: 8,
        total_tokens: 13,
      });
    });

    it('should handle response with null content', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const mockResponse = {
        message: {
          role: 'assistant',
          content: null,
        },
      } as any;

      mockOllama.chat.mockResolvedValue(mockResponse);

      const result = await provider.sendMessage(messages);

      expect(result.choices[0].message.content).toBeNull();
    });
  });

  describe('testConnection', () => {
    it('should return connected when model is available', async () => {
      const mockModelList = {
        models: [
          { name: 'llama2' },
          { name: 'codellama' },
          { name: 'mistral' },
        ],
      } as any;

      mockOllama.list.mockResolvedValue(mockModelList);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: true,
        models: ['llama2', 'codellama', 'mistral'],
      });

      expect(mockOllama.list).toHaveBeenCalled();
    });

    it('should return error when configured model is not available', async () => {
      const mockModelList = {
        models: [{ name: 'codellama' }, { name: 'mistral' }],
      } as any;

      mockOllama.list.mockResolvedValue(mockModelList);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        models: ['codellama', 'mistral'],
        error:
          "Model 'llama2' is not available on this Ollama server. Available models: codellama, mistral. Please ensure the model is installed by running 'ollama pull llama2' or update your configuration to use an available model.",
      });
    });

    it('should handle empty model list', async () => {
      const mockModelList = {
        models: [],
      };

      mockOllama.list.mockResolvedValue(mockModelList);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        models: [],
        error:
          "Model 'llama2' is not available on this Ollama server. Available models: none. Please ensure the model is installed by running 'ollama pull llama2' or update your configuration to use an available model.",
      });
    });

    it('should handle undefined models array', async () => {
      const mockModelList = {
        models: undefined,
      };

      mockOllama.list.mockResolvedValue(mockModelList as any);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        models: [],
        error:
          "Model 'llama2' is not available on this Ollama server. Available models: none. Please ensure the model is installed by running 'ollama pull llama2' or update your configuration to use an available model.",
      });
    });

    it('should return error when connection fails', async () => {
      const error = new Error('Connection refused');
      mockOllama.list.mockRejectedValue(error);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'Connection refused',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockOllama.list.mockRejectedValue('String error');

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'Failed to connect to Ollama server',
      });
    });
  });

  describe('getHeaders', () => {
    it('should return correct headers', () => {
      const headers = (provider as any).getHeaders();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
      });
    });
  });

  describe('formatRequest', () => {
    it('should format request correctly without tools', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const request = (provider as any).formatRequest(messages);

      expect(request).toEqual({
        model: 'llama2',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });
    });

    it('should format request correctly with tools', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const tools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'test_function',
            description: 'A test function',
            parameters: { type: 'object' },
          },
        },
      ];

      const request = (provider as any).formatRequest(messages, tools);

      expect(request).toEqual({
        model: 'llama2',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        tools: tools,
      });
    });

    it('should not include tools when empty array', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const request = (provider as any).formatRequest(messages, []);

      expect(request).toEqual({
        model: 'llama2',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });
    });
  });

  describe('parseResponse', () => {
    it('should parse response correctly', () => {
      const response = {
        message: {
          role: 'assistant',
          content: 'Hello world',
        },
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      };

      const result = (provider as any).parseResponse(response);

      expect(result).toEqual({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello world',
              tool_calls: undefined,
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      });
    });

    it('should handle response with eval counts when no usage', () => {
      const response = {
        message: {
          role: 'assistant',
          content: 'Hello world',
        },
        prompt_eval_count: 10,
        eval_count: 15,
      };

      const result = (provider as any).parseResponse(response);

      expect(result.usage).toEqual({
        prompt_tokens: 10,
        completion_tokens: 15,
        total_tokens: 25,
      });
    });

    it('should handle response with missing eval counts', () => {
      const response = {
        message: {
          role: 'assistant',
          content: 'Hello world',
        },
      };

      const result = (provider as any).parseResponse(response);

      expect(result.usage).toEqual({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      });
    });

    it('should generate IDs for tool calls without IDs', () => {
      const response = {
        message: {
          role: 'assistant',
          content: 'Let me help with that.',
          tool_calls: [
            {
              function: {
                name: 'test_function',
                arguments: { test: 'value' },
              },
            },
            {
              id: 'existing_id',
              function: {
                name: 'another_function',
                arguments: { test: 'value2' },
              },
            },
          ],
        },
      };

      const result = (provider as any).parseResponse(response);

      expect(result.choices[0].message.tool_calls).toHaveLength(2);
      expect(result.choices[0].message.tool_calls![0].id).toBe('call_0');
      expect(result.choices[0].message.tool_calls![1].id).toBe('existing_id');
    });
  });
});
