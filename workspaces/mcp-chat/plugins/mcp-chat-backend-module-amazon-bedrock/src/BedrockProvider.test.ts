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

import { BedrockProvider } from './BedrockProvider';
import type {
  ChatMessage,
  Tool,
  ProviderConfig,
} from '@backstage-community/plugin-mcp-chat-common';
import type { BedrockProviderOptions } from './BedrockProvider';

// Mock the AWS SDK
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-bedrock-runtime', () => {
  const actual = jest.requireActual('@aws-sdk/client-bedrock-runtime');
  return {
    ...actual,
    BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    ConverseCommand: jest.fn().mockImplementation(input => ({ input })),
  };
});

const mockCredentialProvider = jest.fn().mockResolvedValue({
  accessKeyId: 'AKIAV3RY1N53CUR3MOCK',
  secretAccessKey: 's4kv3rY1ns3CUR353cr3t4cC355k3y+mocked',
});

function createProvider(
  configOverrides?: Partial<ProviderConfig>,
  optionOverrides?: Partial<BedrockProviderOptions>,
): BedrockProvider {
  const config: ProviderConfig = {
    type: 'amazon-bedrock',
    baseUrl: '',
    model: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    ...configOverrides,
  };
  const options: BedrockProviderOptions = {
    region: 'us-east-1',
    credentialProvider: mockCredentialProvider,
    ...optionOverrides,
  };
  return new BedrockProvider(config, options);
}

function makeConverseResponse(
  content: any[],
  usage?: { inputTokens: number; outputTokens: number },
) {
  return {
    output: { message: { role: 'assistant', content } },
    usage,
  };
}

const sampleTool: Tool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the weather',
    parameters: { type: 'object', properties: { city: { type: 'string' } } },
  },
};

describe('BedrockProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a basic user message and returns parsed response', async () => {
    const provider = createProvider();
    mockSend.mockResolvedValueOnce(
      makeConverseResponse([{ text: 'Hello there!' }], {
        inputTokens: 10,
        outputTokens: 5,
      }),
    );

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

  it('extracts system prompts into the system field', async () => {
    const provider = createProvider();
    const { ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
    mockSend.mockResolvedValueOnce(makeConverseResponse([{ text: 'OK' }]));

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hi' },
    ];
    await provider.sendMessage(messages);

    const commandInput = ConverseCommand.mock.calls[0][0];
    expect(commandInput.system).toEqual([{ text: 'You are helpful.' }]);
    expect(commandInput.messages.every((m: any) => m.role !== 'system')).toBe(
      true,
    );
  });

  it('parses tool use response blocks into tool_calls', async () => {
    const provider = createProvider();
    mockSend.mockResolvedValueOnce(
      makeConverseResponse([
        {
          toolUse: {
            toolUseId: 'call_123',
            name: 'get_weather',
            input: { city: 'Seattle' },
          },
        },
      ]),
    );

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

  it('converts tool_calls round-trip and re-attaches toolConfig on follow-up', async () => {
    const provider = createProvider();
    const { ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

    // First call — model requests a tool call
    mockSend.mockResolvedValueOnce(
      makeConverseResponse([
        {
          toolUse: {
            toolUseId: 'call_1',
            name: 'get_weather',
            input: { city: 'NYC' },
          },
        },
      ]),
    );
    await provider.sendMessage(
      [{ role: 'user', content: 'Weather?' }],
      [sampleTool],
    );

    // Follow-up with tool result in history (no tools param)
    mockSend.mockResolvedValueOnce(
      makeConverseResponse([{ text: 'It is sunny in NYC.' }]),
    );

    const followUpMessages: ChatMessage[] = [
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
    await provider.sendMessage(followUpMessages);

    const commandInput = ConverseCommand.mock.calls[1][0];

    // Assistant tool_calls converted to Bedrock toolUse blocks
    const assistantMsg = commandInput.messages.find(
      (m: any) => m.role === 'assistant',
    );
    expect(assistantMsg.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          toolUse: expect.objectContaining({
            toolUseId: 'call_1',
            name: 'get_weather',
          }),
        }),
      ]),
    );

    // Tool result converted to Bedrock toolResult block
    const toolMsg = commandInput.messages.find(
      (m: any) => m.role === 'user' && m.content.some((c: any) => c.toolResult),
    );
    expect(toolMsg).toBeDefined();
    expect(toolMsg.content[0].toolResult.toolUseId).toBe('call_1');

    // toolConfig re-attached from cached tools
    expect(commandInput.toolConfig).toBeDefined();
    expect(commandInput.toolConfig.tools[0].toolSpec.name).toBe('get_weather');
  });

  it('returns error on failed testConnection', async () => {
    const provider = createProvider();
    mockSend.mockRejectedValueOnce(new Error('Access denied'));

    const result = await provider.testConnection();

    expect(result.connected).toBe(false);
    expect(result.error).toBe('Access denied');
  });
});
