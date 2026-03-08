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

import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';
import type {
  ConversationSummary,
  ConversationDetails,
  ConversationInputItem,
  ProcessedMessage,
} from '../types';
import { jsonBody } from './fetchHelpers';

export interface ConversationApiDeps {
  fetchJson: <T>(path: string, init?: RequestInit) => Promise<T>;
  fetchJsonSafe: <T>(
    path: string,
    fallback: T,
    init?: RequestInit,
  ) => Promise<T>;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
}

/**
 * List stored conversations from Llama Stack.
 */
export async function listConversations(
  deps: ConversationApiDeps,
  limit: number,
  order: 'asc' | 'desc',
  after?: string,
): Promise<{
  conversations: ConversationSummary[];
  hasMore: boolean;
  lastId?: string;
}> {
  const params = new URLSearchParams({ limit: limit.toString(), order });
  if (after) params.set('after', after);

  const data = await deps.fetchJson<{
    conversations?: Array<{
      responseId: string;
      preview: string;
      createdAt: string;
      model: string;
      status: string;
      conversationId?: string;
      previousResponseId?: string;
    }>;
    hasMore?: boolean;
    lastId?: string;
  }>(`/conversations?${params.toString()}`);

  const conversations: ConversationSummary[] = (data.conversations || []).map(
    c => ({
      ...c,
      createdAt: new Date(c.createdAt),
      status: (c.status ?? 'completed') as
        | 'completed'
        | 'in_progress'
        | 'failed',
    }),
  );

  return {
    conversations,
    hasMore: data.hasMore || false,
    lastId: data.lastId,
  };
}

/**
 * Get a specific conversation by response ID.
 */
export async function getConversation(
  deps: ConversationApiDeps,
  responseId: string,
): Promise<ConversationDetails | null> {
  const baseUrl = await deps.discoveryApi.getBaseUrl('agentic-chat');
  const response = await deps.fetchApi.fetch(
    `${baseUrl}/conversations/${responseId}`,
  );

  if (response.status === 404) return null;
  if (!response.ok) throw await ResponseError.fromResponse(response);

  const data = await response.json();
  if (!data.conversation) return null;

  return {
    id: data.conversation.id,
    model: data.conversation.model,
    status: data.conversation.status,
    createdAt: new Date(data.conversation.createdAt),
    input: data.conversation.input,
    output: data.conversation.output || [],
    previousResponseId: data.conversation.previousResponseId,
  };
}

/**
 * Get input items (full conversation context) for a response.
 */
export async function getConversationInputs(
  deps: ConversationApiDeps,
  responseId: string,
): Promise<{
  items: ConversationInputItem[];
  hasMore: boolean;
}> {
  const data = await deps.fetchJsonSafe<{
    items?: ConversationInputItem[];
    hasMore?: boolean;
  }>(`/conversations/${responseId}/inputs`, {});
  return { items: data.items || [], hasMore: data.hasMore || false };
}

/**
 * Delete a conversation from Llama Stack.
 */
export async function deleteConversation(
  deps: ConversationApiDeps,
  responseId: string,
  conversationId?: string,
): Promise<boolean> {
  const params = conversationId
    ? `?conversationId=${encodeURIComponent(conversationId)}`
    : '';
  const data = await deps.fetchJsonSafe<{ success?: boolean }>(
    `/conversations/${responseId}${params}`,
    { success: false },
    { method: 'DELETE' },
  );
  return data.success === true;
}

/**
 * Create a new Llama Stack conversation container.
 */
export async function createConversation(
  deps: ConversationApiDeps,
): Promise<{ conversationId: string }> {
  const data = await deps.fetchJson<{ conversationId: string }>(
    '/conversations/create',
    jsonBody({}),
  );
  return { conversationId: data.conversationId };
}

/**
 * Get all items for a Llama Stack conversation (full ordered history).
 */
export async function getConversationItems(
  deps: ConversationApiDeps,
  conversationId: string,
): Promise<{ items: ConversationInputItem[] }> {
  const data = await deps.fetchJsonSafe<{
    items?: ConversationInputItem[];
  }>(`/conversations/by-conversation/${conversationId}/items`, {});
  return { items: data.items || [] };
}

/**
 * Get processed messages for a conversation, ready for rendering.
 */
export async function getConversationMessages(
  deps: ConversationApiDeps,
  conversationId: string,
): Promise<ProcessedMessage[]> {
  const data = await deps.fetchJsonSafe<{ messages?: ProcessedMessage[] }>(
    `/conversations/by-conversation/${conversationId}/messages`,
    {},
  );
  return data.messages || [];
}

/**
 * Walk the response chain to get full history (legacy fallback).
 */
export async function walkResponseChain(
  deps: ConversationApiDeps,
  responseId: string,
): Promise<{
  messages: Array<{ role: 'user' | 'assistant'; text: string }>;
}> {
  const data = await deps.fetchJsonSafe<{
    messages?: Array<{ role: 'user' | 'assistant'; text: string }>;
  }>(`/conversations/by-response/${responseId}/chain`, {});
  return { messages: data.messages || [] };
}
