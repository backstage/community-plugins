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

import { createExtensionPoint } from '@backstage/backend-plugin-api';
import { LLMProvider } from '@backstage-community/plugin-mcp-chat-common';

/**
 * Extension point for registering LLM provider implementations
 * with the mcp-chat backend plugin.
 *
 * @public
 */
export interface LlmProviderExtensionPoint {
  /**
   * Register an LLM provider instance keyed by type string.
   * If a provider with the same type is already registered, it is replaced
   * and a warning is logged.
   */
  registerProvider(type: string, provider: LLMProvider): void;
}

/**
 * Extension point that allows provider modules to register
 * LLM provider implementations with the mcp-chat plugin.
 *
 * @public
 */
export const llmProviderExtensionPoint =
  createExtensionPoint<LlmProviderExtensionPoint>({
    id: 'mcp-chat.llm-provider',
  });
