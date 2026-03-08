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

export { createProvider } from './factory';
export type { ProviderType, CreateProviderOptions } from './factory';
export { ProviderManager } from './ProviderManager';
export type { ProviderFactoryFn } from './ProviderManager';
export {
  PROVIDER_REGISTRY,
  getProviderDescriptor,
  getAllProviderDescriptors,
  isValidProviderType,
} from './registry';
export type {
  AgenticProvider,
  NormalizedStreamEvent,
  AgenticProviderStatus,
  ConversationCapability,
  RAGCapability,
  SafetyCapability,
  EvaluationCapability,
  ConversationSummary,
  ConversationListResult,
  ConversationDetails,
  InputItemsResult,
  ConversationItemsResult,
  ToolApproval,
  ApprovalResult,
  SyncResult,
  SafetyStatus,
  SafetyCheckResult,
  EvalStatus,
} from './types';
