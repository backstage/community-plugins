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

import { AzureOpenAIProvider } from './azure-openai-provider';
import { ProviderConfig, ChatMessage } from '../types';

global.fetch = jest.fn();

const config: ProviderConfig = {
  type: 'azure-openai',
  apiKey: 'test-azure-api-key',
  baseUrl: 'https://my-resource.openai.azure.com/openai/v1',
  model: 'gpt-4o-mini',
  deploymentName: 'my-gpt-4o-mini-deployment',
};

describe('AzureOpenAIProvider', () => {
  let provider: AzureOpenAIProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    provider = new AzureOpenAIProvider(config);
  });

  describe('constructor', () => {
    it('should throw when deploymentName is missing', () => {
      expect(
        () => new AzureOpenAIProvider({ ...config, deploymentName: undefined }),
      ).toThrow(/Deployment name is required for the azure-openai provider./);
    });

    it('should not throw when all required fields are provided', () => {
      expect(() => new AzureOpenAIProvider(config)).not.toThrow();
    });
  });

  describe('formatRequest', () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

    it('should send the deploymentName as the model field in the request body', () => {
      const request = (provider as any).formatRequest(messages);
      expect(request.model).toBe('my-gpt-4o-mini-deployment');
    });

    it('should use the underlying model name for capability detection, not the deployment name', () => {
      // model = gpt-4o-mini → should use max_tokens (not max_completion_tokens)
      const request = (provider as any).formatRequest(messages);
      expect(request.max_tokens).toBeDefined();
      expect(request.max_completion_tokens).toBeUndefined();
    });

    it('should use max_completion_tokens when underlying model is o-series', () => {
      const p = new AzureOpenAIProvider({
        ...config,
        model: 'o1-mini',
        deploymentName: 'my-o1-mini-deployment',
      });
      const request = (p as any).formatRequest(messages);
      expect(request.max_completion_tokens).toBeDefined();
      expect(request.max_tokens).toBeUndefined();
      expect(request.model).toBe('my-o1-mini-deployment');
    });

    it('should use max_completion_tokens when underlying model is gpt-5', () => {
      const p = new AzureOpenAIProvider({
        ...config,
        model: 'gpt-5',
        deploymentName: 'my-gpt-5-deployment',
      });
      const request = (p as any).formatRequest(messages);
      expect(request.max_completion_tokens).toBeDefined();
      expect(request.max_tokens).toBeUndefined();
    });

    it.each([
      ['o1-mini', 'acme-prod-o1-mini-deployment'],
      ['gpt-5', 'internal-gpt-5-preview-deploy'],
    ])(
      'model field in body should always be the deploymentName (%s / %s)',
      (model, deploymentName) => {
        const p = new AzureOpenAIProvider({ ...config, model, deploymentName });
        const request = (p as any).formatRequest(messages);
        expect(request.model).toBe(deploymentName);
      },
    );
  });

  describe('testConnection', () => {
    it('should return connected with the configured model and not all models', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: 'gpt-4o-mini', status: 'succeeded' },
            { id: 'gpt-5', status: 'succeeded' },
            { id: 'gpt-5.1', status: 'succeeded' },
          ],
        }),
      });

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: true,
        models: ['gpt-4o-mini'],
      });
    });

    it('should return all models and log a warning when configured model is not in the list', async () => {
      const mockLogger = {
        warn: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
        child: jest.fn(),
      };
      const p = new AzureOpenAIProvider({
        ...config,
        logger: mockLogger as any,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { id: 'gpt-5', status: 'succeeded' },
            { id: 'gpt-5.1', status: 'succeeded' },
          ],
        }),
      });

      const result = await p.testConnection();

      expect(result).toEqual({
        connected: true,
        models: ['gpt-5', 'gpt-5.1'],
      });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          '[azure-openai] Configured model "gpt-4o-mini" was not found',
        ),
      );
    });

    it('should log a warning when no models are available', async () => {
      const mockLogger = {
        warn: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
        child: jest.fn(),
      };
      const p = new AzureOpenAIProvider({
        ...config,
        logger: mockLogger as any,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const result = await p.testConnection();

      expect(result).toEqual({
        connected: true,
        models: [],
      });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          '[azure-openai] Configured model "gpt-4o-mini" was not found',
        ),
      );
    });

    it('should say "Azure OpenAI" in 401 error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () =>
          JSON.stringify({ error: { message: 'Unauthorized' } }),
      });

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toContain('Azure OpenAI');
      expect(result.error).toContain('Invalid API key');
      expect(result.error).not.toBe(
        'Invalid API key. Please check your OpenAI API key configuration.',
      );
    });

    it('should say "Azure OpenAI" in 429 error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Too Many Requests',
      });

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toContain('Azure OpenAI');
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should say "Azure OpenAI" in generic API error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => '{"error":{"message":"Internal error"}}',
      });

      const result = await provider.testConnection();

      expect(result.connected).toBe(false);
    });
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
        'https://my-resource.openai.azure.com/openai/v1/chat/completions',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result).toEqual(mockResponse);

      const body = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body,
      );
      expect(body.model).toBe('my-gpt-4o-mini-deployment');
    });

    it('should include tools in the request when provided', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'What is the weather?' },
      ];
      const tools = [
        {
          type: 'function' as const,
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
      expect(body.model).toBe('my-gpt-4o-mini-deployment');
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
});
