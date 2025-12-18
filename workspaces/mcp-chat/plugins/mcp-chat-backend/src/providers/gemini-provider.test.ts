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

import { GeminiProvider } from './gemini-provider';
import { ProviderConfig, ChatMessage, Tool } from '../types';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerateContentResult,
} from '@google/generative-ai';

// Mock the Google Generative AI library
jest.mock('@google/generative-ai');

const MockGoogleGenerativeAI = GoogleGenerativeAI as jest.MockedClass<
  typeof GoogleGenerativeAI
>;

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockGenAI: jest.Mocked<GoogleGenerativeAI>;
  let mockModel: jest.Mocked<GenerativeModel>;

  const config: ProviderConfig = {
    type: 'gemini',
    apiKey: 'test-api-key',
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-pro',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockModel = {
      generateContent: jest.fn(),
      safetySettings: [],
    } as any;

    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    } as any;

    MockGoogleGenerativeAI.mockImplementation(() => mockGenAI);

    provider = new GeminiProvider(config);
  });

  describe('constructor', () => {
    it('should initialize with valid config', () => {
      expect(MockGoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
        safetySettings: expect.arrayContaining([
          expect.objectContaining({
            category: expect.any(String),
            threshold: expect.any(String),
          }),
        ]),
      });
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

      const mockResult: GenerateContentResult = {
        response: {
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
        },
      } as any;

      mockModel.generateContent.mockResolvedValue(mockResult);

      const result = await provider.sendMessage(messages);

      expect(mockModel.generateContent).toHaveBeenCalledWith({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello, how are you?' }],
          },
        ],
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

      const mockResult: GenerateContentResult = {
        response: {
          candidates: [
            {
              content: {
                parts: [{ text: 'Hello! How can I help you?' }],
              },
            },
          ],
        },
      } as any;

      mockModel.generateContent.mockResolvedValue(mockResult);

      await provider.sendMessage(messages);

      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
        safetySettings: [],
        systemInstruction: 'You are a helpful assistant.',
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

      const mockResult: GenerateContentResult = {
        response: {
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
        },
      } as any;

      mockModel.generateContent.mockResolvedValue(mockResult);

      const result = await provider.sendMessage(messages, tools);

      expect(mockGenAI.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
        safetySettings: [],
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
          content: '{"temperature": "72°F", "condition": "sunny"}',
          tool_call_id: 'call_123',
        },
      ];

      const mockResult: GenerateContentResult = {
        response: {
          candidates: [
            {
              content: {
                parts: [{ text: 'The weather in New York is 72°F and sunny.' }],
              },
            },
          ],
        },
      } as any;

      mockModel.generateContent.mockResolvedValue(mockResult);

      await provider.sendMessage(messages);

      expect(mockModel.generateContent).toHaveBeenCalledWith({
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
                  response: { temperature: '72°F', condition: 'sunny' },
                },
              },
            ],
          },
        ],
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

      const mockResult: GenerateContentResult = {
        response: {
          candidates: [
            {
              content: {
                parts: [{ text: 'I understand.' }],
              },
            },
          ],
        },
      } as any;

      mockModel.generateContent.mockResolvedValue(mockResult);

      await provider.sendMessage(messages);

      expect(mockModel.generateContent).toHaveBeenCalledWith({
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
      });
    });

    it('should handle API errors', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const error = new Error('API Error');
      mockModel.generateContent.mockRejectedValue(error);

      await expect(provider.sendMessage(messages)).rejects.toThrow();
    });

    it('should handle empty response', async () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];

      const mockResult: GenerateContentResult = {
        response: {
          candidates: [],
        },
      } as any;

      mockModel.generateContent.mockResolvedValue(mockResult);

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
      const mockResult: GenerateContentResult = {
        response: {
          candidates: [
            {
              content: {
                parts: [{ text: 'Hello' }],
              },
            },
          ],
        },
      } as any;

      mockModel.generateContent.mockResolvedValue(mockResult);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: true,
        models: ['gemini-pro'],
      });

      expect(mockModel.generateContent).toHaveBeenCalledWith({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        generationConfig: { maxOutputTokens: 1 },
      });
    });

    it('should return not connected when API throws error', async () => {
      const error = new Error('API connection failed');
      mockModel.generateContent.mockRejectedValue(error);

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'API connection failed',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockModel.generateContent.mockRejectedValue('String error');

      const result = await provider.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'Failed to connect to Gemini API',
      });
    });

    it('should return not connected when no response', async () => {
      const mockResult: GenerateContentResult = {
        response: null as any,
      };

      mockModel.generateContent.mockResolvedValue(mockResult);

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

      expect(result).toEqual({
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
      });
    });
  });

  describe('parseResponse', () => {
    it('should parse response with only text', () => {
      const mockResult: GenerateContentResult = {
        response: {
          candidates: [
            {
              content: {
                parts: [{ text: 'Hello world' }],
              },
            },
          ],
        },
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
      const mockResult: GenerateContentResult = {
        response: {
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
        },
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
      const mockResult: GenerateContentResult = {
        response: {
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
        },
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
