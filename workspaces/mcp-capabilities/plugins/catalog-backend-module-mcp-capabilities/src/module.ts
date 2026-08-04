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
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { catalogModelExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { CatalogModelSources } from '@backstage/catalog-model/alpha';
import { mcpServerEnrichmentModelLayer } from '@backstage-community/plugin-mcp-capabilities-common';
import {
  EnrichmentFields,
  McpServerCapabilitiesProcessor,
} from './processor/McpServerCapabilitiesProcessor';

/**
 * Opt-in catalog module that enriches native `API` / `spec.type: 'mcp-server'`
 * entities with a discovered summary (capabilities, counts, server identity,
 * tool names). Adding this module both registers the enrichment processor and
 * extends the catalog model so the enriched fields validate on the entity.
 *
 * @public
 */
export const catalogModuleMcpCapabilities = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'mcp-capabilities',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        model: catalogModelExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ catalog, model, logger, config }) {
        const enrichment = config.getOptionalConfig(
          'mcpCapabilities.enrichment',
        );
        const ttlMinutes = enrichment?.getOptionalNumber('ttlMinutes') ?? 10;
        const fields: EnrichmentFields =
          enrichment?.getOptionalString('fields') === 'names'
            ? 'names'
            : 'summary';

        catalog.addProcessor(
          new McpServerCapabilitiesProcessor({
            logger,
            ttlMs: ttlMinutes * 60 * 1000,
            fields,
          }),
        );
        model.addModelSource(
          CatalogModelSources.static([mcpServerEnrichmentModelLayer]),
        );
      },
    });
  },
});
