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
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity, parseEntityRef } from '@backstage/catalog-model';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';

/**
 * Hook to fetch catalog entities based on entity references.
 *
 * @param refs - An array of entity reference strings.
 * @returns An object containing the fetched entities, loading state, error, and a retry function.
 *
 * @public
 */
export const useCatalogEntities = (refs: string[]) => {
  const catalogApi = useApi(catalogApiRef);

  const {
    value: entities,
    loading,
    error,
    retry,
  } = useAsyncRetry(async () => {
    if (!refs.length) {
      return [];
    }

    const filter = refs.map(refString => {
      const { kind, namespace, name } = parseEntityRef(refString);
      return {
        kind,
        'metadata.namespace': namespace,
        'metadata.name': name,
      };
    });

    const items: Entity[] = [];
    let response = await catalogApi.queryEntities({ filter });
    items.push(...response.items);

    while (response.pageInfo.nextCursor && response.items.length > 0) {
      response = await catalogApi.queryEntities({
        cursor: response.pageInfo.nextCursor,
      });
      items.push(...response.items);
    }

    return items;
  }, [catalogApi, refs]);

  return { entities: entities ?? [], loading, error, retry };
};
