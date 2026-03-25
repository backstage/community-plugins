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

import { ClaudeProvider } from './ClaudeProvider';
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
): ClaudeProvider {
  const config: ProviderConfig = {
    type: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-sonnet-4-20250514',
    apiKey: 'test-api-key',
    ...configOverrides,
  };
  return new ClaudeProvider(config);
}

const sampleTool: Tool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the weather',
    parameters: { type: 'object', properties: { city: { type: 'string' } } },
  },
};

describe('ClaudeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a basic user message and returns parsed response', async () => {
    const provider = createProvider();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: 'Hello there!' }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
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

  it('filters system messages from the array sent to the API', async () => {
    const provider = createProvider();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: 'OK' }],
      }),
    });

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hi' },
    ];
    await provider.sendMessage(messages);

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages.every((m: any) => m.role !== 'system')).toBe(true);
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0]).toEqual({ role: 'user', content: 'Hi' });
  });

  it('parses tool_use blocks into ToolCall objects', async () => {
    const provider = createProvider();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          {
            type: 'tool_use',
            id: 'call_123',
            name: 'get_weather',
            input: { city: 'Seattle' },
          },
        ],
      }),
    });

    const result = await provider.sendMessage(
      [{ role: 'user', content: 'Weather in Seattle?' }],
      [sampleTool],
    );

    expect(result.choices[0].message.tool_calls).toHaveLength(1);
    expect(result.choices[0].message.tool_calls![0]).toEqual({
      id: 'call_123',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: '{"city":"Seattle"}',
      },
    });
  });

  it('converts tool messages to user format with Tool result prefix and includes assistant tool_calls in history', async () => {
    const provider = createProvider();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: 'It is sunny in NYC.' }],
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

    // Tool message converted to user with "Tool result:" prefix
    const toolMsg = body.messages.find(
      (m: any) =>
        m.role === 'user' &&
        typeof m.content === 'string' &&
        m.content.startsWith('Tool result:'),
    );
    expect(toolMsg).toBeDefined();
    expect(toolMsg.content).toBe('Tool result: Sunny, 75°F');

    // Assistant message is included in history
    const assistantMsg = body.messages.find((m: any) => m.role === 'assistant');
    expect(assistantMsg).toBeDefined();
  });

  it('returns error on failed testConnection', async () => {
    const provider = createProvider();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await provider.testConnection();

    expect(result.connected).toBe(false);
    expect(result.error).toBe('Network error');
  });
});
