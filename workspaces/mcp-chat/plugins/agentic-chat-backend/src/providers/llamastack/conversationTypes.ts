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
import type { LlamaStackClient } from './LlamaStackClient';
import type { ConversationSummary } from '../../types';

/**
 * Accessor functions injected into ConversationService so that
 * runtime config changes (baseUrl, model) take effect without
 * restarting the plugin. The orchestrator (or ClientManager in
 * Step 3) provides concrete implementations.
 */
export interface ConversationClientAccessor {
  /** Returns the current LlamaStackClient (may be re-created on baseUrl change). */
  getClient: () => LlamaStackClient;
  /** Returns the current model identifier. */
  getModel: () => string;
}

export type { ConversationSummary };

/**
 * Conversation list result
 */
export interface ConversationListResult {
  conversations: ConversationSummary[];
  hasMore: boolean;
  lastId?: string;
}

/**
 * Conversation details
 */
export interface ConversationDetails {
  id: string;
  model: string;
  status: string;
  createdAt: Date;
  input: unknown; // Can be string or array of input items
  output: Array<{
    type: string;
    id?: string;
    role?: string;
    content?: Array<{ type: string; text: string }>;
  }>;
  previousResponseId?: string;
}

/**
 * Input item from conversation
 */
export interface InputItem {
  type: string;
  id?: string;
  role?: string;
  content?: string | Array<{ type: string; text?: string }>;
  status?: string;
  call_id?: string;
  output?: string;
}

/**
 * Input items result
 */
export interface InputItemsResult {
  items: InputItem[];
  hasMore: boolean;
}

/**
 * Item from the Conversations API (/v1/conversations/{id}/items)
 */
export interface ConversationItem {
  type: string;
  id?: string;
  role?: string;
  content?: string | Array<{ type: string; text?: string }>;
  status?: string;
  call_id?: string;
  output?: string;
  name?: string;
  server_label?: string;
  arguments?: string;
  error?: string;
  queries?: string[];
  results?: Array<{
    filename?: string;
    file_id?: string;
    text?: string;
    score?: number;
    attributes?: Record<string, unknown>;
  }>;
  /** Unix timestamp (seconds) from LlamaStack, if available */
  created_at?: number;
}

/**
 * Result from getConversationItems
 */
export interface ConversationItemsResult {
  items: ConversationItem[];
}

/**
 * A tool call attached to a processed message.
 */
export interface ProcessedToolCall {
  id: string;
  name: string;
  serverLabel: string;
  arguments?: string;
  output?: string;
  error?: string;
  status: string;
}

/**
 * A RAG source attached to a processed message.
 */
export interface ProcessedRagSource {
  filename: string;
  text?: string;
  score?: number;
  fileId?: string;
  attributes?: Record<string, unknown>;
}

/**
 * A fully processed message ready for the frontend.
 * Tool calls and RAG sources are already grouped with their assistant message.
 */
export interface ProcessedMessage {
  role: 'user' | 'assistant';
  text: string;
  toolCalls?: ProcessedToolCall[];
  ragSources?: ProcessedRagSource[];
  /** ISO 8601 timestamp of when this message was created, if available */
  createdAt?: string;
}

/**
 * Approval continuation result
 */
export interface ApprovalResult {
  content: string;
  responseId: string;
  toolExecuted: boolean;
  toolOutput?: string;
  /** Present when the model requests approval for a chained tool call. */
  pendingApproval?: {
    approvalRequestId: string;
    toolName: string;
    serverLabel?: string;
    arguments?: string;
  };
}
