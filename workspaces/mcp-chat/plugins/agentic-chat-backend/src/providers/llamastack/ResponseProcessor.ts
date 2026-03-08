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
import type {
  ChatResponse,
  ResponsesApiResponse,
  ResponsesApiMessage,
  ResponsesApiFileSearchResult,
  ResponsesApiMcpCall,
  ToolCallInfo,
} from '../../types';

/**
 * Process a Responses API response into a ChatResponse.
 *
 * @param response - Raw response from Llama Stack Responses API
 * @returns Normalized ChatResponse with text, RAG sources, and tool calls
 */
export function processResponse(response: ResponsesApiResponse): ChatResponse {
  let textContent = '';
  const sources: ChatResponse['ragSources'] = [];
  const toolCalls: ToolCallInfo[] = [];
  const seenSourceKeys = new Set<string>();

  for (const item of response.output || []) {
    if (item.type === 'message') {
      const msgItem = item as ResponsesApiMessage;
      for (const content of msgItem.content || []) {
        if (content.type === 'output_text' && content.text) {
          textContent += content.text;
        }
      }
    } else if (item.type === 'file_search_call') {
      const fsItem = item as ResponsesApiFileSearchResult;
      if (fsItem.results) {
        for (const result of fsItem.results) {
          if (!result || typeof result !== 'object') continue;
          const attrs = result.attributes || {};
          const sourceUrl = attrs.source_url as string | undefined;
          const sourceKey =
            sourceUrl || result.file_id || result.filename || '';
          if (seenSourceKeys.has(sourceKey)) continue;
          seenSourceKeys.add(sourceKey);

          sources.push({
            filename: result.filename || result.file_id,
            fileId: result.file_id,
            score: result.score,
            text: result.text,
            title: attrs.title as string | undefined,
            sourceUrl,
            contentType: attrs.content_type as string | undefined,
            attributes: attrs,
          });
        }
      }
    } else if (item.type === 'mcp_call') {
      const mcpItem = item as ResponsesApiMcpCall;
      toolCalls.push({
        id: mcpItem.id,
        name: mcpItem.name || 'Unknown tool',
        serverLabel: mcpItem.server_label,
        arguments: mcpItem.arguments,
        output: mcpItem.output,
        error: mcpItem.error,
      });
    }
  }

  return {
    role: 'assistant' as const,
    content: textContent || 'I could not generate a response.',
    ragSources: sources && sources.length > 0 ? sources : undefined,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    responseId: response.id,
    usage: response.usage,
  };
}
