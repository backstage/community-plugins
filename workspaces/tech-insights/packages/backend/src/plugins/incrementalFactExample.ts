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

/**
 * Example showing how to insert tech insights facts from an incremental
 * entity provider via `techInsightsFactInsertServiceRef`, without
 * registering a `FactRetriever`.
 *
 * This is example backend code, not a published plugin — see the
 * "Inserting facts from an external module" section of the
 * `plugin-tech-insights-backend` README for the same pattern presented as
 * copy-paste documentation.
 */

import {
  coreServices,
  createBackendFeatureLoader,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  incrementalIngestionProvidersExtensionPoint,
  type EntityIteratorResult,
} from '@backstage/plugin-catalog-backend-module-incremental-ingestion';
import { CatalogClient } from '@backstage/catalog-client';
import type { Entity } from '@backstage/catalog-model';
import {
  techInsightsFactInsertServiceRef,
  type TechInsightsFactInsertService,
} from '@backstage-community/plugin-tech-insights-node';

/**
 * Identifier and version of the example fact source. The pair must be
 * stable so that `insertFactSchema` is idempotent across restarts.
 *
 * Intentionally not suffixed `-fact-retriever` — the whole point of this
 * example is that facts are written *without* registering a `FactRetriever`.
 */
const EXAMPLE_FACT_ID = 'example-incremental-facts';
const EXAMPLE_FACT_VERSION = '0.1.0';

/**
 * Shared holder used to hand the tech-insights-scoped service from the
 * `tech-insights` module to the `catalog` module. They cannot live in the
 * same backend module because their dependencies belong to two different
 * plugin scopes.
 */
const factInsertHolder: { current?: TechInsightsFactInsertService } = {};

/**
 * Stand-in for a real external API call. Returns the length of the entity
 * name as the fact value.
 */
async function fetchExampleCount(entity: Entity): Promise<number> {
  return entity.metadata.name.length;
}

/**
 * Module on `tech-insights`: captures the fact-insert service (which binds
 * to the tech insights plugin database) and registers the fact schema once
 * at startup.
 */
const techInsightsModuleIncrementalExample = createBackendModule({
  pluginId: 'tech-insights',
  moduleId: 'incremental-example-capture',
  register(env) {
    env.registerInit({
      deps: {
        factInsert: techInsightsFactInsertServiceRef,
      },
      async init({ factInsert }) {
        factInsertHolder.current = factInsert;
        await factInsert.insertFactSchema({
          id: EXAMPLE_FACT_ID,
          version: EXAMPLE_FACT_VERSION,
          entityFilter: [{ kind: 'Component' }],
          schema: {
            exampleCount: {
              type: 'integer',
              description: 'An example numeric fact for the entity',
            },
          },
        });
      },
    });
  },
});

/**
 * Module on `catalog`: registers an incremental entity provider whose
 * `next()` walks `Component` entities one at a time, calls a stand-in
 * external API, and writes a single fact per iteration via the captured
 * fact-insert service. Returns `entities: []` so the catalog is never
 * mutated — the incremental engine is used purely as a resumable
 * scheduler.
 */
const catalogModuleIncrementalExample = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'incremental-example-fact-ingestion',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        discovery: coreServices.discovery,
        incremental: incrementalIngestionProvidersExtensionPoint,
      },
      async init({ logger, auth, discovery, incremental }) {
        incremental.addProvider({
          options: {
            burstLength: { seconds: 3 },
            burstInterval: { seconds: 1 },
            restLength: { seconds: 15 },
          },
          provider: {
            getProviderName: () => EXAMPLE_FACT_ID,

            async around(burst) {
              const catalog = new CatalogClient({ discoveryApi: discovery });
              await burst({ catalog });
            },

            async next(
              { catalog }: { catalog: CatalogClient },
              cursor: { offset: number } = { offset: 0 },
            ): Promise<EntityIteratorResult<{ offset: number }>> {
              const factInsert = factInsertHolder.current;
              if (!factInsert) {
                throw new Error(
                  'TechInsightsFactInsertService not yet initialized; ' +
                    'is techInsightsModuleIncrementalExample added to the backend?',
                );
              }

              const { token } = await auth.getPluginRequestToken({
                onBehalfOf: await auth.getOwnServiceCredentials(),
                targetPluginId: 'catalog',
              });

              const { items } = await catalog.getEntities(
                {
                  filter: { kind: 'Component' },
                  limit: 1,
                  offset: cursor.offset,
                  order: { field: 'metadata.name', order: 'asc' },
                },
                { token },
              );
              const entity = items[0];

              if (!entity) {
                return {
                  done: true,
                  entities: [],
                  cursor: { offset: cursor.offset },
                };
              }

              await factInsert.insertFacts({
                id: EXAMPLE_FACT_ID,
                facts: [
                  {
                    entity: {
                      namespace: entity.metadata.namespace ?? 'default',
                      kind: entity.kind,
                      name: entity.metadata.name,
                    },
                    facts: {
                      exampleCount: await fetchExampleCount(entity),
                    },
                  },
                ],
                lifecycle: { timeToLive: { weeks: 2 } },
              });

              return {
                done: false,
                entities: [],
                cursor: { offset: cursor.offset + 1 },
              };
            },
          },
        });

        logger.info(
          `Registered example incremental fact ingestion: ${EXAMPLE_FACT_ID}`,
        );
      },
    });
  },
});

/**
 * Default export bundles both modules so they can be added with a single
 * `backend.add(...)` call from `index.ts`.
 */
export default createBackendFeatureLoader({
  loader: () => [
    techInsightsModuleIncrementalExample,
    catalogModuleIncrementalExample,
  ],
});
