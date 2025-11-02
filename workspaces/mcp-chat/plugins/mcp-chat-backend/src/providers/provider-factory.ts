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
import { ClaudeProvider } from './claude-provider';
import { GeminiProvider } from './gemini-provider';
import { OllamaProvider } from './ollama-provider';
import { LiteLLMProvider } from './litellm-provider';
import { RootConfigService } from '@backstage/backend-plugin-api';

export class ProviderFactory {
  static createProvider(config: ProviderConfig): LLMProvider {
    switch (config.type) {
      case 'openai':
        return new OpenAIProvider(config);

      case 'claude':
        return new ClaudeProvider(config);

      case 'gemini':
        return new GeminiProvider(config);

      case 'ollama':
        return new OllamaProvider(config);

      case 'litellm':
        return new LiteLLMProvider(config);

      default:
        throw new Error(`Unsupported provider: ${config.type}`);
    }
  }
}

export function getProviderConfig(config: RootConfigService): ProviderConfig {
  const providers = config.getOptionalConfigArray('mcpChat.providers') || [];

  // For now, use the first provider. In the future, you might want to support multiple providers
  const providerConfig = providers[0];
  const providerId = providerConfig.getString('id');
  const token = providerConfig.getOptionalString('token');
  const model = providerConfig.getString('model');

  const allowedProviders = ['openai', 'claude', 'gemini', 'ollama', 'litellm'];
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
    },

    claude: {
      type: 'claude',
      apiKey: token,
      baseUrl: 'https://api.anthropic.com/v1',
      model: model,
    },

    gemini: {
      type: 'gemini',
      apiKey: token,
      baseUrl: 'https://generativelanguage.googleapis.com',
      model: model,
    },

    ollama: {
      type: 'ollama',
      // No API key needed for Ollama
      baseUrl:
        providerConfig.getOptionalString('baseUrl') || 'http://localhost:11434',
      model: model,
    },

    litellm: {
      type: 'litellm',
      apiKey: token, // Optional, depends on LiteLLM configuration
      baseUrl:
        providerConfig.getOptionalString('baseUrl') || 'http://localhost:4000',
      model: model,
    },
  };

  const configTemplate = configs[providerId];
  if (!configTemplate) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  // Validate required fields
  // Ollama and LiteLLM can work without API keys depending on configuration
  const noApiKeyRequired = ['ollama', 'litellm'];
  if (!noApiKeyRequired.includes(providerId) && !configTemplate.apiKey) {
    throw new Error(`API key is required for provider: ${providerId}`);
  }
  if (!configTemplate.baseUrl) {
    throw new Error(`Base URL is required for provider: ${providerId}`);
  }
  if (!configTemplate.model) {
    throw new Error(`Model is required for provider: ${providerId}`);
  }

  return configTemplate as ProviderConfig;
}

// Export provider info for status display
export function getProviderInfo(config: RootConfigService) {
  const providerConfig = getProviderConfig(config);
  return {
    provider: providerConfig.type,
    model: providerConfig.model,
    baseURL: providerConfig.baseUrl,
  };
}
