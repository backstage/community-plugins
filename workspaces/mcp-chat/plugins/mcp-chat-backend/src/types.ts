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
 * Re-exports all shared types from the common package for backward compatibility.
 * New consumers should import directly from `@backstage-community/plugin-mcp-chat-common`.
 */
export {
  // Constants and Enums
  VALID_ROLES,
  MCPServerType,

  // LLM Provider Base Class
  LLMProvider,

  // Types
  type LLMProviderType,
  type MCPServerConfig,
  type MCPServerSecrets,
  type MCPServerFullConfig,
  type MCPServer,
  type MCPServerStatusData,
  type ProviderConfig,
  type ProviderInfo,
  type ProviderConnectionStatus,
  type ProviderStatusData,
  type ChatMessage,
  type ChatResponse,
  type QueryResponse,
  type Tool,
  type ToolCall,
  type ServerTool,
  type ToolExecutionResult,
  type MessageValidationResult,
  type ResponsesApiMcpTool,
  type ResponsesApiMcpListTools,
  type ResponsesApiMcpCall,
  type ResponsesApiMessage,
  type ResponsesApiResponse,
  type ResponsesApiOutputEvent,
  type ConversationRecord,
  type ConversationRow,
} from '@backstage-community/plugin-mcp-chat-common';
