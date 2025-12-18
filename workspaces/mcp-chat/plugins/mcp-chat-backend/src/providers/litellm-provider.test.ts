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

import { LiteLLMProvider } from './litellm-provider';
import { ProviderConfig, ChatMessage, Tool } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('LiteLLMProvider', () => {
  let provider: LiteLLMProvider;

  const config: ProviderConfig = {
    type: 'litellm',
    apiKey: 'test-api-key',
    baseUrl: 'http://localhost:4000',
    model: 'gpt-4',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    provider = new LiteLLMProvider(config);
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(provider).toBeDefined();
    });

    it('should work without API key', () => {
      const configWithoutKey = {
        ...config,
        apiKey: undefined,
      };
      const testProvider = new LiteLLMProvider(configWithoutKey);
      expect(testProvider).toBeDefined();
    });
  });

  describe('sendMessage', () => {
    it('should send simple message without tools', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello, how are you?' },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'I am doing well, thank you!',
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await provider.sendMessage(messages);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          }),
          body: expect.stringContaining('"model":"gpt-4"'),
        }),
      );

      expect(response).toEqual(mockResponse);
    });

    it('should send message with tools', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'What is the weather?' },
      ];

      const tools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get current weather',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' },
              },
            },
          },
        },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'get_weather',
                    arguments: '{"location":"San Francisco"}',
                  },
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const response = await provider.sendMessage(messages, tools);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/chat/completions',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"tools"'),
        }),
      );

      expect(response.choices[0].message.tool_calls).toHaveLength(1);
      expect(response.choices[0].message.tool_calls?.[0].function.name).toBe(
        'get_weather',
      );
    });

    it('should handle API errors', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(provider.sendMessage(messages)).rejects.toThrow();
    });
  });

  describe('testConnection', () => {
    it('should successfully test connection with models endpoint', async () => {
      const mockModelsResponse = {
        data: [
          { id: 'gpt-4' },
          { id: 'gpt-3.5-turbo' },
          { id: 'claude-3-opus' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockModelsResponse,
      });

      const result = await provider.testConnection();

      expect(result.connected).toBe(true);
      expect(result.models).toEqual([
        'gpt-4',
        'gpt-3.5-turbo',
        'claude-3-opus',
      ]);
      expect(result.error).toBeUndefined();
    });

    it('should fallback to health endpoint if models endpoint fails', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Models endpoint failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ status: 'healthy' }),
        });

      const result = await provider.testConnection();

      expect(result.connected).toBe(true);
      expect(result.models).toEqual(['gpt-4']);
    });

    it('should handle 401 authentication error', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          text: async () =>
            JSON.stringify({ error: { message: 'Unauthorized' } }),
        })
        .mockRejectedValueOnce(new Error('Health check failed'));

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toContain('Invalid API key');
    });

    it('should handle 404 endpoint not found error', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          text: async () => 'Not Found',
        })
        .mockRejectedValueOnce(new Error('Connection refused'));

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error')); // Health check also fails with same error

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('getHeaders', () => {
    it('should include Authorization header when API key is provided', () => {
      const headers = (provider as any).getHeaders();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-api-key',
      });
    });

    it('should not include Authorization header when API key is missing', () => {
      const configWithoutKey = {
        ...config,
        apiKey: undefined,
      };
      const testProvider = new LiteLLMProvider(configWithoutKey);
      const headers = (testProvider as any).getHeaders();

      expect(headers).toEqual({
        'Content-Type': 'application/json',
      });
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('formatRequest', () => {
    it('should format request with default parameters', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const request = (provider as any).formatRequest(messages);

      expect(request).toEqual({
        model: 'gpt-4',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });
    });

    it('should include tools when provided', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const tools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'test_tool',
            description: 'A test tool',
            parameters: {},
          },
        },
      ];

      const request = (provider as any).formatRequest(messages, tools);

      expect(request.tools).toEqual(tools);
      expect(request.parallel_tool_calls).toBe(true);
    });
  });

  describe('parseResponse', () => {
    it('should return response as-is for OpenAI-compatible format', () => {
      const mockResponse = {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Test response',
            },
          },
        ],
      };

      const parsed = (provider as any).parseResponse(mockResponse);

      expect(parsed).toEqual(mockResponse);
    });
  });
});
