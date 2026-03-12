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
import { SafetyStatusResponse } from '../types';
import { useApiQuery } from './useApiQuery';

/**
 * Fetches the list of available safety shields from the Llama Stack server.
 * Used by the Safety admin panel to populate shield selection dropdowns.
 */
export function useSafetyStatus() {
  const api = useApi(agenticChatApiRef);

  const fetcher = useCallback(() => api.getSafetyStatus(), [api]);
  const { data, loading, error, refresh } =
    useApiQuery<SafetyStatusResponse | null>({
      fetcher,
      initialValue: null,
    });

  const shields = useMemo(() => data?.shields ?? [], [data]);
  const serverEnabled = data?.enabled ?? false;

  return { shields, serverEnabled, loading, error, refresh };
}
