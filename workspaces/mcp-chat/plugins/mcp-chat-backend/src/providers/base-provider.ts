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
import { LoggerService } from '@backstage/backend-plugin-api';
import { ResponseError } from '@backstage/errors';
import { ChatMessage, Tool, ChatResponse, ProviderConfig } from '../types';

/**
 * Abstract base class for all LLM providers.
 * Extend this class to create custom LLM provider implementations.
 *
 * @public
 */
export abstract class LLMProvider {
  protected apiKey?: string; // Made optional
  protected baseUrl: string;
  protected model: string;
  protected type: string;
  protected logger?: LoggerService;
  protected maxTokens?: number;
  protected temperature?: number;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
    this.type = config.type;
    this.logger = config.logger;
    this.maxTokens = config.maxTokens;
    this.temperature = config.temperature;
  }

  abstract sendMessage(
    messages: ChatMessage[],
    tools?: Tool[],
  ): Promise<ChatResponse>;

  abstract testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }>;

  protected abstract getHeaders(): Record<string, string>;
  protected abstract formatRequest(
    messages: ChatMessage[],
    tools?: Tool[],
  ): any;
  protected abstract parseResponse(response: any): ChatResponse;

  protected truncateForLogging(data: string, maxLength = 4096): string {
    if (data.length <= maxLength) return data;
    return `${data.substring(0, maxLength)}... [truncated ${
      data.length - maxLength
    } chars]`;
  }

  protected async makeRequest(endpoint: string, body: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    this.logger?.debug(`[${this.type}] Request to ${url}`, {
      body: this.truncateForLogging(JSON.stringify(body)),
    });
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      this.logger?.error(
        `[${this.type}] Request failed (${response.status}) after ${duration}ms`,
        { responseData: errorText },
      );
      throw await ResponseError.fromResponse(response);
    }

    const responseData = await response.json();

    this.logger?.debug(`[${this.type}] Response received in ${duration}ms`, {
      data: this.truncateForLogging(JSON.stringify(responseData)),
    });

    // Warn if response was truncated due to token limits
    const finishReason = responseData.choices?.[0]?.finish_reason;
    if (finishReason === 'length' || finishReason === 'max_tokens') {
      this.logger?.warn(
        `[${this.type}] Response was truncated due to token limit (finish_reason: ${finishReason}). ` +
          `Consider increasing max_tokens in your provider configuration.`,
      );
    }

    return responseData;
  }
}
