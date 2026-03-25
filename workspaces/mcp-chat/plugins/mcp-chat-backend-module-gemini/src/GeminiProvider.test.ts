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

import { GeminiProvider } from './GeminiProvider';
import type {
  ChatMessage,
  Tool,
  ProviderConfig,
} from '@backstage-community/plugin-mcp-chat-common';

// Mock the @google/generative-ai SDK module
const mockGenerateContent = jest.fn();
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
      safetySettings: [],
    }),
  })),
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
  },
  HarmBlockThreshold: {
    BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
  },
}));

function createProvider(
  configOverrides?: Partial<ProviderConfig>,
): GeminiProvider {
  const config: ProviderConfig = {
    type: 'gemini',
    baseUrl: '',
    model: 'gemini-2.0-flash',
    apiKey: 'test-api-key',
    ...configOverrides,
  };
  return new GeminiProvider(config);
}

const sampleTool: Tool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the weather',
    parameters: { type: 'object', properties: { city: { type: 'string' } } },
  },
};

describe('GeminiProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a basic user message and returns parsed response', async () => {
    const provider = createProvider();
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        candidates: [
          {
            content: {
              parts: [{ text: 'Hello there!' }],
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 5,
          totalTokenCount: 15,
        },
      },
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

  it('extracts system message as systemInstruction and excludes it from contents', async () => {
    const provider = createProvider();
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const mockGetGenerativeModel =
      GoogleGenerativeAI.mock.results[0].value.getGenerativeModel;

    mockGenerateContent.mockResolvedValueOnce({
      response: {
        candidates: [
          {
            content: {
              parts: [{ text: 'OK' }],
            },
          },
        ],
      },
    });

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hi' },
    ];
    await provider.sendMessage(messages);

    // getGenerativeModel is called again with systemInstruction when a system message is present
    const lastModelCall =
      mockGetGenerativeModel.mock.calls[
        mockGetGenerativeModel.mock.calls.length - 1
      ][0];
    expect(lastModelCall.systemInstruction).toBe('You are helpful.');

    // generateContent is called with contents that exclude the system message
    const generateCall = mockGenerateContent.mock.calls[0][0];
    const contents = generateCall.contents;
    expect(contents.every((c: any) => c.role !== 'system')).toBe(true);
    expect(contents).toHaveLength(1);
    expect(contents[0]).toEqual({
      role: 'user',
      parts: [{ text: 'Hi' }],
    });
  });

  it('parses functionCall parts into ToolCall objects', async () => {
    const provider = createProvider();
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name: 'get_weather',
                    args: { city: 'Seattle' },
                  },
                },
              ],
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
    const toolCall = result.choices[0].message.tool_calls![0];
    expect(toolCall.id).toBeDefined();
    expect(toolCall.type).toBe('function');
    expect(toolCall.function.name).toBe('get_weather');
    expect(toolCall.function.arguments).toBe('{"city":"Seattle"}');
  });

  it('converts tool messages to functionResponse format with name from tool_calls history', async () => {
    const provider = createProvider();
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        candidates: [
          {
            content: {
              parts: [{ text: 'It is sunny in NYC.' }],
            },
          },
        ],
      },
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
      { role: 'tool', content: '{"temp":"75°F"}', tool_call_id: 'call_1' },
    ];
    const result = await provider.sendMessage(messages);

    const generateCall = mockGenerateContent.mock.calls[0][0];
    const contents = generateCall.contents;

    // Tool message converted to function role with functionResponse
    const functionContent = contents.find((c: any) => c.role === 'function');
    expect(functionContent).toBeDefined();
    expect(functionContent.parts[0].functionResponse.name).toBe('get_weather');
    expect(functionContent.parts[0].functionResponse.response).toEqual({
      temp: '75°F',
    });

    // Assistant tool_calls converted to model role with functionCall
    const modelContent = contents.find((c: any) => c.role === 'model');
    expect(modelContent).toBeDefined();
    expect(modelContent.parts[0].functionCall.name).toBe('get_weather');

    // Follow-up response is parsed correctly
    expect(result.choices[0].message.role).toBe('assistant');
    expect(result.choices[0].message.content).toBe('It is sunny in NYC.');
  });

  it('returns error on failed testConnection', async () => {
    const provider = createProvider();
    mockGenerateContent.mockRejectedValueOnce(new Error('API key invalid'));

    const result = await provider.testConnection();

    expect(result.connected).toBe(false);
    expect(result.error).toBe('API key invalid');
  });
});
