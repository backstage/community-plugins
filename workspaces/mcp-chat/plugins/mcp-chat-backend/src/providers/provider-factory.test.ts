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
import {
  ProviderFactory,
  getProviderConfig,
  getProviderInfo,
} from './provider-factory';
import { OpenAIProvider } from './openai-provider';
import { AzureOpenAIProvider } from './azure-openai-provider';
import { ClaudeProvider } from './claude-provider';
import { GeminiProvider } from './gemini-provider';
import { OllamaProvider } from './ollama-provider';
import { LiteLLMProvider } from './litellm-provider';
import { ProviderConfig } from '../types';

describe('ProviderFactory', () => {
  describe('createProvider', () => {
    it('should create correct provider instances for supported types', () => {
      const testCases = [
        { type: 'openai', expectedClass: OpenAIProvider },
        { type: 'azure-openai', expectedClass: AzureOpenAIProvider },
        { type: 'claude', expectedClass: ClaudeProvider },
        { type: 'gemini', expectedClass: GeminiProvider },
        { type: 'ollama', expectedClass: OllamaProvider },
        { type: 'litellm', expectedClass: LiteLLMProvider },
      ];

      testCases.forEach(({ type, expectedClass }) => {
        const config: ProviderConfig = {
          type,
          apiKey: 'test-key',
          baseUrl: 'https://example.com',
          model: 'test-model',
          ...(type === 'azure-openai'
            ? { deploymentName: 'test-deployment' }
            : {}),
          logger: mockServices.logger.mock(),
        };

        const provider = ProviderFactory.createProvider(config);
        expect(provider).toBeInstanceOf(expectedClass);
      });
    });

    it('should throw error for unsupported provider type', () => {
      const config: ProviderConfig = {
        type: 'unsupported',
        apiKey: 'test-key',
        baseUrl: 'https://example.com',
        model: 'test-model',
        logger: mockServices.logger.mock(),
      };

      expect(() => ProviderFactory.createProvider(config)).toThrow(
        'Unsupported provider: unsupported',
      );
    });
  });
});

