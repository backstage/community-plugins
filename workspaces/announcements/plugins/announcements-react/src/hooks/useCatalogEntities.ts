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
import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useMemo } from 'react';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';

/**
 * Hook to fetch catalog entities based on entity references.
 *
 * @param refs - An array of entity reference strings, or undefined if not yet loaded.
 * @param searchTerm - A string to filter entities by a search term.
 * @param kind - The kind of entities to fetch.
 * @returns An object containing the fetched entities, total items count, loading state, error, and a retry function.
 *
 * @public
 */
export const useCatalogEntities = (
  refs: string[] | undefined,
  searchTerm: string = '',
  kind: string | undefined = undefined,
) => {
  const catalogApi = useApi(catalogApiRef);

  const uniqueSortedRefs = useMemo(
    () =>
      refs
        ? JSON.stringify(refs.slice().sort((a, b) => a.localeCompare(b)))
        : undefined,
    [refs],
  );

  const {
    value: entities,
    loading,
    error,
    retry,
  } = useAsyncRetry(async () => {
    if (!refs || refs.length === 0) {
      return {
        items: [],
        totalItems: 0,
      };
    }

    const response = await catalogApi.getEntitiesByRefs({
      entityRefs: refs,
    });

    // Filter out undefined entries (entities not found)
    let items: Entity[] = response.items.filter(
      (item): item is Entity => item !== undefined,
    );

    // Filter by kind if specified
    if (kind) {
      const lowerKind = kind.toLowerCase();
      items = items.filter(item => item.kind.toLowerCase() === lowerKind);
    }

    // Filter by search term if specified
    if (searchTerm.trim() !== '') {
      const lowerTerm = searchTerm.toLowerCase();
      items = items.filter(item => {
        const name = item.metadata.name.toLowerCase();
        const title = item.metadata.title?.toLowerCase();
        const displayName = (
          item.spec?.profile as any
        )?.displayName?.toLowerCase();

        return (
          name.includes(lowerTerm) ||
          title?.includes(lowerTerm) ||
          displayName?.includes(lowerTerm)
        );
      });
    }

    // Sort by name
    items.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));

    return {
      items,
      totalItems: items.length,
    };
  }, [catalogApi, uniqueSortedRefs, searchTerm, kind]);

  return {
    entities: entities?.items ?? [],
    totalItems: entities?.totalItems ?? 0,
    loading,
    error,
    retry,
  };
};
