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

import { LoggerService } from '@backstage/backend-plugin-api';

// =============================================================================
// LLM Provider Configuration Types
// =============================================================================

/**
 * Configuration for an LLM provider.
 *
 * @example
 * ```typescript
 * const openaiConfig: ProviderConfig = {
 *   type: 'openai',
 *   apiKey: 'sk-...',
 *   baseUrl: 'https://api.openai.com/v1',
 *   model: 'gpt-4'
 * };
 *
 * const ollamaConfig: ProviderConfig = {
 *   type: 'ollama',
 *   baseUrl: 'http://localhost:11434',
 *   model: 'llama2'
 * };
 * ```
 *
 * @public
 */
export interface ProviderConfig {
  /** Provider type identifier */
  type: string;
  /** API key for authentication (optional for local providers like Ollama) */
  apiKey?: string;
  /** Base URL for the provider's API */
  baseUrl: string;
  /** Model identifier to use */
  model: string;
  /** Logger for debugging */
  logger?: LoggerService;
}
