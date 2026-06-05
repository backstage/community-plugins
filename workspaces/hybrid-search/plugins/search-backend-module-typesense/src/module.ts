/*
 * Copyright 2026 The Backstage Authors
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
import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { TypesenseSearchEngine } from './TypesenseSearchEngine';
import { hybridSearchEngineRegistryExtensionPoint } from '@backstage-community/plugin-search-backend-module-hybrid';

/**
 * Search module for Typesense Search.
 *
 * @public
 */
export const searchModuleTypesenseSearch = createBackendModule({
  pluginId: 'search',
  moduleId: 'typesense-search',
  register(env) {
    env.registerInit({
      deps: {
        hybridRegistry: hybridSearchEngineRegistryExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ hybridRegistry, config, logger }) {
        // 1. Load Typesense configuration
        const typesenseConfig = config.getConfig('search.engines.typesense');
        const apiKey = typesenseConfig.getString('apiKey');
        const clientOptions = typesenseConfig.getOptional('clientOptions') as any;
        const collections = typesenseConfig.getOptional('collections') as any;

        const nodes = typesenseConfig.getConfigArray('nodes').map(node => {
          const path = node.getOptionalString('path');
          return {
            host: node.getString('host'),
            port: node.getNumber('port'),
            protocol: node.getString('protocol'),
            ...(path ? { path } : {}),
          };
        });

        logger.info('Initializing Typesense Search Engine for Hybrid Search Router.');
        const typesenseSearchEngine = new TypesenseSearchEngine({
          apiKey,
          nodes,
          clientOptions,
          collections,
          logger,
        });

        // 2. Discover supported types from hybrid routing config
        const routing = config.getOptional('search.engines.hybrid.routing') as
          | Record<string, string>
          | undefined;

        const supportedTypes: string[] = [];
        if (routing) {
          for (const [type, engine] of Object.entries(routing)) {
            if (engine === 'typesense') {
              supportedTypes.push(type);
            }
          }
        }

        // Fallback default: if no explicit mapping exists, handle software-catalog
        if (supportedTypes.length === 0) {
          supportedTypes.push('software-catalog');
        }

        logger.info(
          `Registering Typesense search engine for types: ${JSON.stringify(
            supportedTypes,
          )}`,
        );

        // 3. Register engine to the Hybrid Router registry
        hybridRegistry.registerEngine('typesense', typesenseSearchEngine, {
          supportsTypes: supportedTypes,
        });
      },
    });
  },
});

export default searchModuleTypesenseSearch;
