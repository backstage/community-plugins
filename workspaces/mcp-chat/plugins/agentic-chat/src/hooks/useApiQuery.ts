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
import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeErrorMessage } from '../utils';

/**
 * Options for the useApiQuery hook.
 * @public
 */
export interface UseApiQueryOptions<T> {
  /** Async function that performs the fetch. Called on mount and on refresh. */
  fetcher: () => Promise<T>;
  /** Initial value before the first successful fetch. */
  initialValue: T;
  /**
   * Dependency list that triggers re-fetch when changed.
   * Pass an empty array to fetch only on mount.
   */
  deps?: readonly unknown[];
  /**
   * When true, the fetcher is not called on mount or when deps change.
   * Useful for conditional fetching (e.g. skip until a required ID is set).
   */
  skip?: boolean;
}

/**
 * Return type of the useApiQuery hook.
 * @public
 */
export interface UseApiQueryResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Generic hook for fetching data from an API with loading/error/refresh semantics.
 * Encapsulates the mounted-ref guard, error normalization, and loading state
 * so consuming hooks don't have to repeat this boilerplate.
 */
export function useApiQuery<T>(
  options: UseApiQueryOptions<T>,
): UseApiQueryResult<T> {
  const { fetcher, initialValue, deps = [], skip = false } = options;
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Ref keeps the latest initialValue without triggering callback recreation,
  // preventing stale closures when callers pass unstable references.
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  const refresh = useCallback(async () => {
    if (skip) {
      setData(initialValueRef.current);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(normalizeErrorMessage(err));
        setData(initialValueRef.current);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, skip]);

  // Stable serialized key for caller-supplied deps so the effect
  // re-runs when any dep value changes without needing a spread.
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh, depsKey]);

  return { data, loading, error, refresh };
}
