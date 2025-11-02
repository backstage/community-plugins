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

/**
 * LiteLLM Provider
 *
 * LiteLLM is a unified interface to 100+ LLM APIs including:
 * - OpenAI, Azure OpenAI
 * - Anthropic (Claude)
 * - Google (Gemini, VertexAI)
 * - AWS Bedrock
 * - Cohere, Replicate, Huggingface
 * - And many more...
 *
 * It uses the OpenAI-compatible format, making it easy to integrate.
 *
 * Configuration example in app-config.yaml:
 * ```yaml
 * mcpChat:
 *   providers:
 *     - id: litellm
 *       token: ${LITELLM_API_KEY}  # Optional, depends on your LiteLLM setup
 *       baseUrl: 'http://localhost:4000'  # Your LiteLLM proxy URL
 *       model: gpt-4  # Any model supported by your LiteLLM instance
 * ```
 */
export class LiteLLMProvider extends LLMProvider {
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
      // Try to fetch available models from LiteLLM
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `LiteLLM API error (${response.status})`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
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
            'Invalid API key. Please check your LiteLLM API key configuration.';
        } else if (response.status === 429) {
          errorMessage =
            'Rate limit exceeded. Please try again later or check your LiteLLM usage limits.';
        } else if (response.status === 403) {
          errorMessage =
            'Access forbidden. Please check your API key permissions.';
        } else if (response.status === 404) {
          errorMessage =
            'LiteLLM endpoint not found. Please verify your baseUrl configuration.';
        }

        return {
          connected: false,
          error: errorMessage,
        };
      }

      const data = await response.json();

      // LiteLLM returns models in OpenAI format
      const models = data.data?.map((model: any) => model.id) || [];

      return {
        connected: true,
        models: models.length > 0 ? models : [this.model],
      };
    } catch (error) {
      // If /models endpoint fails, try a simple health check
      try {
        const healthResponse = await fetch(`${this.baseUrl}/health`, {
          method: 'GET',
          headers: this.getHeaders(),
        });

        if (healthResponse.ok) {
          return {
            connected: true,
            models: [this.model],
          };
        }
      } catch {
        // Health check also failed
      }

      return {
        connected: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to connect to LiteLLM API',
      };
    }
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // LiteLLM supports both Authorization header and API key header
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
      // Enable parallel tool calls if supported by the underlying model
      request.parallel_tool_calls = true;
    }

    return request;
  }

  protected parseResponse(response: any): ChatResponse {
    // LiteLLM returns OpenAI-compatible format
    return response;
  }
}
