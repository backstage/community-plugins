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
import { LLMProvider } from './base-provider';
import { ProviderConfig } from '../types';
import { OpenAIProvider } from './openai-provider';
import { OpenAIResponsesProvider } from './openai-responses-provider';
import { ClaudeProvider } from './claude-provider';
import { GeminiProvider } from './gemini-provider';
import { OllamaProvider } from './ollama-provider';
import { LiteLLMProvider } from './litellm-provider';
import { AzureOpenAIProvider } from './azure-openai-provider';
import {
  RootConfigService,
  LoggerService,
} from '@backstage/backend-plugin-api';

/**
 * Factory class for creating LLM provider instances.
 * Supports OpenAI, Azure OpenAI, Claude, Gemini, Ollama, LiteLLM, and OpenAI Responses API.
 *
 * @public
 */
export class ProviderFactory {
  /**
   * Creates an LLM provider instance based on the configuration.
   *
   * @param config - The provider configuration
   * @param logger - Optional logger service for debug logging
   * @returns An LLM provider instance
   */
  static createProvider(
    config: ProviderConfig,
    logger?: LoggerService,
  ): LLMProvider {
    const configWithLogger = { ...config, logger };
    switch (config.type) {
      case 'openai':
        return new OpenAIProvider(configWithLogger);

      case 'openai-responses':
        return new OpenAIResponsesProvider(configWithLogger);

      case 'azure-openai':
        return new AzureOpenAIProvider(configWithLogger);

      case 'claude':
        return new ClaudeProvider(configWithLogger);

      case 'gemini':
        return new GeminiProvider(configWithLogger);

      case 'ollama':
        return new OllamaProvider(configWithLogger);

      case 'litellm':
        return new LiteLLMProvider(configWithLogger);

      default:
        throw new Error(`Unsupported provider: ${config.type}`);
    }
  }
}

/**
 * Parses and returns the LLM provider configuration from Backstage config.
 * Reads from mcpChat.providers configuration section.
 *
 * @param config - The Backstage root config service
 * @returns The provider configuration
 * @public
 */
export function getProviderConfig(config: RootConfigService): ProviderConfig {
  const providers = config.getOptionalConfigArray('mcpChat.providers') || [];

  // For now, use the first provider. In the future, you might want to support multiple providers
  const providerConfig = providers[0];
  const providerId = providerConfig.getString('id');
  const token = providerConfig.getOptionalString('token');
  const model = providerConfig.getString('model');
  const maxTokens = providerConfig.getOptionalNumber('maxTokens');
  const temperature = providerConfig.getOptionalNumber('temperature');

  if (
    maxTokens !== undefined &&
    (maxTokens <= 0 || !Number.isInteger(maxTokens))
  ) {
    throw new Error(
      `Invalid maxTokens value: ${maxTokens}. Must be a positive integer.`,
    );
  }
  if (temperature !== undefined && (temperature < 0 || temperature > 2)) {
    throw new Error(
      `Invalid temperature value: ${temperature}. Must be between 0 and 2.`,
    );
  }

  const allowedProviders = [
    'openai',
    'openai-responses',
    'azure-openai',
    'claude',
    'gemini',
    'ollama',
    'litellm',
  ];
  if (!allowedProviders.includes(providerId)) {
    throw new Error(
      `Unsupported provider id: ${providerId}. Allowed values are: ${allowedProviders.join(
        ', ',
      )}`,
    );
  }

  const configs: Record<string, Partial<ProviderConfig>> = {
    openai: {
      type: 'openai',
      apiKey: token,
      baseUrl:
        providerConfig.getOptionalString('baseUrl') ||
        'https://api.openai.com/v1',
      model: model,
      maxTokens: maxTokens,
      temperature: temperature,
    },

    'openai-responses': {
      type: 'openai-responses',
      apiKey: token,
      baseUrl: providerConfig.getOptionalString('baseUrl') || '',
      model: model,
      maxTokens: maxTokens,
      temperature: temperature,
    },

    'azure-openai': {
      type: 'azure-openai',
      apiKey: token,
      baseUrl: providerConfig.getOptionalString('baseUrl') || '',
      model: model,
      deploymentName: providerConfig.getOptionalString('deploymentName'),
      maxTokens: maxTokens,
      temperature: temperature,
    },

    claude: {
      type: 'claude',
      apiKey: token,
      baseUrl: 'https://api.anthropic.com/v1',
      model: model,
      maxTokens: maxTokens,
      temperature: temperature,
    },

    gemini: {
      type: 'gemini',
      apiKey: token,
      baseUrl: 'https://generativelanguage.googleapis.com',
      model: model,
      maxTokens: maxTokens,
      temperature: temperature,
    },

    ollama: {
      type: 'ollama',
      // No API key needed for Ollama
      baseUrl:
        providerConfig.getOptionalString('baseUrl') || 'http://localhost:11434',
      model: model,
      maxTokens: maxTokens,
      temperature: temperature,
    },

    litellm: {
      type: 'litellm',
      apiKey: token, // Optional, depends on LiteLLM configuration
      baseUrl:
        providerConfig.getOptionalString('baseUrl') || 'http://localhost:4000',
      model: model,
      maxTokens: maxTokens,
      temperature: temperature,
    },
  };

  const configTemplate = configs[providerId];
  if (!configTemplate) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  // Validate required fields
  // Ollama, LiteLLM, and OpenAI Responses can work without API keys depending on configuration
  const noApiKeyRequired = ['ollama', 'litellm', 'openai-responses'];
  if (!noApiKeyRequired.includes(providerId) && !configTemplate.apiKey) {
    throw new Error(`API key is required for provider: ${providerId}`);
  }
  if (!configTemplate.baseUrl) {
    throw new Error(`Base URL is required for provider: ${providerId}`);
  }
  if (!configTemplate.model) {
    throw new Error(`Model is required for provider: ${providerId}`);
  }
  if (providerId === 'azure-openai' && !configTemplate.deploymentName) {
    throw new Error(
      'Deployment name is required for the azure-openai provider.',
    );
  }

  return configTemplate as ProviderConfig;
}

/**
 * Returns provider information for status display purposes.
 *
 * @param config - The Backstage root config service
 * @returns Provider info including type, model, and base URL
 * @public
 */
export function getProviderInfo(config: RootConfigService) {
  const providerConfig = getProviderConfig(config);
  return {
    provider: providerConfig.type,
    model: providerConfig.model,
    baseURL: providerConfig.baseUrl,
    ...(providerConfig.deploymentName && {
      deploymentName: providerConfig.deploymentName,
    }),
  };
}
