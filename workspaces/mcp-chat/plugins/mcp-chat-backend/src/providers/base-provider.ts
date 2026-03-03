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
  protected logger?: any;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
    this.type = config.type;
    this.logger = config.logger;
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

  protected async makeRequest(endpoint: string, body: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    if (this.logger) {
      this.logger.debug(`[${this.type}] Request to ${url}`, {
        payload: JSON.stringify(body, null, 2),
      });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    const responseData = await response.json();

    if (this.logger) {
      this.logger.debug(`[${this.type}] Response from ${url}`, {
        payload: JSON.stringify(responseData, null, 2),
      });
    }

    return responseData;
  }
}
