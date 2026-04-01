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
  ToolCall,
  ProviderConfig,
} from '../types';
import {
  GenerateContentConfig,
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
  Content,
  Part,
  Tool as GenAITool,
  GenerateContentResponse,
} from '@google/genai';
/**
 * Google Gemini API provider.
 *
 * @public
 */
export class GeminiProvider extends LLMProvider {
  private genAI: GoogleGenAI;
  private readonly baseModelConfig: GenerateContentConfig;

  constructor(config: ProviderConfig) {
    super(config);
    if (!this.apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
    this.baseModelConfig = {
      temperature: this.temperature ?? 0.7,
      maxOutputTokens: this.maxTokens ?? 8192,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    };
  }

  async sendMessage(
    messages: ChatMessage[],
    tools?: Tool[],
  ): Promise<ChatResponse> {
    try {
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const contents = this.convertToGeminiFormat(conversationMessages);

      const requestConfig: GenerateContentConfig = {
        ...this.baseModelConfig,
      };

      if (tools && tools.length > 0) {
        requestConfig.tools = this.convertToGeminiTools(tools);
      }

      if (systemMessage) {
        requestConfig.systemInstruction = systemMessage.content ?? undefined;
      }

      this.logger?.debug(`[gemini] Request to model ${this.model}`, {
        contents: this.truncateForLogging(JSON.stringify(contents)),
        config: this.truncateForLogging(JSON.stringify(requestConfig)),
        toolCount: tools?.length ?? 0,
      });

      const startTime = Date.now();
      const result = await this.genAI.models.generateContent({
        model: this.model,
        contents,
        config: requestConfig,
      });
      const duration = Date.now() - startTime;

      this.logger?.debug(`[gemini] Response received in ${duration}ms`, {
        data: this.truncateForLogging(JSON.stringify(result)),
        usageMetadata: result.usageMetadata
          ? JSON.stringify(result.usageMetadata)
          : undefined,
      });

      const finishReason = result.candidates?.[0]?.finishReason;
      if (finishReason === 'MAX_TOKENS') {
        this.logger?.warn(
          `[gemini] Response was truncated due to token limit (finishReason: ${finishReason}). ` +
            `Consider increasing maxOutputTokens in your provider configuration.`,
        );
      }

      return this.parseResponse(result);
    } catch (error) {
      this.logger?.error(`[gemini] API error`, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async testConnection(): Promise<{
    connected: boolean;
    models?: string[];
    error?: string;
  }> {
    try {
      // Gemini doesn't have a models list endpoint in the same way
      // We'll test by making a simple generateContent request
      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        config: {
          ...this.baseModelConfig,
          maxOutputTokens: 1,
        },
      });

      // If we get here without error, the connection is working
      if (response) {
        return {
          connected: true,
          models: [this.model], // Gemini doesn't list models, so return the configured one
        };
      }
      return {
        connected: false,
        error: 'No response received from Gemini API',
      };
    } catch (error) {
      return {
        connected: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to connect to Gemini API',
      };
    }
  }

  protected getHeaders(): Record<string, string> {
    return {};
  }

  protected formatRequest(_messages: ChatMessage[], _tools?: Tool[]): any {
    return {};
  }

  protected parseResponse(result: GenerateContentResponse): ChatResponse {
    const candidate = result.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    const textPart = parts.find((part: Part) => part.text);
    const content = textPart?.text || '';

    const toolCalls: ToolCall[] = parts
      .filter((part: Part) => part.functionCall)
      .map((part: Part) => ({
        id: Math.random().toString(36).substring(2, 15),
        type: 'function' as const,
        function: {
          name: part.functionCall!.name!,
          arguments: JSON.stringify(part.functionCall!.args || {}),
        },
      }));

    return {
      choices: [
        {
          message: {
            role: 'assistant',
            content,
            tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
          },
        },
      ],
      usage: result.usageMetadata
        ? {
            prompt_tokens: result.usageMetadata.promptTokenCount || 0,
            completion_tokens: result.usageMetadata.candidatesTokenCount || 0,
            total_tokens: result.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
    };
  }

  private convertToGeminiFormat(messages: ChatMessage[]): Content[] {
    const contents: Content[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      if (msg.role === 'tool') {
        let functionName = 'unknown_function';
        for (let j = i - 1; j >= 0; j--) {
          const prevMsg = messages[j];
          if (prevMsg.role === 'assistant' && prevMsg.tool_calls) {
            const matchingCall = prevMsg.tool_calls.find(
              tc => tc.id === msg.tool_call_id,
            );
            if (matchingCall) {
              functionName = matchingCall.function.name;
              break;
            }
          }
        }

        let responseData: any;
        try {
          responseData = JSON.parse(msg.content || '{}');
        } catch {
          responseData = { result: msg.content || '' };
        }

        contents.push({
          role: 'function',
          parts: [
            {
              functionResponse: {
                name: functionName,
                response: responseData,
              },
            },
          ],
        });
        continue;
      }

      if (
        msg.role === 'assistant' &&
        msg.tool_calls &&
        msg.tool_calls.length > 0
      ) {
        const parts: Part[] = [];

        if (msg.content) {
          parts.push({ text: msg.content });
        }

        msg.tool_calls.forEach(toolCall => {
          parts.push({
            functionCall: {
              name: toolCall.function.name,
              args: JSON.parse(toolCall.function.arguments || '{}'),
            },
          });
        });

        contents.push({ role: 'model', parts });
        continue;
      }

      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.content || '' }] });
      } else if (msg.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: msg.content || '' }] });
      }
    }

    return contents;
  }

  private convertToGeminiTools(tools: Tool[]): GenAITool[] {
    return [
      {
        functionDeclarations: tools.map(tool => ({
          name: tool.function.name,
          description: tool.function.description,
          parameters: this.cleanJsonSchemaForGemini(tool.function.parameters),
        })),
      },
    ];
  }

  private cleanJsonSchemaForGemini(schema: any): any {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }

    const cleanSchema = { ...schema };

    delete cleanSchema.$schema;
    delete cleanSchema.additionalProperties;
    delete cleanSchema.$id;
    delete cleanSchema.$ref;
    delete cleanSchema.definitions;
    delete cleanSchema.$defs;

    if (cleanSchema.properties && typeof cleanSchema.properties === 'object') {
      cleanSchema.properties = Object.fromEntries(
        Object.entries(cleanSchema.properties).map(([key, value]) => [
          key,
          this.cleanJsonSchemaForGemini(value),
        ]),
      );
    }

    if (cleanSchema.items) {
      cleanSchema.items = this.cleanJsonSchemaForGemini(cleanSchema.items);
    }

    if (cleanSchema.anyOf && Array.isArray(cleanSchema.anyOf)) {
      cleanSchema.anyOf = cleanSchema.anyOf.map((item: any) =>
        this.cleanJsonSchemaForGemini(item),
      );
    }

    if (cleanSchema.oneOf && Array.isArray(cleanSchema.oneOf)) {
      cleanSchema.oneOf = cleanSchema.oneOf.map((item: any) =>
        this.cleanJsonSchemaForGemini(item),
      );
    }

    if (cleanSchema.allOf && Array.isArray(cleanSchema.allOf)) {
      cleanSchema.allOf = cleanSchema.allOf.map((item: any) =>
        this.cleanJsonSchemaForGemini(item),
      );
    }

    return cleanSchema;
  }
}
