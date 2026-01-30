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

// =============================================================================
// Plugin
// =============================================================================
export { mcpChatPlugin as default } from './plugin';

// =============================================================================
// LLM Providers
// =============================================================================
export {
  LLMProvider,
  ProviderFactory,
  getProviderConfig,
  getProviderInfo,
  OpenAIProvider,
  OpenAIResponsesProvider,
  ClaudeProvider,
  GeminiProvider,
  OllamaProvider,
  LiteLLMProvider,
} from './providers';

// =============================================================================
// Services
// =============================================================================
export type { MCPClientService } from './services/MCPClientService';
export {
  MCPClientServiceImpl,
  type Options as MCPClientServiceOptions,
} from './services/MCPClientServiceImpl';
export {
  ChatConversationStore,
  type ChatConversationStoreOptions,
} from './services/ChatConversationStore';
export {
  SummarizationService,
  type SummarizationServiceOptions,
} from './services/SummarizationService';

// =============================================================================
// Types
// =============================================================================
export type {
  // Provider types
  ProviderConfig,
  ProviderStatusData,
  ProviderInfo,
  ProviderConnectionStatus,
  LLMProviderType,

  // MCP Server types
  MCPServerConfig,
  MCPServerSecrets,
  MCPServerFullConfig,
  MCPServer,
  MCPServerStatusData,

  // Chat types
  ChatMessage,
  ChatResponse,
  QueryResponse,

  // Tool types
  Tool,
  ToolCall,
  ServerTool,
  ToolExecutionResult,

  // Validation types
  MessageValidationResult,

  // Conversation types
  ConversationRecord,

  // OpenAI Responses API types
  ResponsesApiMcpTool,
  ResponsesApiMcpListTools,
  ResponsesApiMcpCall,
  ResponsesApiMessage,
  ResponsesApiResponse,
  ResponsesApiOutputEvent,
} from './types';

// Enums and Constants
export { MCPServerType, VALID_ROLES } from './types';

// =============================================================================
// Utilities
// =============================================================================
export {
  validateConfig,
  validateMessages,
  loadServerConfigs,
  executeToolCall,
  findNpxPath,
} from './utils';

// =============================================================================
// Router
// =============================================================================
export { createRouter, type RouterOptions } from './router';
