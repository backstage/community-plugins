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

export {
  FileFormat,
  type ResponseUsage,
  type InputTokensDetails,
  type OutputTokensDetails,
  type ChatMessage,
  type ToolCallInfo,
  type RAGSource,
  type EvaluationResult,
  type DocumentInfo,
  type ProviderStatus,
  type VectorStoreStatus,
  type MCPToolInfo,
  type MCPServerStatus,
  type SecurityMode,
  type AgenticChatStatus,
  type VectorStoreInfo,
  type QuickPrompt,
  type WorkflowStep,
  type Workflow,
  type QuickAction,
  type SwimLaneCard,
  type SwimLane,
  type ConversationSummary,
  type ChatResponse,
  type SyncResult,
} from './shared';

export type {
  NormalizedStreamEvent,
  StreamStartedEvent,
  StreamTextDeltaEvent,
  StreamTextDoneEvent,
  StreamReasoningDeltaEvent,
  StreamReasoningDoneEvent,
  StreamToolDiscoveryEvent,
  StreamToolStartedEvent,
  StreamToolDeltaEvent,
  StreamToolCompletedEvent,
  StreamToolFailedEvent,
  StreamToolApprovalEvent,
  StreamRagResultsEvent,
  StreamCompletedEvent,
  StreamErrorEvent,
} from './streaming';

export {
  DEFAULT_BRANDING,
  type GlassIntensity,
  type GlassConfig,
  type BrandingConfig,
} from './branding';

export type {
  AdminConfigKey,
  AdminConfigEntry,
  RagTestChunk,
  RagTestResult,
  UploadResult,
  VectorStoreConfig,
  VectorStoreCreateResult,
  VectorStoreStatusResult,
} from './admin';

export {
  GLOBAL_CONFIG_KEYS,
  PROVIDER_SCOPED_KEYS,
  scopedConfigKey,
  isProviderScopedKey,
  isGlobalConfigKey,
  type ProviderType,
  type ProviderCapabilities,
  type ProviderConfigField,
  type ProviderDescriptor,
  type GlobalConfigKey,
  type ProviderScopedKey,
} from './provider';
