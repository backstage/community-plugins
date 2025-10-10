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
import { Ollama } from 'ollama';

export class OllamaProvider extends LLMProvider {
  private ollama: Ollama;

  constructor(config: any) {
    super(config);
    // Initialize Ollama client with the base URL
    this.ollama = new Ollama({
      host: this.baseUrl.replace('/v1', ''), // Remove /v1 suffix if present
    });
  }

  async sendMessage(
    messages: ChatMessage[],
    tools?: Tool[],
  ): Promise<ChatResponse> {
    // Convert our ChatMessage format to Ollama's Message format
    const ollamaMessages = messages.map(msg => {
      const ollamaMsg: any = {
        role: msg.role,
        content: msg.content || '', // Ollama expects string, not null
        tool_call_id: msg.tool_call_id,
      };

      // Convert tool_calls for Ollama - it expects function.arguments to be an object, not a string
      if (msg.tool_calls) {
        ollamaMsg.tool_calls = msg.tool_calls.map(toolCall => ({
          id: toolCall.id,
          type: toolCall.type,
          function: {
            name: toolCall.function.name,
            arguments:
              typeof toolCall.function.arguments === 'string'
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.function.arguments,
          },
        }));
      }

      return ollamaMsg;
    });

    const response = await this.ollama.chat({
      model: this.model,
      messages: ollamaMessages,
      tools: tools,
    });
    const parsedResponse = this.parseResponse(response);
    return parsedResponse;
  }

  async testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    try {
      // Use Ollama's list method to get available models
      const modelList = await this.ollama.list();
      const models = modelList.models?.map(model => model.name) || [];

      // Check if the configured model is available
      if (!models.includes(this.model)) {
        return {
          connected: false,
          models,
          error: `Model '${
            this.model
          }' is not available on this Ollama server. Available models: ${
            models.length > 0 ? models.join(', ') : 'none'
          }. Please ensure the model is installed by running 'ollama pull ${
            this.model
          }' or update your configuration to use an available model.`,
        };
      }

      return {
        connected: true,
        models,
      };
    } catch (error) {
      return {
        connected: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to connect to Ollama server',
      };
    }
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      // No authorization header needed for Ollama
    };
  }

  protected formatRequest(messages: ChatMessage[], tools?: Tool[]): any {
    // This method is not used anymore since we're using the Ollama library directly
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
    // The Ollama library returns a response that should be compatible with OpenAI format
    // But let's ensure it matches our expected ChatResponse format
    let toolCalls;
    if (response.message?.tool_calls) {
      // Convert Ollama tool calls to the expected format
      toolCalls = response.message.tool_calls.map(
        (toolCall: any, index: number) => ({
          id: toolCall.id || `call_${index}`,
          type: 'function' as const,
          function: {
            name: toolCall.function?.name || toolCall.name,
            arguments:
              typeof toolCall.function?.arguments === 'string'
                ? toolCall.function.arguments
                : JSON.stringify(
                    toolCall.function?.arguments || toolCall.arguments || {},
                  ),
          },
        }),
      );
    }

    return {
      choices: [
        {
          message: {
            role: 'assistant',
            content: response.message?.content || null,
            tool_calls: toolCalls,
          },
        },
      ],
      usage: response.usage || {
        prompt_tokens: response.prompt_eval_count || 0,
        completion_tokens: response.eval_count || 0,
        total_tokens:
          (response.prompt_eval_count || 0) + (response.eval_count || 0),
      },
    };
  }
}
