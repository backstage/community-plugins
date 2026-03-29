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
import { LLMProvider } from './base-provider';
import {
  ChatMessage,
  Tool,
  ChatResponse,
  ProviderConfig,
} from '@backstage-community/plugin-mcp-chat-common';

global.fetch = jest.fn();

class TestProvider extends LLMProvider {
  public exposeTruncateForLogging(data: string, maxLength?: number): string {
    return this.truncateForLogging(data, maxLength);
  }

  public exposeMakeRequest(endpoint: string, body: any): Promise<any> {
    return this.makeRequest(endpoint, body);
  }

  async sendMessage(
    _messages: ChatMessage[],
    _tools?: Tool[],
  ): Promise<ChatResponse> {
    return { choices: [{ message: { role: 'assistant', content: '' } }] };
  }

  async testConnection() {
    return { connected: true };
  }

  protected getHeaders(): Record<string, string> {
    return { 'Content-Type': 'application/json' };
  }

  protected formatRequest(_messages: ChatMessage[], _tools?: Tool[]): any {
    return {};
  }

  protected parseResponse(response: any): ChatResponse {
    return response;
  }
}

describe('LLMProvider', () => {
  const mockLogger = mockServices.logger.mock();

  const config: ProviderConfig = {
    type: 'test-provider',
    apiKey: 'test-key',
    baseUrl: 'http://localhost:1234',
    model: 'test-model',
    logger: mockLogger,
  };

  let provider: TestProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    provider = new TestProvider(config);
  });

  describe('truncateForLogging', () => {
    it('should return data unchanged when under default limit', () => {
      const short = 'a'.repeat(4096);
      expect(provider.exposeTruncateForLogging(short)).toBe(short);
    });

    it('should return data unchanged when exactly at default limit', () => {
      const exact = 'x'.repeat(4096);
      expect(provider.exposeTruncateForLogging(exact)).toBe(exact);
    });

    it('should truncate data exceeding default 4096 char limit', () => {
      const long = 'b'.repeat(5000);
      const result = provider.exposeTruncateForLogging(long);
      expect(result).toHaveLength(4096 + '... [truncated 904 chars]'.length);
      expect(result).toContain('... [truncated 904 chars]');
      expect(result.startsWith('b'.repeat(4096))).toBe(true);
    });

    it('should respect a custom maxLength parameter', () => {
      const data = 'c'.repeat(200);
      const result = provider.exposeTruncateForLogging(data, 100);
      expect(result).toContain('... [truncated 100 chars]');
      expect(result.startsWith('c'.repeat(100))).toBe(true);
    });

    it('should return unchanged for empty string', () => {
      expect(provider.exposeTruncateForLogging('')).toBe('');
    });
  });

  describe('makeRequest logging', () => {
    it('should log debug on successful request with request body and response data', async () => {
      const responseBody = {
        choices: [{ message: { role: 'assistant', content: 'hello' } }],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseBody,
      });

      await provider.exposeMakeRequest('/chat/completions', {
        model: 'test',
      });

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(
          '[test-provider] Request to http://localhost:1234/chat/completions',
        ),
        expect.objectContaining({ body: expect.any(String) }),
      );

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('[test-provider] Response received in'),
        expect.objectContaining({ data: expect.any(String) }),
      );
    });

    it('should log error on HTTP failure with response data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'server error details',
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        json: async () => ({ error: 'server error' }),
      });

      await expect(
        provider.exposeMakeRequest('/chat/completions', {}),
      ).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('[test-provider] Request failed (500)'),
        expect.objectContaining({ responseData: 'server error details' }),
      );
    });

    it('should log warn when finish_reason is length', async () => {
      const responseBody = {
        choices: [
          {
            message: { role: 'assistant', content: 'truncated...' },
            finish_reason: 'length',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseBody,
      });

      await provider.exposeMakeRequest('/chat/completions', {});

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('truncated due to token limit'),
      );
    });

    it('should log warn when finish_reason is max_tokens', async () => {
      const responseBody = {
        choices: [
          {
            message: { role: 'assistant', content: 'truncated...' },
            finish_reason: 'max_tokens',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseBody,
      });

      await provider.exposeMakeRequest('/chat/completions', {});

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('finish_reason: max_tokens'),
      );
    });

    it('should not log warn when finish_reason is stop', async () => {
      const responseBody = {
        choices: [
          {
            message: { role: 'assistant', content: 'done' },
            finish_reason: 'stop',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseBody,
      });

      await provider.exposeMakeRequest('/chat/completions', {});

      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should work without a logger configured', async () => {
      const noLoggerProvider = new TestProvider({
        ...config,
        logger: undefined,
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
      });

      const result = await noLoggerProvider.exposeMakeRequest(
        '/chat/completions',
        {},
      );
      expect(result).toBeDefined();
    });

    it('should truncate large request bodies in debug logs', async () => {
      const largeBody = { data: 'x'.repeat(5000) };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [] }),
      });

      await provider.exposeMakeRequest('/chat/completions', largeBody);

      const debugCall = mockLogger.debug.mock.calls[0];
      const metadata = debugCall[1] as Record<string, string>;
      expect(metadata.body).toContain('... [truncated');
    });
  });
});
