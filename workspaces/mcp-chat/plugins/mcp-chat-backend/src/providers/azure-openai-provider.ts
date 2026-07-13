/*
 * Copyright 2026 The Backstage Authors
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
import { OpenAIProvider } from './openai-provider';
import { ChatMessage, Tool, ProviderConfig } from '../types';

/**
 * Azure OpenAI Chat Completions API provider.
 *
 * @public
 */
export class AzureOpenAIProvider extends OpenAIProvider {
  private readonly deploymentName: string;

  protected get providerName(): string {
    return 'Azure OpenAI';
  }

  constructor(config: ProviderConfig) {
    super(config);
    if (!config.deploymentName) {
      throw new Error(
        'Deployment name is required for the azure-openai provider.',
      );
    }

    this.deploymentName = config.deploymentName;
  }

  async testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    const result = await super.testConnection();

    if (result.models) {
      const hasConfiguredModel = result.models.some(
        model => model === this.model,
      );
      if (!hasConfiguredModel) {
        this.logger?.warn(
          `[${this.type}] Configured model "${this.model}" was not found in the available models.`,
        );
      } else {
        result.models = result.models.filter(model => model === this.model);
      }
    }
    return result;
  }

  protected formatRequest(messages: ChatMessage[], tools?: Tool[]): any {
    const request = super.formatRequest(messages, tools);
    request.model = this.deploymentName;
    return request;
  }
}
