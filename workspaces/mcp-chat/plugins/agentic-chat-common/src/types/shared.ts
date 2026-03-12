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

/**
 * Token usage reported by the inference server for a single response turn.
 *
 * Mirrors the OpenAI Responses API `ResponseUsage` object.
 * Llama Stack implements the same schema, so this type is
 * the single source of truth for both frontend and backend.
 *
 * @see https://platform.openai.com/docs/api-reference/responses/object
 * @public
 */
export interface ResponseUsage {
  /** Total input tokens (cumulative across all internal agentic calls) */
  input_tokens: number;
  /** Total output tokens (cumulative across all internal agentic calls) */
  output_tokens: number;
  /** Sum of input_tokens + output_tokens (may include internal overhead) */
  total_tokens: number;
  /**
   * Breakdown of input tokens.
   * Present when the server supports prompt caching.
   */
  input_tokens_details?: InputTokensDetails;
  /**
   * Breakdown of output tokens.
   * Llama Stack may return `null` when the model does not emit reasoning tokens.
   */
  output_tokens_details?: OutputTokensDetails | null;
}

/**
 * Detailed breakdown of input tokens.
 * @public
 */
export interface InputTokensDetails {
  /** Tokens retrieved from the KV-cache (no additional compute cost) */
  cached_tokens?: number;
}

/**
 * Detailed breakdown of output tokens.
 * @public
 */
export interface OutputTokensDetails {
  /** Internal chain-of-thought tokens used by reasoning models (e.g. o3, o4-mini) */
  reasoning_tokens?: number;
}

// =============================================================================
// Shared Types (used by both frontend and backend)
// =============================================================================

/**
 * Chat message in a conversation
 * @public
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Tool call information
 * @public
 */
export interface ToolCallInfo {
  id: string;
  name: string;
  serverLabel: string;
  arguments: string;
  output?: string;
  error?: string;
}

/**
 * RAG source information from file_search_call.results
 * This comes directly from Llama Stack Responses API when include: ['file_search_call.results']
 * @public
 */
export interface RAGSource {
  /** Filename or document identifier */
  filename: string;
  /** Relevant text snippet from the document */
  text?: string;
  /** Relevance score (0-1) if provided by the API */
  score?: number;
  /** File ID for reference */
  fileId?: string;
  /** Document title from attributes (for display in citations) */
  title?: string;
  /** Source URL from attributes (for clickable citations) */
  sourceUrl?: string;
  /** Content type from attributes */
  contentType?: string;
  /** Raw attributes object from Llama Stack */
  attributes?: Record<string, unknown>;
}

/**
 * Aggregated evaluation result for a response
 * @public
 */
export interface EvaluationResult {
  /** Overall quality score (0-1) */
  overallScore: number;
  /** Individual scores by function */
  scores: Record<string, number>;
  /** Whether the response passed quality threshold */
  passedThreshold: boolean;
  /** Human-readable quality assessment */
  qualityLevel: 'excellent' | 'good' | 'fair' | 'poor';
  /** Timestamp of evaluation */
  evaluatedAt: string;
  /** Error message if evaluation failed */
  error?: string;
  /** True when evaluation was skipped (e.g. not available) rather than run */
  skipped?: boolean;
}

/**
 * File format enum
 * @public
 */
export enum FileFormat {
  YAML = 'yaml',
  PDF = 'pdf',
  TEXT = 'text',
  MARKDOWN = 'markdown',
  JSON = 'json',
}

/**
 * Information about an uploaded document
 * @public
 */
export interface DocumentInfo {
  id: string;
  fileName: string;
  format: FileFormat;
  fileSize: number;
  uploadedAt: string;
  status: 'completed' | 'in_progress' | 'failed' | 'cancelled';
}

/**
 * Provider status information
 * @public
 */
export interface ProviderStatus {
  id: string;
  model: string;
  baseUrl: string;
  connected: boolean;
  error?: string;
}

/**
 * Vector store status information
 * @public
 */
export interface VectorStoreStatus {
  id: string;
  connected: boolean;
  totalDocuments?: number;
  error?: string;
}

/**
 * MCP server status information
 * @public
 */
export interface MCPToolInfo {
  name: string;
  description?: string;
}

/**
 * @public
 */
export interface MCPServerStatus {
  id: string;
  name: string;
  url: string;
  connected: boolean;
  error?: string;
  /** Tools available on this MCP server (populated when connected) */
  tools?: MCPToolInfo[];
  /** Total number of tools (convenience field) */
  toolCount?: number;
  /** Whether this server was defined in YAML (true) or added via admin UI (false) */
  source?: 'yaml' | 'admin';
}

/**
 * Security mode for Agentic Chat
 * @public
 */
export type SecurityMode = 'none' | 'plugin-only' | 'full';

