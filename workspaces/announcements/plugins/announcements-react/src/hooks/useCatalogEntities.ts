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
import { parseEntityRef } from '@backstage/catalog-model';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';

/**
 * Hook to fetch catalog entities based on entity references.
 *
 * @param refs - An array of entity reference strings.
 * @param searchTerm - A string to filter entities by a search term.
 * @param limit - The maximum number of entities to fetch.
 * @param offset - The number of entities to skip before starting to fetch.
 * @returns An object containing the fetched entities, total items count, loading state, error, and a retry function.
 *
 * @public
 */
export const useCatalogEntities = (
  refs: string[],
  searchTerm: string = '',
  limit: number = 10,
  offset: number = 0,
) => {
  const catalogApi = useApi(catalogApiRef);

  const fetchEntities = async () => {
    const queryOptions: any = {
      filter: refs.map(refString => {
        const { kind, namespace, name } = parseEntityRef(refString);
        return {
          kind,
          'metadata.namespace': namespace,
          'metadata.name': name,
        };
      }),
      limit,
      offset,
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

    const response = await catalogApi.queryEntities(queryOptions);
    return { items: response.items, totalItems: response.totalItems };
  };

  const {
    value: entities,
    loading,
    error,
    retry,
  } = useAsyncRetry(fetchEntities, [
    catalogApi,
    refs,
    searchTerm,
    limit,
    offset,
  ]);

  return {
    entities: entities?.items ?? [],
    totalItems: entities?.totalItems ?? 0,
    loading,
    error,
    retry,
  };
};
