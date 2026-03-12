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

import type {
  ProviderType,
  ProviderDescriptor,
} from '@backstage-community/plugin-agentic-chat-common';

/**
 * Static registry of all known AI providers.
 *
 * Each entry describes a provider's identity, capabilities, and
 * config field definitions. Entries with `implemented: false` are
 * shown as disabled placeholders in the admin UI.
 *
 * To add a new provider:
 * 1. Add a case to the `ProviderType` union in common
 * 2. Add a descriptor entry here
 * 3. Create the provider implementation under `providers/<id>/`
 * 4. Add a case in `factory.ts`
 *
 * @internal
 */
export const PROVIDER_REGISTRY: ReadonlyMap<ProviderType, ProviderDescriptor> =
  new Map<ProviderType, ProviderDescriptor>([
    [
      'llamastack',
      {
        id: 'llamastack',
        displayName: 'Llama Stack',
        description:
          'Meta Llama Stack -- open-source AI inference and agentic platform',
        implemented: true,
        capabilities: {
          chat: true,
          rag: true,
          safety: true,
          evaluation: true,
          conversations: true,
          mcpTools: true,
        },
        configFields: [
          {
            key: 'model',
            label: 'Model',
            type: 'string',
            required: true,
            description: 'LLM model identifier on the inference server',
            placeholder: 'meta-llama/Llama-3.3-8B-Instruct',
          },
          {
            key: 'baseUrl',
            label: 'Server URL',
            type: 'string',
            required: true,
            description: 'Base URL of the Llama Stack server',
            placeholder: 'http://localhost:8321',
          },
          {
            key: 'toolChoice',
            label: 'Tool Choice',
            type: 'select',
            required: false,
            description: 'How the model should use tools',
            options: ['auto', 'required', 'none'],
          },
          {
            key: 'enableWebSearch',
            label: 'Web Search',
            type: 'boolean',
            required: false,
            description: 'Enable built-in web search tool',
          },
          {
            key: 'enableCodeInterpreter',
            label: 'Code Interpreter',
            type: 'boolean',
            required: false,
            description: 'Enable built-in code interpreter tool',
          },
          {
            key: 'mcpProxyUrl',
            label: 'MCP Proxy URL',
            type: 'string',
            required: false,
            description:
              'URL where LlamaStack can reach the backend MCP proxy. Defaults to backend.baseUrl.',
            placeholder: 'https://my-backstage.example.com/api/agentic-chat',
          },
        ],
      },
    ],
    [
      'googleadk',
      {
        id: 'googleadk',
        displayName: 'Google ADK',
        description:
          'Google Agent Development Kit -- build agents with Gemini models',
        implemented: false,
        capabilities: {
          chat: true,
          rag: false,
          safety: false,
          evaluation: false,
          conversations: true,
          mcpTools: true,
        },
        configFields: [],
      },
    ],
  ]);

/**
 * Get a provider descriptor by ID.
 *
 * @param id - The provider type identifier
 * @returns The descriptor, or `undefined` if not found
 * @internal
 */
export function getProviderDescriptor(
  id: ProviderType,
): ProviderDescriptor | undefined {
  return PROVIDER_REGISTRY.get(id);
}

/**
 * Get all provider descriptors as an array, sorted by display name.
 *
 * @returns All known provider descriptors
 * @internal
 */
export function getAllProviderDescriptors(): readonly ProviderDescriptor[] {
  return [...PROVIDER_REGISTRY.values()].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
}

/**
 * Check whether a provider type ID is valid (exists in the registry).
 *
 * @param id - The string to check
 * @returns `true` if the ID maps to a known provider
 * @internal
 */
export function isValidProviderType(id: string): id is ProviderType {
  return PROVIDER_REGISTRY.has(id as ProviderType);
}
