/*
 * Copyright 2026 The Backstage Authors
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
import { ClaudeProvider } from './claude-provider';
import { ProviderConfig, ChatMessage, Tool } from '../types';

global.fetch = jest.fn();

describe('ClaudeProvider', () => {
  let provider: ClaudeProvider;

  const mockLogger = mockServices.logger.mock();

  const config: ProviderConfig = {
    type: 'claude',
    apiKey: 'test-api-key',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-20241022',
    logger: mockLogger,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    provider = new ClaudeProvider(config);
  });

  describe('sendMessage', () => {
    it('should send a message and return the response', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello!' }];

      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Hi there!' }],
        usage: { input_tokens: 5, output_tokens: 5 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.sendMessage(messages);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'x-api-key': 'test-api-key',
          }),
        }),
      );
      expect(result).toEqual({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hi there!',
              tool_calls: undefined,
            },
          },
        ],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 5,
          total_tokens: 10,
        },
      });
    });

    it('should include tools in the request when provided', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'What is the weather?' },
      ];
      const tools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get weather',
            parameters: {
              type: 'object',
              properties: { location: { type: 'string' } },
            },
          },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'msg_123',
          type: 'message',
          role: 'assistant',
          content: [{ type: 'text', text: 'Sunny' }],
        }),
      });

      await provider.sendMessage(messages, tools);

      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body,
      );
      expect(body.tools).toEqual([
        {
          name: 'get_weather',
          description: 'Get weather',
          input_schema: {
            type: 'object',
            properties: { location: { type: 'string' } },
          },
        },
      ]);
    });

    it('should throw on API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(
        provider.sendMessage([{ role: 'user', content: 'Hello' }]),
      ).rejects.toThrow();
    });
  });

  describe('testConnection', () => {
    it('should return connected with the configured model on success', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'msg_123',
          type: 'message',
          role: 'assistant',
          content: [{ type: 'text', text: 'Hello' }],
        }),
      });

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: true,
        models: ['claude-3-5-sonnet-20241022'],
      });
    });

    it('should return error message on 401', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () =>
          JSON.stringify({ error: { message: 'Unauthorized' } }),
      });

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toContain('Invalid API key');
      expect(result.error).toContain('Claude');
    });

    it('should return error message on 429', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Too Many Requests',
      });

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toContain('Rate limit exceeded');
      expect(result.error).toContain('Claude');
    });

    it('should return error message on 403', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Forbidden',
      });

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toContain('Access forbidden');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error'),
      );

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('string error');

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });

  describe('getHeaders', () => {
    it('should include Claude headers when API key is set', () => {
      const headers = (provider as any).getHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': 'test-api-key',
      });
    });

    it('should omit x-api-key header when no API key', () => {
      const p = new ClaudeProvider({ ...config, apiKey: undefined });
      const headers = (p as any).getHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      });
      expect(headers['x-api-key']).toBeUndefined();
    });
  });

  describe('formatRequest', () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

    it('should use a default max_tokens of 4096 when unset', () => {
      const request = (provider as any).formatRequest(messages);
      expect(request.max_tokens).toBe(4096);
    });

    it('should use custom maxTokens when provided', () => {
      const p = new ClaudeProvider({ ...config, maxTokens: 2048 });
      const request = (p as any).formatRequest(messages);
      expect(request.max_tokens).toBe(2048);
    });

    it('should include temperature when set', () => {
      const p = new ClaudeProvider({ ...config, temperature: 0.5 });
      const request = (p as any).formatRequest(messages);
      expect(request.temperature).toBe(0.5);
    });

    it('should not include temperature when unset', () => {
      const request = (provider as any).formatRequest(messages);
      expect(request.temperature).toBeUndefined();
    });

    it('should convert tools to Anthropic tool format', () => {
      const tools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get weather',
            parameters: {
              type: 'object',
              properties: { location: { type: 'string' } },
            },
          },
        },
      ];

      const request = (provider as any).formatRequest(messages, tools);
      expect(request.tools).toEqual([
        {
          name: 'get_weather',
          description: 'Get weather',
          input_schema: {
            type: 'object',
            properties: { location: { type: 'string' } },
          },
        },
      ]);
    });
  });

  describe('parseResponse', () => {
    it('should parse assistant text and tool calls from the Claude response', () => {
      const response = {
        content: [
          { type: 'text', text: 'Hello there' },
          {
            type: 'tool_use',
            id: 'call_123',
            name: 'get_weather',
            input: { location: 'New York' },
          },
        ],
        usage: { input_tokens: 10, output_tokens: 5 },
      };

      expect((provider as any).parseResponse(response)).toEqual({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello there',
              tool_calls: [
                {
                  id: 'call_123',
                  type: 'function',
                  function: {
                    name: 'get_weather',
                    arguments: '{"location":"New York"}',
                  },
                },
              ],
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      });
    });
  });

  describe('pathOverrides', () => {
    it('should use pathOverrides for inference when present', async () => {
      const customPathProvider = new ClaudeProvider({
        ...config,
        pathOverrides: {
          inference: '/custom-messages',
        },
      });
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello!' }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'msg_123',
          type: 'message',
          role: 'assistant',
          content: [{ type: 'text', text: 'Hi there!' }],
          usage: { input_tokens: 5, output_tokens: 5 },
        }),
      });

      await customPathProvider.sendMessage(messages);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/custom-messages',
        expect.objectContaining({ method: 'POST' }),
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'msg_456',
          type: 'message',
          role: 'assistant',
          content: [{ type: 'text', text: 'OK' }],
        }),
      });

      await customPathProvider.testConnection();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/custom-messages',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
