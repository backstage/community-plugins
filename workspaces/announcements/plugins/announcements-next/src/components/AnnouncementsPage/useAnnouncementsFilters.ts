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

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

interface AnnouncementFilters {
  search: string;
  category: string;
  tags: string[];
}

interface AnnouncementFiltersResult {
  filters: AnnouncementFilters;
  setSearch: (query: string) => void;
  setCategory: (category: string) => void;
  toggleTag: (tagSlug: string) => void;
  removeTag: (tagSlug: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Hook for managing announcement filters via URL search params.
 * Enables shareable/bookmarkable filter states.
 */
export function useAnnouncementFilters(): AnnouncementFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<AnnouncementFilters>(
    () => ({
      search: searchParams.get('q') ?? '',
      category: searchParams.get('category') ?? 'all',
      tags: searchParams.getAll('tag') ?? [],
    }),
    [searchParams],
  );

  const setSearch = useCallback(
    (query: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (query.trim()) {
          next.set('q', query.trim());
        } else {
          next.delete('q');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const setCategory = useCallback(
    (category: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (category && category !== 'all') {
          next.set('category', category);
        } else {
          next.delete('category');
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const toggleTag = useCallback(
    (tagSlug: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        const currentTags = next.getAll('tag');

        next.delete('tag');

        if (currentTags.includes(tagSlug)) {
          currentTags
            .filter(t => t !== tagSlug)
            .forEach(t => next.append('tag', t));
        } else {
          [...currentTags, tagSlug].forEach(t => next.append('tag', t));
        }

        return next;
      });
    },
    [setSearchParams],
  );

  const removeTag = useCallback(
    (tagSlug: string) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        const currentTags = next.getAll('tag').filter(t => t !== tagSlug);
        next.delete('tag');
        currentTags.forEach(t => next.append('tag', t));
        return next;
      });
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(
    () =>
      filters.search !== '' ||
      filters.category !== 'all' ||
      filters.tags.length > 0,
    [filters],
  );

  return {
    filters,
    setSearch,
    setCategory,
    toggleTag,
    removeTag,
    clearFilters,
    hasActiveFilters,
  };
}
