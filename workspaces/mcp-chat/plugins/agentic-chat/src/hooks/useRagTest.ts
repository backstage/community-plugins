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
import type { RagTestResult } from '../types';
import { normalizeErrorMessage } from '../utils';

/**
 * Hook for testing RAG queries against the vector store.
 */
export function useRagTest() {
  const api = useApi(agenticChatApiRef);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RagTestResult | null>(null);
  const [searchTimeMs, setSearchTimeMs] = useState<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const search = useCallback(
    async (
      query: string,
      maxResults?: number,
      vectorStoreId?: string,
      vectorStoreIds?: string[],
    ): Promise<RagTestResult> => {
      if (!query.trim()) {
        const msg = 'Query cannot be empty';
        setError(msg);
        throw new Error(msg);
      }
      if (query.length > 2000) {
        const msg = 'Query must be at most 2000 characters';
        setError(msg);
        throw new Error(msg);
      }

      try {
        setLoading(true);
        setError(null);
        setSearchTimeMs(null);
        const t0 = Date.now();
        const searchResult = await api.testRagQuery(
          query.trim(),
          maxResults,
          vectorStoreId,
          vectorStoreIds,
        );
        const elapsed = Date.now() - t0;
        if (mountedRef.current) {
          setResult(searchResult);
          setSearchTimeMs(elapsed);
        }
        return searchResult;
      } catch (err) {
        const msg = normalizeErrorMessage(err, 'RAG test failed');
        if (mountedRef.current) {
          setError(msg);
          setSearchTimeMs(null);
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [api],
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setSearchTimeMs(null);
  }, []);
  const clearError = useCallback(() => setError(null), []);

  return {
    search,
    loading,
    error,
    result,
    searchTimeMs,
    clearResult,
    clearError,
  };
}
