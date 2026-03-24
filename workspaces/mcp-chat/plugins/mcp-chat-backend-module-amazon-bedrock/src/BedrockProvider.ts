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

import {
  BedrockRuntimeClient,
  ConverseCommand,
  type ConverseCommandInput,
  type Message,
  type ContentBlock,
} from '@aws-sdk/client-bedrock-runtime';
import {
  LLMProvider,
  type ChatMessage,
  type Tool,
  type ChatResponse,
  type ProviderConfig,
  type ToolCall,
} from '@backstage-community/plugin-mcp-chat-common';

/**
 * Amazon Bedrock Converse API provider.
 *
 * Uses the AWS SDK Bedrock Runtime client with the Converse API,
 * which provides a unified interface across all Bedrock foundation models.
 *
 * Authentication is handled via the standard AWS credential chain
 * (environment variables, IAM roles, SSO, etc.). Explicit credentials
 * can be supplied through the `auth` config record with `accessKeyId`,
 * `secretAccessKey`, and optionally `sessionToken`.
 *
 * @public
 */
export class BedrockProvider extends LLMProvider {
  private client: BedrockRuntimeClient;
  private lastTools?: Tool[];

  constructor(config: ProviderConfig) {
    super(config);

    const region = config.auth?.region || 'us-east-1';

    const clientConfig: Record<string, any> = { region };

    if (config.auth?.accessKeyId && config.auth?.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.auth.accessKeyId,
        secretAccessKey: config.auth.secretAccessKey,
        ...(config.auth.sessionToken && {
          sessionToken: config.auth.sessionToken,
        }),
      };
    }

    if (config.baseUrl) {
      clientConfig.endpoint = config.baseUrl;
    }

    this.client = new BedrockRuntimeClient(clientConfig);
  }

  async sendMessage(
    messages: ChatMessage[],
    tools?: Tool[],
  ): Promise<ChatResponse> {
    const bedrockMessages = this.convertToBedrockFormat(messages);
    const systemPrompts = this.extractSystemPrompts(messages);

    const input: ConverseCommandInput = {
      modelId: this.model,
      messages: bedrockMessages,
    };

    if (systemPrompts.length > 0) {
      input.system = systemPrompts;
    }

    if (tools && tools.length > 0) {
      // Store tools so we can re-attach toolConfig on follow-up calls
      this.lastTools = tools;
      input.toolConfig = this.convertToBedrockTools(tools);
    } else if (this.hasToolBlocks(messages) && this.lastTools?.length) {
      // Bedrock requires toolConfig whenever the conversation contains
      // toolUse / toolResult blocks (e.g. the follow-up call after tool
      // execution in processQuery which doesn't pass tools).
      input.toolConfig = this.convertToBedrockTools(this.lastTools);
    }

    const command = new ConverseCommand(input);
    const response = await this.client.send(command);

    return this.parseConverseResponse(response);
  }

  async testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    try {
      const command = new ConverseCommand({
        modelId: this.model,
        messages: [
          {
            role: 'user',
            content: [{ text: 'Hello' }],
          },
        ],
        inferenceConfig: { maxTokens: 1 },
      });

      await this.client.send(command);

      return {
        connected: true,
        models: [this.model],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        connected: false,
        error: message,
      };
    }
  }

  protected getHeaders(): Record<string, string> {
    // Not used — Bedrock auth is handled by the AWS SDK
    return {};
  }

  protected formatRequest(messages: ChatMessage[], tools?: Tool[]): any {
    // Not used — sendMessage calls the SDK directly
    return { messages, tools };
  }

  protected parseResponse(response: any): ChatResponse {
    return this.parseConverseResponse(response);
  }

  private hasToolBlocks(messages: ChatMessage[]): boolean {
    return messages.some(
      msg =>
        msg.role === 'tool' ||
        (msg.role === 'assistant' && msg.tool_calls?.length),
    );
  }

  private extractSystemPrompts(
    messages: ChatMessage[],
  ): Array<{ text: string }> {
    return messages
      .filter(msg => msg.role === 'system' && msg.content)
      .map(msg => ({ text: msg.content as string }));
  }

  private convertToBedrockFormat(messages: ChatMessage[]): Message[] {
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        if (msg.role === 'tool') {
          return {
            role: 'user' as const,
            content: [
              {
                toolResult: {
                  toolUseId: msg.tool_call_id || 'unknown',
                  content: [{ text: msg.content || '' }],
                },
              },
            ] as ContentBlock[],
          };
        }

        if (msg.role === 'assistant' && msg.tool_calls?.length) {
          const blocks: ContentBlock[] = [];

          if (msg.content) {
            blocks.push({ text: msg.content });
          }

          for (const tc of msg.tool_calls) {
            let input: Record<string, unknown> = {};
            try {
              input = JSON.parse(tc.function.arguments);
            } catch {
              // keep empty input if parsing fails
            }
            blocks.push({
              toolUse: {
                toolUseId: tc.id,
                name: tc.function.name,
                input,
              },
            } as ContentBlock);
          }

          return {
            role: 'assistant' as const,
            content: blocks,
          };
        }

        return {
          role:
            msg.role === 'assistant'
              ? ('assistant' as const)
              : ('user' as const),
          content: [{ text: msg.content || ' ' }] as ContentBlock[],
        };
      });
  }

  private convertToBedrockTools(
    tools: Tool[],
  ): ConverseCommandInput['toolConfig'] {
    return {
      tools: tools.map(tool => ({
        toolSpec: {
          name: tool.function.name,
          description: tool.function.description,
          inputSchema: {
            json: tool.function.parameters as Record<string, unknown>,
          },
        },
      })) as ConverseCommandInput['toolConfig'] extends { tools?: infer T }
        ? T
        : never,
    };
  }

  private parseConverseResponse(response: any): ChatResponse {
    const output = response.output;
    const content: ContentBlock[] = output?.message?.content || [];

    const textParts = content
      .filter((block: any) => block.text)
      .map((block: any) => block.text);
    const textContent = textParts.join('');

    const toolCalls: ToolCall[] = content
      .filter((block: any) => block.toolUse)
      .map((block: any) => ({
        id: block.toolUse.toolUseId,
        type: 'function' as const,
        function: {
          name: block.toolUse.name,
          arguments: JSON.stringify(block.toolUse.input),
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
            prompt_tokens: response.usage.inputTokens || 0,
            completion_tokens: response.usage.outputTokens || 0,
            total_tokens:
              (response.usage.inputTokens || 0) +
              (response.usage.outputTokens || 0),
          }
        : undefined,
    };
  }
}
