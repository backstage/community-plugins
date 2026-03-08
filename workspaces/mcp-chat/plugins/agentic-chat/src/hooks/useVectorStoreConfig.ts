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
import { useState, useCallback, useRef } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import type {
  VectorStoreConfig,
  VectorStoreCreateResult,
  VectorStoreStatusResult,
} from '../types';
import { normalizeErrorMessage } from '../utils';
import { useApiQuery } from './useApiQuery';

interface VectorStoreData {
  config: VectorStoreConfig | null;
  configSource: 'yaml' | 'database' | 'merged';
  status: VectorStoreStatusResult | null;
}

export function useVectorStoreConfig() {
  const api = useApi(agenticChatApiRef);
  const mountedRef = useRef(true);

  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const fetcher = useCallback(async (): Promise<VectorStoreData> => {
    const [configResult, statusResult] = await Promise.allSettled([
      api.getVectorStoreConfig(),
      api.getVectorStoreStatus(),
    ]);
    return {
      config:
        configResult.status === 'fulfilled' ? configResult.value.config : null,
      configSource:
        configResult.status === 'fulfilled'
          ? configResult.value.source
          : 'yaml',
      status:
        statusResult.status === 'fulfilled'
          ? statusResult.value
          : { exists: false, ready: false },
    };
  }, [api]);

  const {
    data,
    loading,
    error: fetchError,
    refresh,
  } = useApiQuery<VectorStoreData>({
    fetcher,
    initialValue: {
      config: null,
      configSource: 'yaml',
      status: { exists: false, ready: false },
    },
  });

  const error = mutationError ?? fetchError;

  const clearError = useCallback(() => setMutationError(null), []);

  const save = useCallback(
    async (overrides: Partial<VectorStoreConfig>) => {
      setSaving(true);
      setMutationError(null);
      setSaveSuccess(false);
      try {
        await api.saveVectorStoreConfig(overrides);
        if (mountedRef.current) {
          await refresh();
          setSaveSuccess(true);
        }
      } catch (err) {
        if (mountedRef.current) {
          setMutationError(normalizeErrorMessage(err, 'Failed to save config'));
        }
      } finally {
        if (mountedRef.current) setSaving(false);
      }
    },
    [api, refresh],
  );

  const reset = useCallback(async () => {
    setSaving(true);
    setMutationError(null);
    setSaveSuccess(false);
    try {
      await api.resetVectorStoreConfig();
      if (mountedRef.current) {
        await refresh();
        setSaveSuccess(true);
      }
    } catch (err) {
      if (mountedRef.current) {
        setMutationError(normalizeErrorMessage(err, 'Failed to reset config'));
      }
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [api, refresh]);

  const create = useCallback(
    async (
      overrides?: Record<string, unknown>,
    ): Promise<VectorStoreCreateResult | null> => {
      setCreating(true);
      setMutationError(null);
      try {
        const result = await api.createVectorStore(overrides);
        if (mountedRef.current) {
          await refresh();
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setMutationError(
            normalizeErrorMessage(err, 'Failed to create vector store'),
          );
        }
        return null;
      } finally {
        if (mountedRef.current) setCreating(false);
      }
    },
    [api, refresh],
  );

  return {
    config: data.config,
    configSource: data.configSource,
    status: data.status,
    loading,
    saving,
    creating,
    error,
    saveSuccess,
    clearError,
    clearSaveSuccess: useCallback(() => setSaveSuccess(false), []),
    save,
    reset,
    create,
    refresh,
    refreshStatus: refresh,
  };
}
