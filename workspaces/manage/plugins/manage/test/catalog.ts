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
import { Entity, RELATION_OWNED_BY } from '@backstage/catalog-model';
import type { QueryEntitiesInitialRequest } from '@backstage/catalog-client';
import type { CatalogApi } from '@backstage/plugin-catalog-react';

const entities: Record<string, Entity> = {
  'user:default/guest': {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'User',
    metadata: {
      name: 'Guest',
    },
  },
  'component:default/foo': {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'foo',
      title: 'The Foo',
    },
    relations: [
      {
        type: RELATION_OWNED_BY,
        targetRef: 'user:default/guest',
      },
    ],
  },
};

function makeQueryEntitiesResponse(items: Entity[]) {
  return {
    items,
    totalItems: items.length,
    pageInfo: {},
  };
}

export interface MockCatalogApiOptions {
  empty?: boolean;
}

export const mockCatalogApi = (
  options: MockCatalogApiOptions = {},
): Partial<CatalogApi> => {
  return {
    getEntities: async () => ({ items: [] }),
    getEntitiesByRefs: async request => {
      return { items: request.entityRefs.map(ref => entities[ref]) };
    },
    queryEntities: async (request: QueryEntitiesInitialRequest) => {
      if (request.filter && !options.empty) {
        return makeQueryEntitiesResponse(
          [request.filter]
            .flat()
            .flatMap(filter =>
              filter[`relations.${RELATION_OWNED_BY}`]
                ? Object.values(entities).filter(entity =>
                    entity.relations?.some(
                      rel =>
                        rel.type === RELATION_OWNED_BY &&
                        rel.targetRef ===
                          filter[`relations.${RELATION_OWNED_BY}`],
                    ),
                  )
                : [],
            ),
        );
      }

      return makeQueryEntitiesResponse([]);
    },
  };
};