describe('getProviderConfig', () => {
  let mockConfig: ReturnType<typeof mockServices.rootConfig.mock>;

  beforeEach(() => {
    mockConfig = mockServices.rootConfig.mock();
  });

  it('should throw error when no providers are configured', () => {
    mockConfig.getOptionalConfigArray.mockReturnValue([]);

    expect(() => getProviderConfig(mockConfig)).toThrow();
  });

  it('should throw error for unsupported provider id', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'unsupported';
        if (key === 'model') return 'test-model';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'baseUrl') return undefined;
        return 'test-key';
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    expect(() => getProviderConfig(mockConfig)).toThrow(
      'Unsupported provider id: unsupported. Allowed values are: openai, openai-responses, azure-openai, claude, gemini, ollama, litellm',
    );
  });

  it('should configure providers with correct default base URLs', () => {
    const testCases = [
      { id: 'openai', expectedBaseUrl: 'https://api.openai.com/v1' },
      { id: 'claude', expectedBaseUrl: 'https://api.anthropic.com/v1' },
      {
        id: 'gemini',
        expectedBaseUrl: 'https://generativelanguage.googleapis.com',
      },
    ];

    testCases.forEach(({ id, expectedBaseUrl }) => {
      const mockProviderConfig = {
        getString: jest.fn().mockImplementation((key: string) => {
          if (key === 'id') return id;
          if (key === 'model') return 'test-model';
          throw new Error(`Unexpected key: ${key}`);
        }),
        getOptionalString: jest.fn().mockImplementation((key: string) => {
          if (key === 'baseUrl') return undefined;
          return 'test-key';
        }),
        getOptionalNumber: jest.fn().mockReturnValue(undefined),
      } as any;

      mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

      const result = getProviderConfig(mockConfig);
      expect(result.baseUrl).toBe(expectedBaseUrl);
      expect(result.type).toBe(id);
      expect(result.apiKey).toBe('test-key');
      expect(result.model).toBe('test-model');
    });
  });

  it('should configure OpenAI provider with default and custom base URLs', () => {
    const testCases = [
      {
        customBaseUrl: undefined,
        expectedBaseUrl: 'https://api.openai.com/v1',
      },
      {
        customBaseUrl: 'https://custom-openai.com/v1',
        expectedBaseUrl: 'https://custom-openai.com/v1',
      },
    ];

    testCases.forEach(({ customBaseUrl, expectedBaseUrl }) => {
      const mockProviderConfig = {
        getString: jest.fn().mockImplementation((key: string) => {
          if (key === 'id') return 'openai';
          if (key === 'model') return 'test-model';
          throw new Error(`Unexpected key: ${key}`);
        }),
        getOptionalString: jest.fn().mockImplementation((key: string) => {
          if (key === 'token') return 'test-token';
          if (key === 'baseUrl') return customBaseUrl;
          return undefined;
        }),
        getOptionalNumber: jest.fn().mockReturnValue(undefined),
      } as any;

      mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

      const result = getProviderConfig(mockConfig);
      expect(result.baseUrl).toBe(expectedBaseUrl);
      expect(result.type).toBe('openai');
      expect(result.apiKey).toBe('test-token');
    });
  });

  it('should configure Ollama provider with default and custom base URLs', () => {
    const testCases = [
      { customBaseUrl: undefined, expectedBaseUrl: 'http://localhost:11434' },
      {
        customBaseUrl: 'http://custom:11434',
        expectedBaseUrl: 'http://custom:11434',
      },
    ];

    testCases.forEach(({ customBaseUrl, expectedBaseUrl }) => {
      const mockProviderConfig = {
        getString: jest.fn().mockImplementation((key: string) => {
          if (key === 'id') return 'ollama';
          if (key === 'model') return 'llama2';
          throw new Error(`Unexpected key: ${key}`);
        }),
        getOptionalString: jest.fn().mockImplementation((key: string) => {
          if (key === 'token') return undefined;
          if (key === 'baseUrl') return customBaseUrl;
          return undefined;
        }),
        getOptionalNumber: jest.fn().mockReturnValue(undefined),
      } as any;

      mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

      const result = getProviderConfig(mockConfig);
      expect(result.baseUrl).toBe(expectedBaseUrl);
      expect(result.type).toBe('ollama');
      expect(result.apiKey).toBeUndefined();
    });
  });

  it('should configure LiteLLM provider with default and custom base URLs', () => {
    const testCases = [
      { customBaseUrl: undefined, expectedBaseUrl: 'http://localhost:4000' },
      {
        customBaseUrl: 'http://custom:4000',
        expectedBaseUrl: 'http://custom:4000',
      },
    ];

    testCases.forEach(({ customBaseUrl, expectedBaseUrl }) => {
      const mockProviderConfig = {
        getString: jest.fn().mockImplementation((key: string) => {
          if (key === 'id') return 'litellm';
          if (key === 'model') return 'gpt-4o-mini';
          throw new Error(`Unexpected key: ${key}`);
        }),
        getOptionalString: jest.fn().mockImplementation((key: string) => {
          if (key === 'token') return 'test-key';
          if (key === 'baseUrl') return customBaseUrl;
          return undefined;
        }),
        getOptionalNumber: jest.fn().mockReturnValue(undefined),
      } as any;

      mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

      const result = getProviderConfig(mockConfig);
      expect(result.baseUrl).toBe(expectedBaseUrl);
      expect(result.type).toBe('litellm');
      expect(result.apiKey).toBe('test-key');
    });
  });

  it('should allow LiteLLM provider without API key', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'litellm';
        if (key === 'model') return 'gpt-4o-mini';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'token') return undefined;
        if (key === 'baseUrl') return 'http://localhost:4000';
        return undefined;
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    const result = getProviderConfig(mockConfig);
    expect(result.baseUrl).toBe('http://localhost:4000');
    expect(result.type).toBe('litellm');
    expect(result.apiKey).toBeUndefined();
  });

  it('should configure azure-openai provider with deploymentName', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'azure-openai';
        if (key === 'model') return 'gpt-5.1';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'token') return 'azure-key';
        if (key === 'baseUrl')
          return 'https://myresource.openai.azure.com/openai/v1';
        if (key === 'deploymentName') return 'my-gpt-5.1-deployment';
        return undefined;
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    const result = getProviderConfig(mockConfig);

    expect(result).toEqual({
      type: 'azure-openai',
      apiKey: 'azure-key',
      baseUrl: 'https://myresource.openai.azure.com/openai/v1',
      model: 'gpt-5.1',
      deploymentName: 'my-gpt-5.1-deployment',
      maxTokens: undefined,
      temperature: undefined,
    });
  });

  it('should throw error when deploymentName is missing for azure-openai', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'azure-openai';
        if (key === 'model') return 'gpt-5.1';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'token') return 'azure-key';
        if (key === 'baseUrl')
          return 'https://myresource.openai.azure.com/openai/v1';
        if (key === 'deploymentName') return undefined;
        return undefined;
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    expect(() => getProviderConfig(mockConfig)).toThrow(
      'Deployment name is required for the azure-openai provider.',
    );
  });

  it('should throw error when API key is missing for non-Ollama/LiteLLM providers', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'openai';
        if (key === 'model') return 'gpt-4';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockReturnValue(undefined),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    expect(() => getProviderConfig(mockConfig)).toThrow(
      'API key is required for provider: openai',
    );
  });

  it('should use first provider when multiple are configured', () => {
    const mockProviderConfig1 = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'openai';
        if (key === 'model') return 'gpt-4';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'baseUrl') return undefined;
        return 'first-key';
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    const mockProviderConfig2 = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'claude';
        if (key === 'model') return 'claude-3-sonnet-20240229';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'baseUrl') return undefined;
        return 'second-key';
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([
      mockProviderConfig1,
      mockProviderConfig2,
    ]);

    const result = getProviderConfig(mockConfig);

    expect(result).toEqual({
      type: 'openai',
      apiKey: 'first-key',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4',
    });
  });

  it('should throw error when model is missing', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'openai';
        if (key === 'model') return '';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'baseUrl') return undefined;
        return 'test-key';
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    expect(() => getProviderConfig(mockConfig)).toThrow(
      'Model is required for provider: openai',
    );
  });

  it('should read maxTokens and temperature from config for OpenAI', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'openai';
        if (key === 'model') return 'gpt-4';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'baseUrl') return undefined;
        if (key === 'token') return 'test-key';
        return undefined;
      }),
      getOptionalNumber: jest.fn().mockImplementation((key: string) => {
        if (key === 'maxTokens') return 2000;
        if (key === 'temperature') return 0.5;
        return undefined;
      }),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    const result = getProviderConfig(mockConfig);

    expect(result.maxTokens).toBe(2000);
    expect(result.temperature).toBe(0.5);
  });

  it('should handle undefined maxTokens and temperature', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'openai';
        if (key === 'model') return 'gpt-4';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'baseUrl') return undefined;
        if (key === 'token') return 'test-key';
        return undefined;
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    const result = getProviderConfig(mockConfig);

    expect(result.maxTokens).toBeUndefined();
    expect(result.temperature).toBeUndefined();
  });

  it('should pass maxTokens and temperature to all provider types', () => {
    const providerTypes = ['openai', 'claude', 'gemini', 'ollama', 'litellm'];

    providerTypes.forEach(providerId => {
      const mockProviderConfig = {
        getString: jest.fn().mockImplementation((key: string) => {
          if (key === 'id') return providerId;
          if (key === 'model') return 'test-model';
          throw new Error(`Unexpected key: ${key}`);
        }),
        getOptionalString: jest.fn().mockImplementation((key: string) => {
          if (key === 'token')
            return providerId === 'ollama' ? undefined : 'test-key';
          if (key === 'baseUrl') return undefined;
          return undefined;
        }),
        getOptionalNumber: jest.fn().mockImplementation((key: string) => {
          if (key === 'maxTokens') return 1500;
          if (key === 'temperature') return 0.3;
          return undefined;
        }),
      } as any;

      mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

      const result = getProviderConfig(mockConfig);

      expect(result.maxTokens).toBe(1500);
      expect(result.temperature).toBe(0.3);
      expect(result.type).toBe(providerId);
    });
  });

  it.each([0, -1, -100, 1.5, 3.14])(
    'should throw on invalid maxTokens: %s',
    invalidValue => {
      const mockProviderConfig = {
        getString: jest.fn().mockImplementation((key: string) => {
          if (key === 'id') return 'openai';
          if (key === 'model') return 'gpt-4';
          throw new Error(`Unexpected key: ${key}`);
        }),
        getOptionalString: jest.fn().mockReturnValue('test-key'),
        getOptionalNumber: jest.fn().mockImplementation((key: string) => {
          if (key === 'maxTokens') return invalidValue;
          return undefined;
        }),
      } as any;
      mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

      expect(() => getProviderConfig(mockConfig)).toThrow(
        /Invalid maxTokens value/,
      );
    },
  );

  it.each([-1, -0.1, 2.1, 3, 100])(
    'should throw on invalid temperature: %s',
    invalidValue => {
      const mockProviderConfig = {
        getString: jest.fn().mockImplementation((key: string) => {
          if (key === 'id') return 'openai';
          if (key === 'model') return 'gpt-4';
          throw new Error(`Unexpected key: ${key}`);
        }),
        getOptionalString: jest.fn().mockReturnValue('test-key'),
        getOptionalNumber: jest.fn().mockImplementation((key: string) => {
          if (key === 'temperature') return invalidValue;
          return undefined;
        }),
      } as any;
      mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

      expect(() => getProviderConfig(mockConfig)).toThrow(
        /Invalid temperature value/,
      );
    },
  );

  it.each([0, 0.5, 1, 1.5, 2])(
    'should accept valid temperature: %s',
    validValue => {
      const mockProviderConfig = {
        getString: jest.fn().mockImplementation((key: string) => {
          if (key === 'id') return 'openai';
          if (key === 'model') return 'gpt-4';
          throw new Error(`Unexpected key: ${key}`);
        }),
        getOptionalString: jest.fn().mockReturnValue('test-key'),
        getOptionalNumber: jest.fn().mockImplementation((key: string) => {
          if (key === 'temperature') return validValue;
          return undefined;
        }),
      } as any;
      mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

      const result = getProviderConfig(mockConfig);
      expect(result.temperature).toBe(validValue);
    },
  );
});

