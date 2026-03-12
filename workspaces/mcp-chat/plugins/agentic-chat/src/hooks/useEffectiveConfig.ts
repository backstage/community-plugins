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
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import { useApiQuery } from './useApiQuery';

/**
 * Fetches the full effective configuration (YAML + DB merged) once on mount.
 * Used by admin panel components to pre-populate fields with the live values
 * the system is actually using — so fields are never misleadingly blank.
 */
export function useEffectiveConfig() {
  const api = useApi(agenticChatApiRef);

  const fetcher = useCallback(() => api.getEffectiveConfig(), [api]);
  const { data, loading, error, refresh } = useApiQuery<Record<
    string,
    unknown
  > | null>({
    fetcher,
    initialValue: null,
  });

  // On error, expose {} instead of null so consumers can safely check truthiness
  const config = useMemo(() => {
    if (data !== null) return data;
    if (!loading && error) return {};
    return null;
  }, [data, loading, error]);

  const getValue = useCallback(
    <T = unknown>(key: string, fallback?: T): T => {
      if (!config) return fallback as T;
      const v = config[key];
      return (v !== undefined ? v : fallback) as T;
    },
    [config],
  );

  return { config, loading, error, refresh, getValue };
}
