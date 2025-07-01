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

import {
  ProviderFactory,
  getProviderConfig,
  getProviderInfo,
} from './provider-factory';
import { OpenAIProvider } from './openai-provider';
import { ClaudeProvider } from './claude-provider';
import { GeminiProvider } from './gemini-provider';
import { OllamaProvider } from './ollama-provider';
import { RootConfigService } from '@backstage/backend-plugin-api';
import { ProviderConfig } from './base-provider';

describe('ProviderFactory', () => {
  describe('createProvider', () => {
    it('should create OpenAI provider', () => {
      const config: ProviderConfig = {
        type: 'openai',
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4',
      };

      const provider = ProviderFactory.createProvider(config);

      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should create Claude provider', () => {
      const config: ProviderConfig = {
        type: 'claude',
        apiKey: 'test-key',
        baseUrl: 'https://api.anthropic.com/v1',
        model: 'claude-3-sonnet-20240229',
      };

      const provider = ProviderFactory.createProvider(config);

      expect(provider).toBeInstanceOf(ClaudeProvider);
    });

    it('should create Gemini provider', () => {
      const config: ProviderConfig = {
        type: 'gemini',
        apiKey: 'test-key',
        baseUrl: 'https://generativelanguage.googleapis.com',
        model: 'gemini-pro',
      };

      const provider = ProviderFactory.createProvider(config);

      expect(provider).toBeInstanceOf(GeminiProvider);
    });

    it('should create Ollama provider', () => {
      const config: ProviderConfig = {
        type: 'ollama',
        baseUrl: 'http://localhost:11434',
        model: 'llama2',
      };

      const provider = ProviderFactory.createProvider(config);

      expect(provider).toBeInstanceOf(OllamaProvider);
    });

    it('should create OpenAI provider for custom type', () => {
      const config: ProviderConfig = {
        type: 'custom',
        apiKey: 'test-key',
        baseUrl: 'https://custom-api.com/v1',
        model: 'custom-model',
      };

      const provider = ProviderFactory.createProvider(config);

      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should throw error for unsupported provider type', () => {
      const config: ProviderConfig = {
        type: 'unsupported',
        apiKey: 'test-key',
        baseUrl: 'https://example.com',
        model: 'test-model',
      };

      expect(() => ProviderFactory.createProvider(config)).toThrow(
        'Unsupported provider: unsupported',
      );
    });
  });
});

