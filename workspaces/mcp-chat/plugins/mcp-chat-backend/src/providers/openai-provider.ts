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
import { ChatMessage, Tool, ChatResponse } from '../types';

export class OpenAIProvider extends LLMProvider {
  async sendMessage(
    messages: ChatMessage[],
    tools?: Tool[],
  ): Promise<ChatResponse> {
    const requestBody = this.formatRequest(messages, tools);
    const response = await this.makeRequest('/chat/completions', requestBody);
    return this.parseResponse(response);
  }

  async testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `OpenAI API error (${response.status})`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // If parsing fails, use the raw error text but truncate if too long
          errorMessage =
            errorText.length > 100
              ? `${errorText.substring(0, 100)}...`
              : errorText;
        }

        // Provide user-friendly messages for common errors
        if (response.status === 401) {
          errorMessage =
            'Invalid API key. Please check your OpenAI API key configuration.';
        } else if (response.status === 429) {
          errorMessage =
            'Rate limit exceeded. Please try again later or check your OpenAI usage limits.';
        } else if (response.status === 403) {
          errorMessage =
            'Access forbidden. Please check your API key permissions.';
        }

        return {
          connected: false,
          error: errorMessage,
        };
      }

      const data = await response.json();
      const models = data.data?.map((model: any) => model.id) || [];

      return {
        connected: true,
        models,
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  protected formatRequest(messages: ChatMessage[], tools?: Tool[]): any {
    const request: any = {
      model: this.model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    };

    if (tools && tools.length > 0) {
      request.tools = tools;
    }

    return request;
  }

  protected parseResponse(response: any): ChatResponse {
    return response; // OpenAI format is our standard
  }
}
