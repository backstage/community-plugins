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
import { useState, useCallback, useRef, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import type { VectorStoreInfo } from '../types';
import { normalizeErrorMessage } from '../utils';
import { useApiQuery } from './useApiQuery';

export type ActiveVectorStore = VectorStoreInfo & { active: boolean };

export function useVectorStores() {
  const api = useApi(agenticChatApiRef);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [errorCleared, setErrorCleared] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetcher = useCallback(
    () => api.listActiveVectorStores().then(r => r.stores),
    [api],
  );

  const {
    data: stores,
    loading,
    error: fetchError,
    refresh: baseRefresh,
  } = useApiQuery<ActiveVectorStore[]>({
    fetcher,
    initialValue: [] as ActiveVectorStore[],
  });

  // Auto-select first store when stores change and no valid selection exists
  const prevStoresRef = useRef<ActiveVectorStore[]>([]);
  if (stores !== prevStoresRef.current) {
    prevStoresRef.current = stores;
    if (stores.length > 0) {
      if (!selectedStoreId || !stores.find(s => s.id === selectedStoreId)) {
        setSelectedStoreId(stores[0].id);
      }
    } else if (selectedStoreId !== null) {
      setSelectedStoreId(null);
    }
  }

  const error = localError ?? (errorCleared ? null : fetchError);
  const clearError = useCallback(() => {
    setLocalError(null);
    setErrorCleared(true);
  }, []);

  const refresh = useCallback(async () => {
    setErrorCleared(false);
    setLocalError(null);
    return baseRefresh();
  }, [baseRefresh]);

  const removeStore = useCallback(
    async (vectorStoreId: string, permanent?: boolean) => {
      setLocalError(null);
      try {
        await api.removeVectorStore(vectorStoreId, permanent);
        await refresh();
      } catch (err) {
        if (mountedRef.current) {
          setLocalError(normalizeErrorMessage(err, 'Failed to remove store'));
        }
      }
    },
    [api, refresh],
  );

  return {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    loading,
    error,
    clearError,
    refresh,
    removeStore,
  };
}
