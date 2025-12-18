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
import {
  ChatMessage,
  Tool,
  ChatResponse,
  MCPServerFullConfig,
  ResponsesApiResponse,
  ResponsesApiMcpTool,
  ResponsesApiMcpCall,
  ResponsesApiMessage,
  ToolCall,
} from '../types';

/**
 * OpenAI Responses API provider with native MCP support.
 * Delegates MCP tool discovery and execution to the API itself.
 *
 * @public
 */
export class OpenAIResponsesProvider extends LLMProvider {
  private mcpServerConfigs: MCPServerFullConfig[] = [];

  /**
   * Sets the MCP server configurations for native tool support.
   * These servers will be passed to the OpenAI Responses API.
   *
   * @param configs - Array of MCP server configurations
   */
  setMcpServerConfigs(configs: MCPServerFullConfig[]): void {
    this.mcpServerConfigs = configs;
  }

  async sendMessage(
    messages: ChatMessage[],
    _tools?: Tool[],
  ): Promise<ChatResponse> {
    const requestBody = this.formatRequest(messages);
    const response = await this.makeRequest('/responses', requestBody);
    return this.parseResponse(response);
  }

  async testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    try {
      // For Responses API, we can test with a simple request
      // Or we could check if the endpoint is reachable
      const response = await fetch(`${this.baseUrl}/responses`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          input: 'test',
          model: this.model,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Responses API error (${response.status})`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          errorMessage =
            errorText.length > 100
              ? `${errorText.substring(0, 100)}...`
              : errorText;
        }

        if (response.status === 401) {
          errorMessage =
            'Invalid API key. Please check your API key configuration.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (response.status === 403) {
          errorMessage =
            'Access forbidden. Please check your API key permissions.';
        }

        return {
          connected: false,
          error: errorMessage,
        };
      }

      return {
        connected: true,
        models: [this.model],
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

  protected formatRequest(messages: ChatMessage[], _tools?: Tool[]): any {
    // Extract the user input from the last message
    const lastMessage = messages[messages.length - 1];
    const input = lastMessage?.content || '';

    // Convert MCP server configs to Responses API tool format
    const responsesApiTools: ResponsesApiMcpTool[] = this.mcpServerConfigs
      .filter(config => config.url) // Only URL-based servers work with Responses API
      .map(config => {
        const tool: ResponsesApiMcpTool = {
          type: 'mcp',
          server_url: config.url!,
          server_label: config.id,
          require_approval: 'never' as const,
        };

        // Add headers if present in server config
        if (config.headers) {
          tool.headers = config.headers;
        }

        return tool;
      });

    // Get system prompt from messages if exists
    const systemMessage = messages.find(msg => msg.role === 'system');
    const instructions = systemMessage?.content || undefined;

    const request: any = {
      input,
      model: this.model,
      tools: responsesApiTools,
    };

    if (instructions) {
      request.instructions = instructions;
    }

    return request;
  }

  protected parseResponse(response: ResponsesApiResponse): ChatResponse {
    // Extract tool calls from mcp_call events
    const toolCalls: ToolCall[] = [];
    let finalContent = '';

    for (const event of response.output) {
      if (event.type === 'mcp_call') {
        const mcpCall = event as ResponsesApiMcpCall;
        // Create a tool call in the standard format
        toolCalls.push({
          id: mcpCall.id,
          type: 'function',
          function: {
            name: mcpCall.name,
            arguments: mcpCall.arguments,
          },
        });
      } else if (event.type === 'message') {
        const message = event as ResponsesApiMessage;
        // Extract the final text content
        if (message.content && message.content.length > 0) {
          finalContent = message.content
            .map(part => part.text)
            .filter(Boolean)
            .join('\n');
        }
      }
    }

    // Return in standard ChatResponse format
    return {
      choices: [
        {
          message: {
            role: 'assistant',
            content: finalContent || null,
            tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
          },
        },
      ],
      usage: response.usage
        ? {
            prompt_tokens: response.usage.input_tokens,
            completion_tokens: response.usage.output_tokens,
            total_tokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  /**
   * Get the raw Responses API output for detailed tool execution information
   * This is used by MCPClientServiceImpl to construct toolResponses
   */
  getLastResponseOutput(): ResponsesApiResponse['output'] | null {
    return this.lastResponseOutput;
  }

  private lastResponseOutput: ResponsesApiResponse['output'] | null = null;

  protected async makeRequest(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
      );
    }

    const jsonResponse = await response.json();

    // Store the output for later retrieval
    if (jsonResponse.output) {
      this.lastResponseOutput = jsonResponse.output;
    }

    return jsonResponse;
  }
}
