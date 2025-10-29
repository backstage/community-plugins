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
 * @param refs - An array of entity reference strings, or undefined if not yet loaded.
 * @param searchTerm - A string to filter entities by a search term.
 * @param limit - The maximum number of entities to fetch per page.
 * @param kind - The kind of entities to fetch.
 * @returns An object containing the fetched entities, total items count, loading state, error, and a retry function.
 *
 * @public
 */
export const useCatalogEntities = (
  refs: string[] | undefined,
  searchTerm: string = '',
  limit: number = 25,
  kind: string | undefined = undefined,
) => {
  const catalogApi = useApi(catalogApiRef);

  const fetchEntities = async () => {
    if (!refs || refs.length === 0) {
      return {
        items: [],
        totalItems: 0,
      };
    }

    const filterArray = refs.map(refString => {
      const { kind: refKind, namespace, name } = parseEntityRef(refString);
      return {
        kind: refKind,
        'metadata.namespace': namespace,
        'metadata.name': name,
      };
    });

    const queryOptions: any = {
      filter: kind ? filterArray.map(f => ({ ...f, kind })) : filterArray,
      limit,
      orderFields: { field: 'metadata.name', order: 'asc' },
    };

    if (searchTerm.trim() !== '') {
      queryOptions.fullTextFilter = {
        term: searchTerm,
        fields: [
          'metadata.name',
          'kind',
          'spec.profile.displayName',
          'metadata.title',
        ],
      };
    }

    const items: Entity[] = [];
    let response = await catalogApi.queryEntities(queryOptions);
    items.push(...response.items);
    const totalItems = response.totalItems;

    while (response.pageInfo?.nextCursor) {
      response = await catalogApi.queryEntities({
        ...queryOptions,
        cursor: response.pageInfo.nextCursor,
      });
      items.push(...response.items);
    }

    return {
      items,
      totalItems,
    };
  };

  const {
    value: entities,
    loading,
    error,
    retry,
  } = useAsyncRetry(fetchEntities, [catalogApi, refs, searchTerm, limit, kind]);

  return {
    entities: entities?.items ?? [],
    totalItems: entities?.totalItems ?? 0,
    loading,
    error,
    retry,
  };
};
