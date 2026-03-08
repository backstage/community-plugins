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

export { useAbortController } from './useAbortController';
export {
  useStreamingStateBatching,
  type UseStreamingStateBatchingOptions,
} from './useStreamingStateBatching';
export { useChatSessions } from './useChatSessions';
export { useStatus } from './useStatus';
export { useBackendStatus } from './useBackendStatus';
export {
  useAdminView,
  type ViewMode,
  type AdminPanel,
  type UseAdminViewOptions,
  type UseAdminViewReturn,
} from './useAdminView';
export { useDocuments } from './useDocuments';
export { useBranding, dispatchBrandingRefresh } from './useBranding';
export {
  useStreamingChat,
  type Message,
  type UseStreamingChatOptions,
  type UseStreamingChatReturn,
} from './useStreamingChat';
export {
  useToolApproval,
  type UseToolApprovalOptions,
  type UseToolApprovalReturn,
} from './useToolApproval';
export { useAdminConfig } from './useAdminConfig';
export { useEffectiveConfig } from './useEffectiveConfig';
export { useGeneratePrompt } from './useGeneratePrompt';
export { useModels, type ModelInfo } from './useModels';
export { useProviders } from './useProviders';
export { useFileUpload } from './useFileUpload';
export { useRagTest } from './useRagTest';
export { useVectorStoreConfig } from './useVectorStoreConfig';
export { useVectorStores, type ActiveVectorStore } from './useVectorStores';
export { useSafetyStatus } from './useSafetyStatus';
export { useEvaluationStatus } from './useEvaluationStatus';
export {
  useAgentCapabilities,
  type DiscoveredTool,
  type ConfiguredMcpServer,
  type AgentCapabilities,
} from './useAgentCapabilities';
export {
  useApiQuery,
  type UseApiQueryOptions,
  type UseApiQueryResult,
} from './useApiQuery';
export { useToast, type ToastSeverity, type UseToastReturn } from './useToast';
export { useFormState, type UseFormStateReturn } from './useFormState';
export { useConfigSync } from './useConfigSync';
export { useWelcomeData } from './useWelcomeData';
export { useChatKeyboardShortcuts } from './useChatKeyboardShortcuts';
export { useScrollToBottom } from './useScrollToBottom';
