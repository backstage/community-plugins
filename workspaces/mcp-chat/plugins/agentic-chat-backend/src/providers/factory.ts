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
 * Provider Factory
 *
 * Creates the correct AgenticProvider based on app-config.yaml.
 * The provider type is read from `agenticChat.provider` (default: 'llamastack').
 *
 * To add a new provider:
 * 1. Create a new directory under providers/ (e.g., providers/adk/)
 * 2. Implement the AgenticProvider interface
 * 3. Add a case to the switch in createProvider()
 */

import type {
  LoggerService,
  RootConfigService,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import type { ProviderType } from '@backstage-community/plugin-agentic-chat-common';
import type { AdminConfigService } from '../services/AdminConfigService';
import type { AgenticProvider } from './types';
import { LlamaStackProvider } from './llamastack';

export type { ProviderType };

/**
 * Creates an AgenticProvider instance based on configuration.
 *
 * Reads `agenticChat.provider` from app-config.yaml to determine which
 * provider to instantiate. Defaults to 'llamastack' if not specified.
 */
/**
 * Options for creating an AgenticProvider instance.
 * @internal
 */
export interface CreateProviderOptions {
  logger: LoggerService;
  config: RootConfigService;
  database?: DatabaseService;
  adminConfig?: AdminConfigService;
}

/**
 * Creates an AgenticProvider instance based on configuration.
 *
 * Reads `agenticChat.provider` from app-config.yaml to determine which
 * provider to instantiate. Defaults to 'llamastack' if not specified.
 *
 * @param options - Provider dependencies
 * @param overrideType - Override the provider type (used by ProviderManager for hot-swap)
 * @returns An uninitialized AgenticProvider instance
 * @internal
 */
export function createProvider(
  options: CreateProviderOptions,
  overrideType?: ProviderType,
): AgenticProvider {
  const { logger, config, database, adminConfig } = options;

  const providerType: ProviderType =
    overrideType ??
    ((config.getOptionalString('agenticChat.provider') ||
      'llamastack') as ProviderType);

  logger.info(`Creating agentic provider: ${providerType}`);

  switch (providerType) {
    case 'llamastack':
      return new LlamaStackProvider({ logger, config, database, adminConfig });

    case 'googleadk':
      throw new Error(
        'Google ADK provider is not yet implemented. ' +
          'Set agenticChat.provider to "llamastack" in app-config.yaml.',
      );

    default: {
      const _exhaustive: never = providerType;
      throw new Error(
        `Unknown agentic provider: "${_exhaustive}". ` +
          `Check agenticChat.provider in app-config.yaml.`,
      );
    }
  }
}
