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
import type { LoggerService } from '@backstage/backend-plugin-api';
import type {
  ConversationItem,
  ProcessedMessage,
  ProcessedToolCall,
  ProcessedRagSource,
} from './conversationTypes';

/**
 * Extract plain text from a Responses API content field.
 * Handles string, array-of-parts, and undefined. Joins all matching
 * text parts (`input_text`, `output_text`, `text`) for completeness.
 */
export function extractContentFromItem(
  content: string | Array<{ type: string; text?: string }> | undefined,
): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(
        c =>
          (c.type === 'input_text' ||
            c.type === 'output_text' ||
            c.type === 'text') &&
          typeof c.text === 'string',
      )
      .map(c => c.text || '')
      .join('');
  }
  return '';
}

/**
 * Extract user input text from a raw response input field.
 */
export function extractUserInputFromRaw(input: unknown): string {
  if (typeof input === 'string') return input;

  if (Array.isArray(input)) {
    for (const item of input) {
      if (!item || typeof item !== 'object') continue;
      const inputItem = item as Record<string, unknown>;

      if (inputItem.type === 'message' && inputItem.role === 'user') {
        if (typeof inputItem.content === 'string') return inputItem.content;
        if (Array.isArray(inputItem.content)) {
          return extractContentFromItem(
            inputItem.content as Array<{ type: string; text?: string }>,
          );
        }
      }

      if (
        inputItem.type === 'input_text' &&
        typeof inputItem.text === 'string'
      ) {
        return inputItem.text;
      }
    }
  }

  return '';
}

/**
 * Extract a preview string from the response input.
 */
export function getInputText(
  input:
    | string
    | Array<{
        type: string;
        content?: string | Array<{ type: string; text?: string }>;
        role?: string;
      }>,
): string {
  if (typeof input === 'string') {
    return input.slice(0, 80) + (input.length > 80 ? '...' : '');
  }
  if (!Array.isArray(input)) return '';
  const firstInput = input.find(item => item.type === 'message');
  if (firstInput) {
    const content = extractContentFromItem(firstInput.content);
    if (content) {
      return content.slice(0, 80) + (content.length > 80 ? '...' : '');
    }
  }
  return '';
}

/**
 * Process raw conversation items into frontend-ready messages.
 *
 * Groups tool calls (mcp_call, file_search_call, web_search_call) with
 * the next assistant message, extracts RAG sources, and drops orphaned
 * tool calls.
 */
export function processConversationItems(
  items: ConversationItem[],
  logger: LoggerService,
): ProcessedMessage[] {
  const messages: ProcessedMessage[] = [];
  let pendingToolCalls: ProcessedToolCall[] = [];
  let pendingRagSources: ProcessedRagSource[] = [];

  for (const item of items) {
    if (item.type === 'mcp_list_tools') continue;

    if (
      item.type === 'mcp_call' ||
      item.type === 'function_call' ||
      item.type === 'web_search_call'
    ) {
      pendingToolCalls.push({
        id: item.id || item.call_id || `tool-${pendingToolCalls.length}`,
        name: item.name || item.type,
        serverLabel: item.server_label || 'llamastack',
        arguments: item.arguments,
        output: item.output,
        error: item.error,
        status: item.error ? 'failed' : 'completed',
      });
      continue;
    }

    if (item.type === 'file_search_call') {
      pendingToolCalls.push({
        id: item.id || item.call_id || `tool-${pendingToolCalls.length}`,
        name: 'knowledge_search',
        serverLabel: 'llamastack',
        arguments: item.queries ? JSON.stringify(item.queries) : undefined,
        output: item.results
          ? `${item.results.length} result(s) found`
          : 'No results found',
        status: 'completed',
      });
      if (item.results) {
        for (const r of item.results) {
          pendingRagSources.push({
            filename: r.filename || r.file_id || '',
            fileId: r.file_id,
            text: r.text,
            score: r.score,
            attributes: r.attributes,
          });
        }
      }
      continue;
    }

    if (item.type !== 'message') continue;
    if (item.role !== 'user' && item.role !== 'assistant') continue;

    const text = extractContentFromItem(item.content);
    if (!text.trim()) continue;

    if (item.role === 'user' && pendingToolCalls.length > 0) {
      logger.debug(
        `Dropping ${pendingToolCalls.length} orphaned tool call(s) before user message`,
      );
      pendingToolCalls = [];
      pendingRagSources = [];
    }

    const msg: ProcessedMessage = { role: item.role, text };

    if (typeof item.created_at === 'number') {
      msg.createdAt = new Date(item.created_at * 1000).toISOString();
    }

    if (item.role === 'assistant') {
      if (pendingToolCalls.length > 0) {
        msg.toolCalls = pendingToolCalls;
        pendingToolCalls = [];
      }
      if (pendingRagSources.length > 0) {
        msg.ragSources = pendingRagSources;
        pendingRagSources = [];
      }
    }

    messages.push(msg);
  }

  if (pendingToolCalls.length > 0) {
    logger.debug(
      `Dropping ${pendingToolCalls.length} orphaned tool call(s) at end of conversation`,
    );
  }

  return messages;
}
