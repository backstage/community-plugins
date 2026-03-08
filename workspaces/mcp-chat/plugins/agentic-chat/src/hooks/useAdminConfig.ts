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
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import type { AdminConfigKey, AdminConfigEntry } from '../types';
import { normalizeErrorMessage } from '../utils';
import { useApiQuery } from './useApiQuery';

interface AdminConfigData {
  entry: AdminConfigEntry | null;
  source: 'database' | 'default';
}

/**
 * Hook to manage a single admin config entry.
 * Fetches the current value and provides save/reset helpers.
 */
export function useAdminConfig(key: AdminConfigKey) {
  const api = useApi(agenticChatApiRef);
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetcher = useCallback(() => api.getAdminConfig(key), [api, key]);

  const {
    data,
    loading,
    error: fetchError,
    refresh,
  } = useApiQuery<AdminConfigData>({
    fetcher,
    initialValue: { entry: null, source: 'default' },
  });

  const error = mutationError ?? fetchError;

  const save = useCallback(
    async (value: unknown): Promise<{ warnings?: string[] }> => {
      try {
        setSaving(true);
        setMutationError(null);
        const result = await api.setAdminConfig(key, value);
        if (mountedRef.current) {
          await refresh();
        }
        return { warnings: result.warnings };
      } catch (err) {
        if (mountedRef.current) {
          setMutationError(normalizeErrorMessage(err, 'Failed to save config'));
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    [api, key, refresh],
  );

  const reset = useCallback(async () => {
    try {
      setSaving(true);
      setMutationError(null);
      await api.deleteAdminConfig(key);
      if (mountedRef.current) {
        await refresh();
      }
    } catch (err) {
      if (mountedRef.current) {
        setMutationError(normalizeErrorMessage(err, 'Failed to reset config'));
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [api, key, refresh]);

  return useMemo(
    () => ({
      entry: data.entry,
      source: data.source,
      loading,
      saving,
      error,
      save,
      reset,
      refresh,
    }),
    [data.entry, data.source, loading, saving, error, save, reset, refresh],
  );
}