describe('getProviderInfo', () => {
  let mockConfig: ReturnType<typeof mockServices.rootConfig.mock>;

  beforeEach(() => {
    mockConfig = mockServices.rootConfig.mock();
  });

  it('should return provider info from config', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'openai';
        if (key === 'model') return 'gpt-4';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'baseUrl') return 'https://api.openai.com/v1';
        return 'test-key';
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    const result = getProviderInfo(mockConfig);

    expect(result).toEqual({
      provider: 'openai',
      model: 'gpt-4',
      baseURL: 'https://api.openai.com/v1',
    });
  });

  it('should propagate errors from getProviderConfig', () => {
    mockConfig.getOptionalConfigArray.mockReturnValue([]);

    expect(() => getProviderInfo(mockConfig)).toThrow();
  });

  it('should include deploymentName for azure-openai provider', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'azure-openai';
        if (key === 'model') return 'gpt-4';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'baseUrl')
          return 'https://my-resource.openai.azure.com/openai/v1';
        if (key === 'deploymentName') return 'my-gpt4-deployment';
        return 'test-key';
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    const result = getProviderInfo(mockConfig);

    expect(result).toEqual({
      provider: 'azure-openai',
      model: 'gpt-4',
      baseURL: 'https://my-resource.openai.azure.com/openai/v1',
      deploymentName: 'my-gpt4-deployment',
    });
  });

  it('should not include deploymentName when not set', () => {
    const mockProviderConfig = {
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'id') return 'openai';
        if (key === 'model') return 'gpt-4';
        throw new Error(`Unexpected key: ${key}`);
      }),
      getOptionalString: jest.fn().mockImplementation((key: string) => {
        if (key === 'baseUrl') return 'https://api.openai.com/v1';
        if (key === 'deploymentName') return undefined;
        return 'test-key';
      }),
      getOptionalNumber: jest.fn().mockReturnValue(undefined),
    } as any;

    mockConfig.getOptionalConfigArray.mockReturnValue([mockProviderConfig]);

    const result = getProviderInfo(mockConfig);

    expect(result).not.toHaveProperty('deploymentName');
  });
});
