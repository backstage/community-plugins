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
import { normalizeContent } from './InputItemsNormalizer';
import type {
  ConversationItem,
  ConversationSummary,
  InputItem,
} from './conversationTypes';

/** Raw item shape from Llama Stack /v1/conversations/{id}/items API */
export type RawConversationItem = Record<string, unknown>;

/** Raw item shape from Llama Stack /v1/openai/v1/responses/{id}/input_items API */
export type RawInputItem = Record<string, unknown>;

/**
 * Map raw API items from /v1/conversations/{id}/items to ConversationItem[].
 * Pure transformation - no side effects.
 */
export function mapRawItemsToConversationItems(
  rawItems: RawConversationItem[],
): ConversationItem[] {
  return rawItems.map(item => {
    const normalizedContent = normalizeContent(item.content);

    const result: ConversationItem = {
      type: item.type as string,
      id: item.id as string | undefined,
      role: item.role as string | undefined,
      content: normalizedContent,
      status: item.status as string | undefined,
      call_id: item.call_id as string | undefined,
      output: item.output as string | undefined,
    };

    if (typeof item.name === 'string') result.name = item.name;
    if (typeof item.server_label === 'string')
      result.server_label = item.server_label;
    if (typeof item.arguments === 'string') result.arguments = item.arguments;
    if (typeof item.error === 'string') result.error = item.error;
    if (Array.isArray(item.queries)) result.queries = item.queries as string[];
    if (Array.isArray(item.results)) {
      result.results = (item.results as Array<Record<string, unknown>>).map(
        r => ({
          filename: r.filename as string | undefined,
          file_id: r.file_id as string | undefined,
          text: r.text as string | undefined,
          score: r.score as number | undefined,
          attributes: r.attributes as Record<string, unknown> | undefined,
        }),
      );
    }
    if (typeof item.created_at === 'number') {
      result.created_at = item.created_at;
    }

    return result;
  });
}

/**
 * Map raw API items from /v1/openai/v1/responses/{id}/input_items to InputItem[].
 * Pure transformation - normalizes content field for each item.
 */
export function mapRawInputItemsToNormalized(
  rawItems: RawInputItem[],
): InputItem[] {
  return rawItems.map(item => {
    const normalizedContent = normalizeContent(item.content);
    return {
      type: item.type as string,
      id: item.id as string | undefined,
      role: item.role as string | undefined,
      content: normalizedContent,
      status: item.status as string | undefined,
      call_id: item.call_id as string | undefined,
      output: item.output as string | undefined,
    };
  });
}

/** Raw response item from Llama Stack list responses API */
export type RawListResponseItem = {
  id?: string;
  model?: string;
  status?: string;
  created_at?: number;
  input?: unknown;
  previous_response_id?: string;
  conversation?: string;
};

/**
 * Build a ConversationSummary from a raw list response item.
 * Returns null if required fields (id, created_at, model) are missing.
 */
export function toConversationSummary(
  r: RawListResponseItem,
  preview: string,
  conversationId: string | undefined,
): ConversationSummary | null {
  if (!r.id || !r.created_at || !r.model) return null;

  return {
    responseId: r.id,
    preview,
    createdAt: new Date(r.created_at * 1000),
    model: r.model,
    status: (r.status as 'completed' | 'failed' | 'in_progress') || 'completed',
    conversationId: r.conversation || conversationId || undefined,
    previousResponseId: r.previous_response_id,
  };
}

/** Output item from Llama Stack approval continuation response */
export type ApprovalOutputItem = {
  type: string;
  id?: string;
  name?: string;
  status?: string;
  error?: string;
  output?: string;
  content?: Array<{ type: string; text: string }>;
};

/**
 * Create a compact summary of output items for logging.
 * Pure transformation - no side effects.
 */
export function createOutputSummaryForLogging(
  output: ApprovalOutputItem[],
): Array<Record<string, unknown>> {
  return (output || []).map(item => {
    const summary: Record<string, unknown> = { type: item.type };
    if (item.name) summary.name = item.name;
    if (item.status) summary.status = item.status;
    if (item.error) summary.error = item.error;
    if (item.output !== undefined)
      summary.hasOutput = item.output !== null && item.output !== '';
    if (item.content) summary.contentParts = item.content.length;
    return summary;
  });
}
