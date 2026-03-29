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

import { OllamaProvider } from './OllamaProvider';
import type {
  ChatMessage,
  Tool,
  ProviderConfig,
} from '@backstage-community/plugin-mcp-chat-common';

// Mock the ollama SDK module
const mockChat = jest.fn();
const mockList = jest.fn();
jest.mock('ollama', () => ({
  Ollama: jest.fn().mockImplementation(() => ({
    chat: mockChat,
    list: mockList,
  })),
}));

function createProvider(
  configOverrides?: Partial<ProviderConfig>,
): OllamaProvider {
  const config: ProviderConfig = {
    type: 'ollama',
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3',
    ...configOverrides,
  };
  return new OllamaProvider(config);
}

const sampleTool: Tool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the weather',
    parameters: { type: 'object', properties: { city: { type: 'string' } } },
  },
};

describe('OllamaProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a basic user message and returns parsed response', async () => {
    const provider = createProvider();
    mockChat.mockResolvedValueOnce({
      message: { role: 'assistant', content: 'Hello there!' },
      prompt_eval_count: 10,
      eval_count: 5,
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

  it('passes system messages as-is to the SDK in the messages array', async () => {
    const provider = createProvider();
    mockChat.mockResolvedValueOnce({
      message: { role: 'assistant', content: 'OK' },
    });

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hi' },
    ];
    await provider.sendMessage(messages);

    const chatCall = mockChat.mock.calls[0][0];
    expect(chatCall.messages).toHaveLength(2);
    expect(chatCall.messages[0]).toEqual(
      expect.objectContaining({ role: 'system', content: 'You are helpful.' }),
    );
    expect(chatCall.messages[1]).toEqual(
      expect.objectContaining({ role: 'user', content: 'Hi' }),
    );
  });

  it('parses tool_calls with object arguments serialized to JSON string and assigns id', async () => {
    const provider = createProvider();
    mockChat.mockResolvedValueOnce({
      message: {
        role: 'assistant',
        content: '',
        tool_calls: [
          {
            function: {
              name: 'get_weather',
              arguments: { city: 'Seattle' },
            },
          },
        ],
      },
    });

    const result = await provider.sendMessage(
      [{ role: 'user', content: 'Weather in Seattle?' }],
      [sampleTool],
    );

    expect(result.choices[0].message.tool_calls).toHaveLength(1);
    expect(result.choices[0].message.tool_calls![0]).toEqual({
      id: 'call_0',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: '{"city":"Seattle"}',
      },
    });
  });

  it('handles tool messages round-trip with tool_call_id and parses follow-up response', async () => {
    const provider = createProvider();
    mockChat.mockResolvedValueOnce({
      message: { role: 'assistant', content: 'It is sunny in NYC.' },
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
    const result = await provider.sendMessage(messages);

    const chatCall = mockChat.mock.calls[0][0];

    // Tool message with tool_call_id is passed to the SDK
    const toolMsg = chatCall.messages.find((m: any) => m.role === 'tool');
    expect(toolMsg).toBeDefined();
    expect(toolMsg.tool_call_id).toBe('call_1');
    expect(toolMsg.content).toBe('Sunny, 75°F');

    // Assistant message with tool_calls is included in history
    const assistantMsg = chatCall.messages.find(
      (m: any) => m.role === 'assistant',
    );
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg.tool_calls).toBeDefined();
    expect(assistantMsg.tool_calls[0].function.name).toBe('get_weather');
    // Arguments are deserialized back to object for Ollama SDK
    expect(assistantMsg.tool_calls[0].function.arguments).toEqual({
      city: 'NYC',
    });

    // Follow-up response is parsed correctly
    expect(result.choices[0].message.role).toBe('assistant');
    expect(result.choices[0].message.content).toBe('It is sunny in NYC.');
  });

  it('returns error on failed testConnection', async () => {
    const provider = createProvider();
    mockList.mockRejectedValueOnce(new Error('Connection refused'));

    const result = await provider.testConnection();

    expect(result.connected).toBe(false);
    expect(result.error).toBe('Connection refused');
  });
});
