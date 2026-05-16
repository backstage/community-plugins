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

import { OpenAIProvider } from './openai-provider';
import { ProviderConfig, ChatMessage, Tool } from '../types';

global.fetch = jest.fn();

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  const config: ProviderConfig = {
    type: 'openai',
    apiKey: 'test-api-key',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    provider = new OpenAIProvider(config);
  });

  describe('sendMessage', () => {
    it('should send a message and return the response', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello!' }];

      const mockResponse = {
        choices: [{ message: { role: 'assistant', content: 'Hi there!' } }],
        usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.sendMessage(messages);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result).toEqual(mockResponse);
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
          choices: [
            { message: { role: 'assistant', content: null, tool_calls: [] } },
          ],
        }),
      });

      await provider.sendMessage(messages, tools);

      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body,
      );
      expect(body.tools).toEqual(tools);
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
    it('should return connected with models on success', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ id: 'gpt-4o' }, { id: 'gpt-4o-mini' }] }),
      });

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: true,
        models: ['gpt-4o', 'gpt-4o-mini'],
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
      expect(result.error).toContain('OpenAI');
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
      expect(result.error).toContain('OpenAI');
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
    it('should include Authorization header when API key is set', () => {
      const headers = (provider as any).getHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-api-key',
      });
    });

    it('should omit Authorization header when no API key', () => {
      const p = new OpenAIProvider({ ...config, apiKey: undefined });
      const headers = (p as any).getHeaders();
      expect(headers).toEqual({ 'Content-Type': 'application/json' });
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('formatRequest', () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

    it.each([
      ['gpt-4o-mini', 'max_tokens'],
      ['gpt-4o', 'max_tokens'],
      ['gpt-4', 'max_tokens'],
      ['gpt-3.5-turbo', 'max_tokens'],
      ['o1', 'max_completion_tokens'],
      ['o1-mini', 'max_completion_tokens'],
      ['o1-preview', 'max_completion_tokens'],
      ['o3-mini', 'max_completion_tokens'],
      ['o4-mini', 'max_completion_tokens'],
      ['gpt-5', 'max_completion_tokens'],
      ['gpt-5.2', 'max_completion_tokens'],
    ])('model %s should use %s', (model, expectedParam) => {
      const p = new OpenAIProvider({ ...config, model });
      const request = (p as any).formatRequest(messages);

      expect(request[expectedParam]).toBeDefined();
      const unexpectedParam =
        expectedParam === 'max_tokens' ? 'max_completion_tokens' : 'max_tokens';
      expect(request[unexpectedParam]).toBeUndefined();
    });

    it.each([
      [undefined, 1000],
      [4096, 4096],
      [512, 512],
    ])('maxTokens config %s should result in %d', (maxTokens, expected) => {
      const p = new OpenAIProvider({ ...config, maxTokens });
      const request = (p as any).formatRequest(messages);
      expect(request.max_tokens).toBe(expected);
    });

    it.each([
      [undefined, 0.7],
      [0.2, 0.2],
      [0, 0],
      [1, 1],
    ])('temperature config %s should result in %s', (temperature, expected) => {
      const p = new OpenAIProvider({ ...config, temperature });
      const request = (p as any).formatRequest(messages);
      expect(request.temperature).toBe(expected);
    });

    it.each(['o1', 'o1-mini', 'o3-mini', 'o4-mini', 'gpt-5', 'gpt-5.2'])(
      'model %s should NOT include temperature',
      model => {
        const p = new OpenAIProvider({ ...config, model, temperature: 0.5 });
        const request = (p as any).formatRequest(messages);
        expect(request.temperature).toBeUndefined();
      },
    );

    it.each(['gpt-4o-mini', 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo'])(
      'model %s should include temperature',
      model => {
        const p = new OpenAIProvider({ ...config, model, temperature: 0.5 });
        const request = (p as any).formatRequest(messages);
        expect(request.temperature).toBe(0.5);
      },
    );

    it('should not include tools when array is empty', () => {
      const request = (provider as any).formatRequest(messages, []);
      expect(request.tools).toBeUndefined();
    });
  });

  describe('parseResponse', () => {
    it('should return the response as-is', () => {
      const response = {
        choices: [{ message: { role: 'assistant', content: 'Hello' } }],
      };
      expect((provider as any).parseResponse(response)).toEqual(response);
    });
  });
});
