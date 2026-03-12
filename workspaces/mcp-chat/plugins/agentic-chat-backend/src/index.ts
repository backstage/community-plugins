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
 * Agentic Chat Backend Plugin
 *
 * @packageDocumentation
 */

export { agenticChatPlugin as default } from './plugin';

// Re-exports from common (shared between frontend and backend)
export { FileFormat } from './types';
export type {
  ChatMessage,
  ToolCallInfo,
  RAGSource,
  EvaluationResult,
  DocumentInfo,
  ProviderStatus,
  VectorStoreStatus,
  MCPServerStatus,
  SecurityMode,
  AgenticChatStatus,
  VectorStoreInfo,
  WorkflowStep,
  Workflow,
  QuickAction,
  SwimLaneCard,
  SwimLane,
  ConversationSummary,
  ResponseUsage,
  InputTokensDetails,
  OutputTokensDetails,
} from './types';

// Backend-specific public types
export type {
  // Configuration
  AllowedToolSpec,
  ReasoningConfig,
  ToolChoiceConfig,
  LlamaStackConfig,
  FunctionDefinition,
  DirectorySource,
  UrlSource,
  GitHubSource,
  DocumentSource,
  DocumentsConfig,
  FileAttributes,
  // Chat request/response
  ChatRequest,
  ChatResponse,
  UploadDocumentsRequest,
  UploadDocumentsResponse,
  // Streaming events
  StreamingEventBase,
  StreamingResponseCreated,
  StreamingOutputItemAdded,
  StreamingFunctionCallDelta,
  StreamingFunctionCallDone,
  StreamingOutputItemDone,
  StreamingContentPartAdded,
  StreamingTextDelta,
  StreamingContentPartDone,
  StreamingResponseCompleted,
  StreamingEvent,
  // MCP server config
  ApprovalFilter,
  OAuthClientConfig,
  MCPServerOAuthConfig,
  MCPServerServiceAccountConfig,
  MCPAuthConfig,
  MCPServerConfig,
  // Security
  SecurityMcpOAuthConfig,
  SecurityConfig,
  // HITL
  PendingToolApproval,
  ToolApprovalResponse,
  ToolApprovalResult,
  // Safety
  ShieldRegistration,
  SafetyConfig,
  ShieldInfo,
  SafetyViolation,
  SafetyChatResponse,
  // Evaluation
  EvaluationConfig,
  ScoringFunctionInfo,
  ScoreResult,
  EvaluatedChatResponse,
  // Conversation history
  StoredResponse,
  StoredResponseList,
  ResponseInputItem,
  ResponseInputItemList,
} from './types';
