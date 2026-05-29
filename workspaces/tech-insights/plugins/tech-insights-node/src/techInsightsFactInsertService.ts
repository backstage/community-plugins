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

import { createServiceRef } from '@backstage/backend-plugin-api';
import { FactLifecycle, FactSchemaDefinition, TechInsightFact } from './facts';

/**
 * A narrow write-only service for inserting facts and fact schemas into the
 * Tech Insights store from outside the built-in fact retriever pipeline.
 *
 * This is intended for backend modules that iterate over their own data
 * sources (for example, an incremental ingestion engine that walks catalog
 * entities in bursts) and need to commit facts directly without registering
 * a `FactRetriever`.
 *
 * Reads should continue to go through the `techInsightsServiceRef` HTTP
 * client — this service exposes no query surface by design.
 *
 * @public
 */
export interface TechInsightsFactInsertService {
  /**
   * Stores a versioned fact schema into the data store. Should be called at
   * least once before inserting facts for a given retriever id/version.
   *
   * Idempotent for a given `(id, version)` pair: if a row already exists,
   * this is a no-op and the existing schema is preserved untouched. To
   * publish a changed schema, bump `version`.
   *
   * Reads of facts continue to flow through `techInsightsServiceRef`.
   */
  insertFactSchema(schemaDefinition: FactSchemaDefinition): Promise<void>;

  /**
   * Stores a collection of facts against the given retriever id. Each entry
   * is associated with an entity and one or more fact values matching the
   * registered schema. Facts are written under the latest schema version
   * registered for `id`, so `insertFactSchema` must have been called first.
   *
   * No-op when `facts` is empty.
   *
   * When `lifecycle` is provided, TTL/`maxItems` pruning runs in the same
   * transaction as the insert, so retention is enforced atomically per call.
   *
   * Reads of facts continue to flow through `techInsightsServiceRef`.
   */
  insertFacts(options: {
    id: string;
    facts: TechInsightFact[];
    lifecycle?: FactLifecycle;
  }): Promise<void>;
}

/**
 * A plugin-scoped service reference for the {@link TechInsightsFactInsertService}.
 *
 * The factory is registered automatically by the default export of
 * `@backstage-community/plugin-tech-insights-backend`:
 *
 * ```ts
 * backend.add(import('@backstage-community/plugin-tech-insights-backend'));
 * ```
 *
 * @public
 */
export const techInsightsFactInsertServiceRef =
  createServiceRef<TechInsightsFactInsertService>({
    id: 'tech-insights.fact-insert',
    scope: 'plugin',
  });