/**
 * Combined status for Agentic Chat
 * @public
 */
export interface AgenticChatStatus {
  /** Active provider identifier (e.g., 'llamastack', 'googleadk') */
  providerId: string;
  provider: ProviderStatus;
  vectorStore: VectorStoreStatus;
  mcpServers: MCPServerStatus[];
  /** Current security mode: 'none' | 'plugin-only' | 'full' */
  securityMode: SecurityMode;
  timestamp: string;
  /** Whether the plugin is ready to handle requests (AI provider connected) */
  ready: boolean;
  /** Blocking configuration errors that prevent the plugin from working */
  configurationErrors: string[];
  /** Whether the current user has admin privileges */
  isAdmin?: boolean;
  /** Optional capability status — these are not required for basic chat */
  capabilities?: {
    chat: boolean;
    rag: { available: boolean; reason?: string };
    mcpTools: { available: boolean; reason?: string };
  };
}

/**
 * Information about an available vector store
 * @public
 */
export interface VectorStoreInfo {
  id: string;
  name: string;
  status: string;
  fileCount: number;
  createdAt: number;
}

/**
 * Quick prompt configuration
 * @public
 */
export interface QuickPrompt {
  title: string;
  description: string;
  prompt: string;
  category: string;
}

// =============================================================================
// Workflow Types (Configurable multi-step templates)
// =============================================================================

/**
 * A single step within a workflow
 * @public
 */
export interface WorkflowStep {
  /** Step title shown in UI */
  title: string;
  /** Prompt to send to chat when this step is executed */
  prompt: string;
  /** Optional description for the step */
  description?: string;
}

/**
 * A workflow template - multi-step guided experience
 * @public
 */
export interface Workflow {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Icon name (material icons) */
  icon?: string;
  /** Category for grouping */
  category?: string;
  /** Ordered list of steps */
  steps: WorkflowStep[];
  /** Whether this workflow is coming soon (disabled, non-clickable) */
  comingSoon?: boolean;
  /** Custom coming soon label (defaults to "Coming Soon") */
  comingSoonLabel?: string;
}

/**
 * Quick action - single click prompt
 * @public
 */
export interface QuickAction {
  /** Display title */
  title: string;
  /** Short description */
  description?: string;
  /** Prompt to send to chat */
  prompt: string;
  /** Icon name */
  icon?: string;
  /** Category for grouping */
  category?: string;
  /** Whether this action is coming soon (disabled, non-clickable) */
  comingSoon?: boolean;
  /** Custom coming soon label (defaults to "Coming Soon") */
  comingSoonLabel?: string;
}

/**
 * A card within a swim lane
 * @public
 */
export interface SwimLaneCard {
  /** Display title */
  title: string;
  /** Short description */
  description?: string;
  /** Prompt to send to chat */
  prompt: string;
  /** Icon name */
  icon?: string;
  /** Whether this feature is coming soon (disabled, non-clickable) */
  comingSoon?: boolean;
  /** Custom coming soon label (defaults to "Coming Soon") */
  comingSoonLabel?: string;
}

/**
 * A swim lane grouping related actions for app developers
 * @public
 */
export interface SwimLane {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Description of this swim lane */
  description?: string;
  /** Icon name */
  icon?: string;
  /** Theme color (hex) */
  color?: string;
  /** Display order (lower numbers appear first, defaults to array order if not specified) */
  order?: number;
  /** Cards within this swim lane */
  cards: SwimLaneCard[];
}

// =============================================================================
// Conversation History Types
// =============================================================================

/**
 * Conversation summary for UI display.
 * Derived from stored responses.
 * @public
 */
export interface ConversationSummary {
  /** Response ID — use to continue this conversation */
  responseId: string;
  /** Preview of the conversation (first user message or assistant response) */
  preview: string;
  /** When the conversation was created */
  createdAt: Date;
  /** Model used */
  model: string;
  /** Status */
  status: 'completed' | 'failed' | 'in_progress';
  /** Llama Stack conversation ID (present for new-style conversations) */
  conversationId?: string;
  /** Previous response ID for chain deduplication */
  previousResponseId?: string;
}

/**
 * Base response from the chat endpoint, shared between frontend and backend.
 * Frontend extends this with additional fields (filtered, evaluation, etc.).
 * @public
 */
export interface ChatResponse {
  role: 'assistant';
  content: string;
  ragContext?: string[];
  /** @deprecated Use ragSources instead */
  filesSearched?: string[];
  ragSources?: RAGSource[];
  toolCalls?: ToolCallInfo[];
  responseId?: string;
  usage?: ResponseUsage;
}

/**
 * Result of a document sync operation.
 * @public
 */
export interface SyncResult {
  added: number;
  removed: number;
  updated: number;
  failed: number;
  unchanged: number;
  errors: string[];
}