describe('getProviderConfig', () => {
  let mockConfig: jest.Mocked<RootConfigService>;

  beforeEach(() => {
    mockConfig = {
      getOptionalConfigArray: jest.fn(),
    } as any;
  });

  it('should throw error when no providers are configured', () => {
    mockConfig.getOptionalConfigArray.mockReturnValue([]);

    expect(() => getProviderConfig(mockConfig)).toThrow(
      'No LLM providers configured in mcpChat.providers. Please add at least one provider.',
    );
  });

  it('should configure OpenAI provider correctly', () => {
    const mockProviderConfig = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    mockProviderConfig.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'openai';
      if (key === 'model') return 'gpt-4';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return 'sk-test-key';
      if (key === 'baseUrl') return undefined;
      return undefined;
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig as any,
    ]);

    const result = getProviderConfig(mockConfig);

    expect(result).toEqual({
      type: 'openai',
      apiKey: 'sk-test-key',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4',
    });
  });

  it('should configure Claude provider correctly', () => {
    const mockProviderConfig = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    mockProviderConfig.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'claude';
      if (key === 'model') return 'claude-3-sonnet-20240229';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return 'claude-test-key';
      return undefined;
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig as any,
    ]);

    const result = getProviderConfig(mockConfig);

    expect(result).toEqual({
      type: 'claude',
      apiKey: 'claude-test-key',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-sonnet-20240229',
    });
  });

  it('should configure Gemini provider correctly', () => {
    const mockProviderConfig = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    mockProviderConfig.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'gemini';
      if (key === 'model') return 'gemini-pro';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return 'gemini-test-key';
      return undefined;
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig as any,
    ]);

    const result = getProviderConfig(mockConfig);

    expect(result).toEqual({
      type: 'gemini',
      apiKey: 'gemini-test-key',
      baseUrl: 'https://generativelanguage.googleapis.com',
      model: 'gemini-pro',
    });
  });

  it('should configure Ollama provider correctly with default baseUrl', () => {
    const mockProviderConfig = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    mockProviderConfig.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'ollama';
      if (key === 'model') return 'llama2';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return undefined;
      if (key === 'baseUrl') return undefined;
      return undefined;
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig as any,
    ]);

    const result = getProviderConfig(mockConfig);

    expect(result).toEqual({
      type: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'llama2',
    });
  });

  it('should configure Ollama provider with custom baseUrl', () => {
    const mockProviderConfig = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    mockProviderConfig.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'ollama';
      if (key === 'model') return 'llama2';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return undefined;
      if (key === 'baseUrl') return 'http://custom-ollama:11434';
      return undefined;
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig as any,
    ]);

    const result = getProviderConfig(mockConfig);

    expect(result).toEqual({
      type: 'ollama',
      baseUrl: 'http://custom-ollama:11434',
      model: 'llama2',
    });
  });

  it('should configure custom provider correctly', () => {
    const mockProviderConfig = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    mockProviderConfig.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'custom';
      if (key === 'model') return 'custom-model';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return 'custom-api-key';
      if (key === 'baseUrl') return 'https://custom-api.com/v1';
      return undefined;
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig as any,
    ]);

    const result = getProviderConfig(mockConfig);

    expect(result).toEqual({
      type: 'custom',
      apiKey: 'custom-api-key',
      baseUrl: 'https://custom-api.com/v1',
      model: 'custom-model',
    });
  });

  it('should throw error for unknown provider', () => {
    const mockProviderConfig = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    mockProviderConfig.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'unknown';
      if (key === 'model') return 'test-model';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig as any,
    ]);

    expect(() => getProviderConfig(mockConfig)).toThrow(
      'Unknown provider: unknown',
    );
  });

  it('should throw error when API key is missing for non-Ollama providers', () => {
    const mockProviderConfig = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    mockProviderConfig.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'openai';
      if (key === 'model') return 'gpt-4';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return undefined; // No API key
      return undefined;
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig as any,
    ]);

    expect(() => getProviderConfig(mockConfig)).toThrow(
      'API key is required for provider: openai',
    );
  });

  it('should throw error when baseUrl is missing for custom provider', () => {
    const mockProviderConfig = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    mockProviderConfig.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'custom';
      if (key === 'model') return 'custom-model';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return 'api-key';
      if (key === 'baseUrl') return undefined; // No base URL
      return undefined;
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig as any,
    ]);

    expect(() => getProviderConfig(mockConfig)).toThrow(
      'Base URL is required for provider: custom',
    );
  });

  it('should use first provider when multiple are configured', () => {
    const mockProviderConfig1 = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    const mockProviderConfig2 = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    // First provider (should be used)
    mockProviderConfig1.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'openai';
      if (key === 'model') return 'gpt-4';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig1.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return 'first-key';
      return undefined;
    });

    // Second provider (should be ignored)
    mockProviderConfig2.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'claude';
      if (key === 'model') return 'claude-3-sonnet-20240229';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig2.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return 'second-key';
      return undefined;
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig1 as any,
      mockProviderConfig2 as any,
    ]);

    const result = getProviderConfig(mockConfig);

    expect(result).toEqual({
      type: 'openai',
      apiKey: 'first-key',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4',
    });
  });
});

describe('getProviderInfo', () => {
  let mockConfig: jest.Mocked<RootConfigService>;

  beforeEach(() => {
    mockConfig = {
      getOptionalConfigArray: jest.fn(),
    } as any;
  });

  it('should return provider info', () => {
    const mockProviderConfig = {
      getString: jest.fn(),
      getOptionalString: jest.fn(),
    };

    mockProviderConfig.getString.mockImplementation((key: string) => {
      if (key === 'id') return 'openai';
      if (key === 'model') return 'gpt-4';
      throw new Error(`Unexpected key: ${key}`);
    });

    mockProviderConfig.getOptionalString.mockImplementation((key: string) => {
      if (key === 'token') return 'test-key';
      return undefined;
    });

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig as any,
    ]);

    const result = getProviderInfo(mockConfig);

    expect(result).toEqual({
      provider: 'openai',
      model: 'gpt-4',
      baseURL: 'https://api.openai.com/v1',
    });
  });

  it('should propagate errors from getProviderConfig', () => {
    mockConfig.getOptionalConfigArray.mockReturnValue([]);

    expect(() => getProviderInfo(mockConfig)).toThrow(
      'No LLM providers configured in mcpChat.providers. Please add at least one provider.',
    );
  });
});
