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

import { OpenAIResponsesProvider } from './OpenAIResponsesProvider';
import type {
  ChatMessage,
  Tool,
  ProviderConfig,
} from '@backstage-community/plugin-mcp-chat-common';

// Mock global.fetch — OpenAIResponsesProvider overrides makeRequest and uses fetch directly
const mockFetch = jest.fn() as jest.Mock;
global.fetch = mockFetch;

function createProvider(
  configOverrides?: Partial<ProviderConfig>,
): OpenAIResponsesProvider {
  const config: ProviderConfig = {
    type: 'openai-responses',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    apiKey: 'test-api-key',
    ...configOverrides,
  };
  return new OpenAIResponsesProvider(config);
}

const sampleTool: Tool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the weather',
    parameters: { type: 'object', properties: { city: { type: 'string' } } },
  },
};

describe('OpenAIResponsesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a basic user message and returns parsed response with usage', async () => {
    const provider = createProvider();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        output: [
          {
            type: 'message',
            id: 'msg_1',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'output_text', text: 'Hello there!' }],
          },
        ],
        usage: {
          input_tokens: 10,
          output_tokens: 5,
          total_tokens: 15,
        },
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

  it('places system message content in instructions and last message in input', async () => {
    const provider = createProvider();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        output: [
          {
            type: 'message',
            id: 'msg_1',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'output_text', text: 'OK' }],
          },
        ],
      }),
    });

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hi' },
    ];
    await provider.sendMessage(messages);

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.instructions).toBe('You are helpful.');
    expect(body.input).toBe('Hi');
  });

  it('parses mcp_call events into ToolCall objects', async () => {
    const provider = createProvider();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        output: [
          {
            type: 'mcp_call',
            id: 'call_123',
            name: 'get_weather',
            arguments: '{"city":"Seattle"}',
            server_label: 'weather-server',
            error: null,
            output: '{"temp":72}',
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

  it('correctly extracts instructions and input when history contains system + user', async () => {
    const provider = createProvider();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        output: [
          {
            type: 'message',
            id: 'msg_1',
            role: 'assistant',
            status: 'completed',
            content: [{ type: 'output_text', text: 'It is sunny in NYC.' }],
          },
        ],
      }),
    });

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a weather assistant.' },
      { role: 'user', content: 'What is the weather in NYC?' },
    ];
    await provider.sendMessage(messages);

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);

    expect(body.instructions).toBe('You are a weather assistant.');
    expect(body.input).toBe('What is the weather in NYC?');
    expect(body.model).toBe('gpt-4o');
  });

  it('returns error on failed testConnection', async () => {
    const provider = createProvider();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await provider.testConnection();

    expect(result.connected).toBe(false);
    expect(result.error).toBe('Network error');
  });
});
