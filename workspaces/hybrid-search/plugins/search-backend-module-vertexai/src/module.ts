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
import { VertexAISearchEngine } from './VertexAISearchEngine';
import { hybridSearchEngineRegistryExtensionPoint } from '@backstage-community/plugin-search-backend-module-hybrid';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { runCatalogCleanupSweeper } from './catalogCleanup';

/**
 * Search module for Vertex AI Search.
 *
 * @public
 */
export const searchModuleVertexAISearch = createBackendModule({
  pluginId: 'search',
  moduleId: 'vertexai-search',
  register(env) {
    env.registerInit({
      deps: {
        hybridRegistry: hybridSearchEngineRegistryExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
        catalog: catalogServiceRef,
        auth: coreServices.auth,
      },
      async init({ hybridRegistry, config, logger, scheduler, catalog, auth }) {
        // 1. Load Vertex AI configuration
        const vertexAiConfig = config.getConfig('search.engines.vertexai');
        const projectId = vertexAiConfig.getString('projectId');
        const location = vertexAiConfig.getString('location');
        const dataStoreId = vertexAiConfig.getString('dataStoreId');
        const engineId = vertexAiConfig.getOptionalString('engineId');
        const searchOptions = vertexAiConfig.getOptional(
          'searchOptions',
        ) as any;

        logger.info(
          'Initializing Vertex AI Search Engine for Hybrid Search Router.',
        );
        logger.info(
          'Note: TechDocs ingestion must be configured via a companion webhook (e.g., @backstage-community/plugin-events-backend-module-gcs-eventarc) to index new documentation assets.',
        );
        const vertexAiSearchEngine = new VertexAISearchEngine({
          projectId,
          location,
          dataStoreId,
          engineId,
          searchOptions,
          logger,
        });

        // 2. Discover supported types from hybrid routing config
        const routing = config.getOptional('search.engines.hybrid.routing') as
          | Record<string, string>
          | undefined;

        const supportedTypes: string[] = [];
        if (routing) {
          for (const [type, engine] of Object.entries(routing)) {
            if (engine === 'vertexai') {
              supportedTypes.push(type);
            }
          }
        }

        if (supportedTypes.length === 0) {
          supportedTypes.push('techdocs');
        }

        logger.info(
          `Registering Vertex AI search engine for types: ${JSON.stringify(
            supportedTypes,
          )}`,
        );

        // 3. Register engine to the Hybrid Router registry
        hybridRegistry.registerEngine('vertexai', vertexAiSearchEngine, {
          supportsTypes: supportedTypes,
        });

        // 4. Register background cleanup scheduler task if enabled
        const cleanupConfig = vertexAiConfig.getOptionalConfig('cleanup');
        if (cleanupConfig?.getOptionalBoolean('enabled') !== false) {
          const frequencyHours =
            cleanupConfig?.getOptionalNumber('frequency.hours');
          const frequencyMinutes =
            cleanupConfig?.getOptionalNumber('frequency.minutes');
          const frequencySeconds =
            cleanupConfig?.getOptionalNumber('frequency.seconds');

          const frequency: {
            hours?: number;
            minutes?: number;
            seconds?: number;
          } = {};
          if (frequencySeconds !== undefined) {
            frequency.seconds = frequencySeconds;
          } else if (
            frequencyHours !== undefined ||
            frequencyMinutes !== undefined
          ) {
            if (frequencyHours !== undefined) frequency.hours = frequencyHours;
            if (frequencyMinutes !== undefined)
              frequency.minutes = frequencyMinutes;
          } else {
            frequency.hours = 2;
          }

          logger.info(
            `Registering TechDocs Catalog Cleanup task with frequency: ${JSON.stringify(
              frequency,
            )}.`,
          );

          await scheduler.scheduleTask({
            id: 'techdocs-orphan-sweeper',
            frequency: frequency,
            timeout: { minutes: 30 },
            fn: () =>
              runCatalogCleanupSweeper({ config, logger, catalog, auth }),
          });
        } else {
          logger.info('TechDocs Catalog Cleanup task is disabled in config.');
        }
      },
    });
  },
});

export default searchModuleVertexAISearch;
