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

import { LiteLLMProvider } from './LiteLLMProvider';
import type {
  ChatMessage,
  Tool,
  ProviderConfig,
} from '@backstage-community/plugin-mcp-chat-common';

// Mock global.fetch for makeRequest and testConnection
const mockFetch = jest.fn() as jest.Mock;
global.fetch = mockFetch;

function createProvider(
  configOverrides?: Partial<ProviderConfig>,
): LiteLLMProvider {
  const config: ProviderConfig = {
    type: 'litellm',
    baseUrl: 'http://localhost:4000',
    model: 'gpt-4o',
    apiKey: 'test-api-key',
    ...configOverrides,
  };
  return new LiteLLMProvider(config);
}

const sampleTool: Tool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the weather',
    parameters: { type: 'object', properties: { city: { type: 'string' } } },
  },
};

describe('LiteLLMProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a basic user message and returns the response as-is (passthrough)', async () => {
    const provider = createProvider();
    const apiResponse = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Hello there!',
          },
        },
      ],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => apiResponse,
    });

    const messages: ChatMessage[] = [{ role: 'user', content: 'Hi' }];
    const result = await provider.sendMessage(messages);

    expect(result.choices[0].message.role).toBe('assistant');
    expect(result.choices[0].message.content).toBe('Hello there!');
    expect(result.usage).toEqual({
      prompt_tokens: 10,
      completion_tokens: 5,
      total_tokens: 15,
    });
  });

  it('includes system messages as-is in the formatted request', async () => {
    const provider = createProvider();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { role: 'assistant', content: 'OK' } }],
      }),
    });

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hi' },
    ];
    await provider.sendMessage(messages);

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0]).toEqual({
      role: 'system',
      content: 'You are helpful.',
    });
    expect(body.messages[1]).toEqual({ role: 'user', content: 'Hi' });
  });

  it('returns native tool_calls directly and includes parallel_tool_calls in the request', async () => {
    const provider = createProvider();
    const apiResponse = {
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
                  arguments: '{"city":"Seattle"}',
                },
              },
            ],
          },
        },
      ],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => apiResponse,
    });

    const result = await provider.sendMessage(
      [{ role: 'user', content: 'Weather in Seattle?' }],
      [sampleTool],
    );

    // Verify tool_calls are returned directly
    expect(result.choices[0].message.tool_calls).toHaveLength(1);
    expect(result.choices[0].message.tool_calls![0]).toEqual({
      id: 'call_123',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: '{"city":"Seattle"}',
      },
    });

    // Verify parallel_tool_calls: true is in the request
    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.parallel_tool_calls).toBe(true);
  });

  it('passes tool messages with tool_call_id as-is in the request', async () => {
    const provider = createProvider();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: { role: 'assistant', content: 'It is sunny in NYC.' },
          },
        ],
      }),
    });

    const messages: ChatMessage[] = [
      { role: 'user', content: 'Weather?' },
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'call_1',
            type: 'function',
            function: {
              name: 'get_weather',
              arguments: '{"city":"NYC"}',
            },
          },
        ],
      },
      { role: 'tool', content: 'Sunny, 75°F', tool_call_id: 'call_1' },
    ];
    await provider.sendMessage(messages);

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);

    // Tool message passed as-is with tool_call_id
    const toolMsg = body.messages.find((m: any) => m.role === 'tool');
    expect(toolMsg).toBeDefined();
    expect(toolMsg.content).toBe('Sunny, 75°F');
    expect(toolMsg.tool_call_id).toBe('call_1');

    // Assistant message with tool_calls is included in history
    const assistantMsg = body.messages.find((m: any) => m.role === 'assistant');
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg.tool_calls).toHaveLength(1);
  });

  it('returns error on failed testConnection when both /models and /health fail', async () => {
    const provider = createProvider();
    // First call to /models fails
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    // Fallback call to /health also fails
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await provider.testConnection();

    expect(result.connected).toBe(false);
    expect(result.error).toBe('Network error');
  });
});
