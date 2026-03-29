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

import { GoogleGenAI } from '@google/genai';
import { GeminiProvider } from './gemini-provider';
import { ChatMessage, ProviderConfig, Tool } from '../types';

jest.mock('@google/genai');

const MockGoogleGenAI = GoogleGenAI as jest.MockedClass<typeof GoogleGenAI>;

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockGenerateContent: jest.Mock;

  const config: ProviderConfig = {
    type: 'gemini',
    apiKey: 'test-api-key',
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-pro',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGenerateContent = jest.fn();
    MockGoogleGenAI.mockImplementation(
      () =>
        ({
          models: {
            generateContent: mockGenerateContent,
          },
        } as any),
    );

    provider = new GeminiProvider(config);
  });

  describe('constructor', () => {
    it('should initialize with valid config', () => {
      expect(MockGoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
    });

    it('should throw error when API key is missing', () => {
      const invalidConfig = { ...config, apiKey: undefined };

      expect(() => new GeminiProvider(invalidConfig)).toThrow(
        'Gemini API key is required',
      );
    });
  });

  describe('sendMessage', () => {
    it('should send simple message without tools', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello, how are you?' },
      ];

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: 'I am doing well, thank you!' }],
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 15,
          totalTokenCount: 25,
        },
      });

      const result = await provider.sendMessage(messages);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-pro',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello, how are you?' }],
          },
        ],
        config: expect.objectContaining({
          temperature: 0.7,
          maxOutputTokens: 8192,
          safetySettings: expect.any(Array),
        }),
      });

      expect(result).toEqual({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'I am doing well, thank you!',
              tool_calls: undefined,
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      });
    });

    it('should handle system message correctly', async () => {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' },
      ];

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: 'Hello! How can I help you?' }],
            },
          },
        ],
      });

      await provider.sendMessage(messages);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-pro',
        contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }],
        config: expect.objectContaining({
          temperature: 0.7,
          maxOutputTokens: 8192,
          safetySettings: expect.any(Array),
          systemInstruction: 'You are a helpful assistant.',
        }),
      });
    });

    it('should handle tools correctly', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'What is the weather like?' },
      ];

      const tools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get current weather information',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city and state',
                },
              },
              required: ['location'],
            },
          },
        },
      ];

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                { text: 'I can help you get weather information.' },
                {
                  functionCall: {
                    name: 'get_weather',
                    args: { location: 'New York' },
                  },
                },
              ],
            },
          },
        ],
      });

      const result = await provider.sendMessage(messages, tools);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-pro',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'What is the weather like?' }],
          },
        ],
        config: expect.objectContaining({
          temperature: 0.7,
          maxOutputTokens: 8192,
          safetySettings: expect.any(Array),
          tools: [
            {
              functionDeclarations: [
                {
                  name: 'get_weather',
                  description: 'Get current weather information',
                  parameters: {
                    type: 'object',
                    properties: {
                      location: {
                        type: 'string',
                        description: 'The city and state',
                      },
                    },
                    required: ['location'],
                  },
                },
              ],
            },
          ],
        }),
      });

      expect(result.choices[0].message.tool_calls).toHaveLength(1);
      expect(result.choices[0].message.tool_calls![0]).toMatchObject({
        type: 'function',
        function: {
          name: 'get_weather',
          arguments: '{"location":"New York"}',
        },
      });
    });

    it('should handle tool response messages', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'What is the weather?' },
        {
          role: 'assistant',
          content: 'Let me check the weather for you.',
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
        {
          role: 'tool',
          content: '{"temperature":"72F","condition":"sunny"}',
          tool_call_id: 'call_123',
        },
      ];

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: 'The weather in New York is 72F and sunny.' }],
            },
          },
        ],
      });

      await provider.sendMessage(messages);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-pro',
        contents: [
          { role: 'user', parts: [{ text: 'What is the weather?' }] },
          {
            role: 'model',
            parts: [
              { text: 'Let me check the weather for you.' },
              {
                functionCall: {
                  name: 'get_weather',
                  args: { location: 'New York' },
                },
              },
            ],
          },
          {
            role: 'function',
            parts: [
              {
                functionResponse: {
                  name: 'get_weather',
                  response: { temperature: '72F', condition: 'sunny' },
                },
              },
            ],
          },
        ],
        config: expect.objectContaining({
          temperature: 0.7,
          maxOutputTokens: 8192,
          safetySettings: expect.any(Array),
        }),
      });
    });

    it('should handle tool response with invalid JSON', async () => {
      const messages: ChatMessage[] = [
        {
          role: 'assistant',
          content: 'Let me check that for you.',
          tool_calls: [
            {
              id: 'call_123',
              type: 'function',
              function: {
                name: 'test_function',
                arguments: '{}',
              },
            },
          ],
        },
        {
          role: 'tool',
          content: 'Invalid JSON response',
          tool_call_id: 'call_123',
        },
      ];

      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: 'I understand.' }],
            },
          },
        ],
      });

      await provider.sendMessage(messages);

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-pro',
        contents: [
          {
            role: 'model',
            parts: [
              { text: 'Let me check that for you.' },
              {
                functionCall: {
                  name: 'test_function',
                  args: {},
                },
              },
            ],
          },
          {
            role: 'function',
            parts: [
              {
                functionResponse: {
                  name: 'test_function',
                  response: { result: 'Invalid JSON response' },
                },
              },
            ],
          },
        ],
        config: expect.objectContaining({
          temperature: 0.7,
          maxOutputTokens: 8192,
          safetySettings: expect.any(Array),
        }),
      });
    });

    it('should handle API errors', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(provider.sendMessage(messages)).rejects.toThrow('API Error');
    });

    it('should not leak tools or systemInstruction across calls', async () => {
      const tools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get weather',
            parameters: { type: 'object', properties: {} },
          },
        },
      ];

      mockGenerateContent.mockResolvedValue({
        candidates: [{ content: { parts: [{ text: 'response' }] } }],
      });

      await provider.sendMessage(
        [
          { role: 'system', content: 'Be helpful' },
          { role: 'user', content: 'First call' },
        ],
        tools,
      );

      const firstCallConfig = mockGenerateContent.mock.calls[0][0].config;
      expect(firstCallConfig.tools).toBeDefined();
      expect(firstCallConfig.systemInstruction).toBe('Be helpful');

      await provider.sendMessage([
        { role: 'user', content: 'Second call without tools or system' },
      ]);

      const secondCallConfig = mockGenerateContent.mock.calls[1][0].config;
      expect(secondCallConfig.tools).toBeUndefined();
      expect(secondCallConfig.systemInstruction).toBeUndefined();
    });

    it('should handle empty response', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      mockGenerateContent.mockResolvedValue({
        candidates: [],
      });

      const result = await provider.sendMessage(messages);

      expect(result).toEqual({
        choices: [
          {
            message: {
              role: 'assistant',
              content: '',
              tool_calls: undefined,
            },
          },
        ],
        usage: undefined,
      });
    });
  });

  describe('testConnection', () => {
    it('should return connected when API is working', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: 'Hello' }],
            },
          },
        ],
      });

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: true,
        models: ['gemini-pro'],
      });

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-pro',
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        config: expect.objectContaining({
          maxOutputTokens: 1,
          temperature: 0.7,
          safetySettings: expect.any(Array),
        }),
      });
    });

    it('should return not connected when API throws error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API connection failed'));

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'API connection failed',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockGenerateContent.mockRejectedValue('String error');

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'Failed to connect to Gemini API',
      });
    });

    it('should return not connected when no response', async () => {
      mockGenerateContent.mockResolvedValue(null as any);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'No response received from Gemini API',
      });
    });
  });

  describe('cleanJsonSchemaForGemini', () => {
    it('should remove unsupported schema properties', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        additionalProperties: false,
        $id: 'test-schema',
        $ref: '#/definitions/Test',
        definitions: { Test: {} },
        $defs: { Test: {} },
        properties: {
          name: {
            type: 'string',
            $schema: 'nested',
            additionalProperties: true,
          },
        },
        items: {
          type: 'string',
          additionalProperties: false,
        },
        anyOf: [
          { type: 'string', additionalProperties: true },
          { type: 'number' },
        ],
        oneOf: [{ type: 'string', $schema: 'test' }],
        allOf: [{ type: 'object', definitions: {} }],
      };

      // Access the private method through type assertion
      const cleanedSchema = (provider as any).cleanJsonSchemaForGemini(schema);

      expect(cleanedSchema).toEqual({
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
        items: {
          type: 'string',
        },
        anyOf: [{ type: 'string' }, { type: 'number' }],
        oneOf: [{ type: 'string' }],
        allOf: [{ type: 'object' }],
      });
    });

    it('should handle non-object schemas', () => {
      expect((provider as any).cleanJsonSchemaForGemini(null)).toBeNull();
      expect((provider as any).cleanJsonSchemaForGemini('string')).toBe(
        'string',
      );
      expect((provider as any).cleanJsonSchemaForGemini(123)).toBe(123);
    });

    it('should handle empty schema', () => {
      const result = (provider as any).cleanJsonSchemaForGemini({});
      expect(result).toEqual({});
    });
  });

  describe('convertToGeminiFormat', () => {
    it('should convert basic messages correctly', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];

      const result = (provider as any).convertToGeminiFormat(messages);

      expect(result).toEqual([
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi there!' }] },
      ]);
    });

    it('should handle messages with null content', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: null },
        { role: 'assistant', content: null },
      ];

      const result = (provider as any).convertToGeminiFormat(messages);

      expect(result).toEqual([
        { role: 'user', parts: [{ text: '' }] },
        { role: 'model', parts: [{ text: '' }] },
      ]);
    });

    it('should skip system messages in conversion', () => {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hello' },
      ];

      const result = (provider as any).convertToGeminiFormat(messages);

      expect(result).toEqual([{ role: 'user', parts: [{ text: 'Hello' }] }]);
    });
  });

  describe('convertToGeminiTools', () => {
    it('should convert tools to Gemini format', () => {
      const tools: Tool[] = [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get weather information',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' },
              },
              required: ['location'],
              additionalProperties: false,
            },
          },
        },
      ];

      const result = (provider as any).convertToGeminiTools(tools);

      expect(result).toEqual([
        {
          functionDeclarations: [
            {
              name: 'get_weather',
              description: 'Get weather information',
              parameters: {
                type: 'object',
                properties: {
                  location: { type: 'string' },
                },
                required: ['location'],
              },
            },
          ],
        },
      ]);
    });
  });

  describe('parseResponse', () => {
    it('should parse response with only text', () => {
      const mockResult = {
        candidates: [
          {
            content: {
              parts: [{ text: 'Hello world' }],
            },
          },
        ],
      } as any;

      const result = (provider as any).parseResponse(mockResult);

      expect(result).toEqual({
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello world',
              tool_calls: undefined,
            },
          },
        ],
        usage: undefined,
      });
    });

    it('should parse response with function calls', () => {
      const mockResult = {
        candidates: [
          {
            content: {
              parts: [
                { text: 'Let me check that for you.' },
                {
                  functionCall: {
                    name: 'get_weather',
                    args: { location: 'New York' },
                  },
                },
              ],
            },
          },
        ],
      } as any;

      const result = (provider as any).parseResponse(mockResult);

      expect(result.choices[0].message.content).toBe(
        'Let me check that for you.',
      );
      expect(result.choices[0].message.tool_calls).toHaveLength(1);
      expect(result.choices[0].message.tool_calls![0]).toMatchObject({
        type: 'function',
        function: {
          name: 'get_weather',
          arguments: '{"location":"New York"}',
        },
      });
    });

    it('should generate unique IDs for tool calls', () => {
      const mockResult = {
        candidates: [
          {
            content: {
              parts: [
                {
                  functionCall: {
                    name: 'function1',
                    args: {},
                  },
                },
                {
                  functionCall: {
                    name: 'function2',
                    args: {},
                  },
                },
              ],
            },
          },
        ],
      } as any;

      const result = (provider as any).parseResponse(mockResult);

      expect(result.choices[0].message.tool_calls).toHaveLength(2);
      expect(result.choices[0].message.tool_calls![0].id).toBeDefined();
      expect(result.choices[0].message.tool_calls![1].id).toBeDefined();
      expect(result.choices[0].message.tool_calls![0].id).not.toBe(
        result.choices[0].message.tool_calls![1].id,
      );
    });
  });

  describe('getHeaders', () => {
    it('should return empty headers', () => {
      const headers = (provider as any).getHeaders();
      expect(headers).toEqual({});
    });
  });

  describe('formatRequest', () => {
    it('should return empty object', () => {
      const request = (provider as any).formatRequest([], []);
      expect(request).toEqual({});
    });
  });
});
