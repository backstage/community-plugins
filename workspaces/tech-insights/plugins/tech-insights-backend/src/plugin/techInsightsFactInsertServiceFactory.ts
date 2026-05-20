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
  createServiceFactory,
} from '@backstage/backend-plugin-api';
import { techInsightsFactInsertServiceRef } from '@backstage-community/plugin-tech-insights-node';
import { initializePersistenceContext } from '../service/persistence';

/**
 * A plugin-scoped service factory that provides the {@link TechInsightsFactInsertService}.
 *
 * Enables backend modules (such as incremental fact retrievers) to insert facts
 * and schemas into the tech insights store without requiring direct database access.
 *
 * This factory is bundled into the default export of
 * `@backstage-community/plugin-tech-insights-backend` and is registered
 * automatically when the package is added to a backend:
 *
 * ```ts
 * backend.add(import('@backstage-community/plugin-tech-insights-backend'));
 * ```
 *
 * It is also exported as a named symbol so it can be added explicitly when
 * consuming `techInsightsPlugin` directly:
 *
 * ```ts
 * backend.add(techInsightsPlugin);
 * backend.add(techInsightsFactInsertServiceFactory);
 * ```
 *
 * @public
 */
export const techInsightsFactInsertServiceFactory = createServiceFactory({
  service: techInsightsFactInsertServiceRef,
  deps: {
    database: coreServices.database,
    logger: coreServices.logger,
  },
  async factory({ database, logger }) {
    // `initializePersistenceContext` is memoized per `DatabaseService`
    // instance, so this shares the same Knex pool and migrations run as
    // `techInsightsPlugin` when both are added to the same backend.
    const { techInsightsStore } = await initializePersistenceContext(database, {
      logger,
    });

    // Return an adapter rather than the store itself. The store implements
    // many read methods that are intentionally *not* part of the public
    // `TechInsightsFactInsertService` contract (reads should go through
    // `techInsightsServiceRef`). Without this wrapper, a caller could cast
    // the service to the store interface at runtime and reach the reads.
    return {
      insertFactSchema: schemaDefinition =>
        techInsightsStore.insertFactSchema(schemaDefinition),
      insertFacts: options => techInsightsStore.insertFacts(options),
    };
  },
});
