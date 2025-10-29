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
import { ChatMessage, Tool, ChatResponse, ToolCall } from '../types';

export class ClaudeProvider extends LLMProvider {
  async sendMessage(
    messages: ChatMessage[],
    tools?: Tool[],
  ): Promise<ChatResponse> {
    const requestBody = this.formatRequest(messages, tools);
    const response = await this.makeRequest('/messages', requestBody);
    return this.parseResponse(response);
  }

  async testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    try {
      // Claude doesn't have a models endpoint, so we'll make a simple test request
      const testMessages = [{ role: 'user' as const, content: 'Hello' }];
      const requestBody = {
        model: this.model,
        max_tokens: 1,
        messages: this.convertToAnthropicFormat(testMessages),
      };

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Claude API error (${response.status})`;

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
            'Invalid API key. Please check your Claude API key configuration.';
        } else if (response.status === 429) {
          errorMessage =
            'Rate limit exceeded. Please try again later or check your Claude usage limits.';
        } else if (response.status === 403) {
          errorMessage =
            'Access forbidden. Please check your API key permissions.';
        }

        return {
          connected: false,
          error: errorMessage,
        };
      }

      // If we get here, the connection is working
      return {
        connected: true,
        models: [this.model], // Claude doesn't list models, so return the configured one
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
      'anthropic-version': '2023-06-01',
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    return headers;
  }

  protected formatRequest(messages: ChatMessage[], tools?: Tool[]): any {
    const claudeMessages = this.convertToAnthropicFormat(messages);

    const request: any = {
      model: this.model,
      max_tokens: 4096,
      messages: claudeMessages,
    };

    if (tools && tools.length > 0) {
      request.tools = this.convertToAnthropicTools(tools);
    }

    return request;
  }

  protected parseResponse(response: any): ChatResponse {
    const content = response.content || [];
    const textContent = content.find((c: any) => c.type === 'text')?.text || '';

    const toolCalls: ToolCall[] = content
      .filter((c: any) => c.type === 'tool_use')
      .map((c: any) => ({
        id: c.id,
        type: 'function' as const,
        function: {
          name: c.name,
          arguments: JSON.stringify(c.input),
        },
      }));

    return {
      choices: [
        {
          message: {
            role: 'assistant',
            content: textContent,
            tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
          },
        },
      ],
      usage: response.usage
        ? {
            prompt_tokens: response.usage.input_tokens || 0,
            completion_tokens: response.usage.output_tokens || 0,
            total_tokens:
              (response.usage.input_tokens || 0) +
              (response.usage.output_tokens || 0),
          }
        : undefined,
    };
  }

  private convertToAnthropicFormat(messages: ChatMessage[]) {
    return messages
      .filter(msg => msg.role !== 'system') // Claude handles system messages differently
      .map(msg => {
        if (msg.role === 'tool') {
          return {
            role: 'user',
            content: `Tool result: ${msg.content}`,
          };
        }

        return {
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content || '',
        };
      });
  }

  private convertToAnthropicTools(tools: Tool[]) {
    return tools.map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: tool.function.parameters,
    }));
  }
}
