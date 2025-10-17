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
  GoogleGenerativeAI,
  GenerativeModel,
  Content,
  HarmCategory,
  HarmBlockThreshold,
  GenerateContentResult,
  Part,
} from '@google/generative-ai';

export class GeminiProvider extends LLMProvider {
  private genAI: GoogleGenerativeAI;
  private geminiModel: GenerativeModel;

  constructor(config: ProviderConfig) {
    super(config);
    if (!this.apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);

    this.geminiModel = this.genAI.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
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
    });
  }

  async sendMessage(
    messages: ChatMessage[],
    tools?: Tool[],
  ): Promise<ChatResponse> {
    try {
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const contents = this.convertToGeminiFormat(conversationMessages);

      let modelToUse = this.geminiModel;
      const modelConfig: any = {
        model: this.model,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
        safetySettings: this.geminiModel.safetySettings,
      };

      if (tools && tools.length > 0) {
        modelConfig.tools = [this.convertToGeminiTools(tools)];
      }

      if (systemMessage) {
        modelConfig.systemInstruction = systemMessage.content ?? undefined;
      }

      if ((tools && tools.length > 0) || systemMessage) {
        modelToUse = this.genAI.getGenerativeModel(modelConfig);
      }

      const result = await modelToUse.generateContent({ contents });

      return this.parseResponse(result);
    } catch (error) {
      console.error('Gemini API Error:', error);
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
      const result = await this.geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        generationConfig: { maxOutputTokens: 1 },
      });

      // If we get here without error, the connection is working
      const response = await result.response;
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

  protected parseResponse(result: GenerateContentResult): ChatResponse {
    const { response } = result;
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    const textPart = parts.find((part: Part) => part.text);
    const content = textPart?.text || '';

    const toolCalls: ToolCall[] = parts
      .filter((part: Part) => part.functionCall)
      .map((part: Part) => ({
        id: Math.random().toString(36).substring(2, 15),
        type: 'function' as const,
        function: {
          name: part.functionCall!.name,
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
      usage: response.usageMetadata
        ? {
            prompt_tokens: response.usageMetadata.promptTokenCount || 0,
            completion_tokens: response.usageMetadata.candidatesTokenCount || 0,
            total_tokens: response.usageMetadata.totalTokenCount || 0,
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

  private convertToGeminiTools(tools: Tool[]) {
    return {
      functionDeclarations: tools.map(tool => ({
        name: tool.function.name,
        description: tool.function.description,
        parameters: this.cleanJsonSchemaForGemini(tool.function.parameters),
      })),
    };
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
