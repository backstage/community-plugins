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
// Extension Point
// =============================================================================
export {
  llmProviderExtensionPoint,
  type LlmProviderExtensionPoint,
} from './extensions';

// =============================================================================
// LLM Providers
// =============================================================================
export { LLMProvider } from './providers';

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
