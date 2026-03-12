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
// Provider Types
// =============================================================================

/**
 * Supported AI provider identifiers.
 *
 * Each value maps 1-to-1 with a provider implementation directory
 * under `providers/` in the backend, and with a descriptor entry
 * in the provider registry.
 *
 * @public
 */
export type ProviderType = 'llamastack' | 'googleadk';

/**
 * Capability categories that a provider may support.
 *
 * Used by the admin panel to conditionally render config tabs
 * and by the backend to gate API endpoints.
 *
 * @public
 */
export interface ProviderCapabilities {
  readonly chat: boolean;
  readonly rag: boolean;
  readonly safety: boolean;
  readonly evaluation: boolean;
  readonly conversations: boolean;
  readonly mcpTools: boolean;
}

/**
 * Definition of a single provider-specific config field.
 *
 * The admin panel uses these to render dynamic forms based
 * on which provider is active.
 *
 * @public
 */
export interface ProviderConfigField {
  /** Config key (matches AdminConfigKey) */
  readonly key: string;
  /** Human-readable label for the form field */
  readonly label: string;
  /** Field type determines the form control rendered */
  readonly type: 'string' | 'boolean' | 'number' | 'select';
  /** Whether the field is required for the provider to function */
  readonly required: boolean;
  /** Help text shown below the field */
  readonly description?: string;
  /** Options for 'select' type fields */
  readonly options?: readonly string[];
  /** Placeholder text for text inputs */
  readonly placeholder?: string;
}

/**
 * Describes an AI provider's identity, capabilities, and config shape.
 *
 * The provider registry holds one descriptor per known provider,
 * including placeholders for providers that are not yet implemented.
 *
 * @public
 */
export interface ProviderDescriptor {
  /** Unique provider identifier */
  readonly id: ProviderType;
  /** Human-readable display name (e.g., "Llama Stack") */
  readonly displayName: string;
  /** Short description of the provider */
  readonly description: string;
  /** Whether this provider has a working implementation */
  readonly implemented: boolean;
  /** Which capability categories this provider supports */
  readonly capabilities: ProviderCapabilities;
  /** Provider-specific config field definitions for the admin panel */
  readonly configFields: readonly ProviderConfigField[];
}

// =============================================================================
// Config Key Scoping
// =============================================================================

/**
 * Config keys that are shared across all providers.
 *
 * These are stored without a provider prefix and apply
 * regardless of which provider is active.
 *
 * @public
 */
export const GLOBAL_CONFIG_KEYS = [
  'systemPrompt',
  'branding',
  'swimLanes',
  'safetyPatterns',
  'mcpServers',
  'disabledMcpServerIds',
  'mcpProxyUrl',
] as const;

/**
 * Config keys that are scoped per provider.
 *
 * When stored in the database, these are prefixed with the
 * provider ID (e.g., `llamastack::model`). This allows each
 * provider to retain its own settings when switching.
 *
 * @public
 */
export const PROVIDER_SCOPED_KEYS = [
  'model',
  'baseUrl',
  'toolChoice',
  'enableWebSearch',
  'enableCodeInterpreter',
  'safetyEnabled',
  'inputShields',
  'outputShields',
  'safetyOnError',
  'evaluationEnabled',
  'scoringFunctions',
  'minScoreThreshold',
  'evaluationOnError',
  'vectorStoreConfig',
  'activeVectorStoreIds',
] as const;

/**
 * Type-safe element of {@link GLOBAL_CONFIG_KEYS}.
 * @public
 */
export type GlobalConfigKey = (typeof GLOBAL_CONFIG_KEYS)[number];

/**
 * Type-safe element of {@link PROVIDER_SCOPED_KEYS}.
 * @public
 */
export type ProviderScopedKey = (typeof PROVIDER_SCOPED_KEYS)[number];

/**
 * Build a provider-scoped config key for database storage.
 *
 * @param provider - The provider ID to scope under
 * @param key - The base config key
 * @returns A scoped key in the format `provider::key`
 * @public
 */
export function scopedConfigKey(provider: ProviderType, key: string): string {
  return `${provider}::${key}`;
}

/**
 * Check whether a config key is provider-scoped.
 *
 * @param key - The config key to check
 * @returns `true` if the key should be stored per-provider
 * @public
 */
export function isProviderScopedKey(key: string): key is ProviderScopedKey {
  return (PROVIDER_SCOPED_KEYS as readonly string[]).includes(key);
}

/**
 * Check whether a config key is global (shared across providers).
 *
 * @param key - The config key to check
 * @returns `true` if the key is shared across all providers
 * @public
 */
export function isGlobalConfigKey(key: string): key is GlobalConfigKey {
  return (GLOBAL_CONFIG_KEYS as readonly string[]).includes(key);
}
