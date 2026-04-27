/*
 * Copyright 2021 The Backstage Authors
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
  CatalogClient,
  EntityFilterQuery,
  QueryEntitiesResponse,
} from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import { FilterPredicate } from '@backstage/filter-predicates';
import {
  EntityFilter,
  FactRetrieverContext,
} from '@backstage-community/plugin-tech-insights-node';

/**
 * Determines whether a given entityFilter value is a FilterPredicate
 * rather than the legacy EntityFilterQuery format.
 *
 * Detection rules:
 * - Primitives (string, number, boolean) → FilterPredicate only
 * - Arrays → legacy only (EntityFilterQuery OR-array)
 * - Objects with $-prefixed keys ($all, $any, $not) → FilterPredicate
 * - Objects with symbol values → legacy (CATALOG_FILTER_EXISTS)
 * - Objects with object values ($in, $exists, etc.) → FilterPredicate
 * - Simple string-keyed, string-valued objects → ambiguous, treated as
 *   FilterPredicate since both formats handle them identically
 */
function isFilterPredicate(
  filter: EntityFilter | undefined,
): filter is FilterPredicate {
  if (filter === undefined) {
    return false;
  }

  // FilterPredicate can be a primitive (string | number | boolean)
  // Legacy EntityFilterQuery is always a Record or Record[]
  if (typeof filter !== 'object' || filter === null) {
    return true;
  }

  // Legacy format can be an array of records — FilterPredicate is never a raw array
  if (Array.isArray(filter)) {
    return false;
  }

  // Objects with $-prefixed operator keys are always FilterPredicate
  if ('$all' in filter || '$any' in filter || '$not' in filter) {
    return true;
  }

  // Inspect values to distinguish the two formats
  for (const value of Object.values(filter)) {
    // Legacy format uses symbols (CATALOG_FILTER_EXISTS)
    if (typeof value === 'symbol') {
      return false;
    }
    if (Array.isArray(value) && value.some(v => typeof v === 'symbol')) {
      return false;
    }
    // Object values ($in, $exists, $contains, $hasPrefix) are FilterPredicate-only
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return true;
    }
  }

  // Simple { kind: 'component' } style — valid in both formats.
  // Route through queryEntities (FilterPredicate path) since it handles
  // this shape correctly and is the forward-looking API.
  return true;
}

/**
 * Fetches all entities matching a FilterPredicate using queryEntities with
 * cursor-based pagination, collecting all pages into a single array.
 */
async function queryAllEntities(
  catalogClient: CatalogClient,
  query: FilterPredicate,
  token: string,
): Promise<Entity[]> {
  const entities: Entity[] = [];
  let response: QueryEntitiesResponse | undefined;
  let cursor: string | undefined;

  do {
    response = await catalogClient.queryEntities(
      cursor ? { cursor } : { query },
      { token },
    );
    entities.push(...response.items);
    cursor = response.pageInfo.nextCursor;
  } while (cursor);

  return entities;
}

/**
 * Fetches entities from the catalog, supporting both the legacy EntityFilterQuery
 * format and the new FilterPredicate format from `@backstage/filter-predicates`.
 *
 * When a FilterPredicate is provided, uses `queryEntities` with the `query`
 * parameter for server-side predicate-based filtering.
 *
 * When the legacy format is provided (arrays or objects with symbol values),
 * uses `getEntities` with the `filter` parameter.
 *
 * @internal
 */
export async function getFilteredEntities(options: {
  discovery: FactRetrieverContext['discovery'];
  auth: FactRetrieverContext['auth'];
  entityFilter: FactRetrieverContext['entityFilter'];
}): Promise<Entity[]> {
  const { discovery, auth, entityFilter } = options;

  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });

  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  if (entityFilter !== undefined && isFilterPredicate(entityFilter)) {
    return queryAllEntities(catalogClient, entityFilter, token);
  }

  // Legacy EntityFilterQuery: pass directly to catalog
  const response = await catalogClient.getEntities(
    { filter: entityFilter as EntityFilterQuery },
    { token },
  );
  return response.items;
}
