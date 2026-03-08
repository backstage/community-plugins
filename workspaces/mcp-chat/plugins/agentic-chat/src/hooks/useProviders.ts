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
import type { ProviderDescriptor } from '@backstage-community/plugin-agentic-chat-common';
import { agenticChatApiRef } from '../api';
import { useApiQuery } from './useApiQuery';

interface ProvidersData {
  providers: ProviderDescriptor[];
  activeProviderId: string;
}

const INITIAL: ProvidersData = { providers: [], activeProviderId: '' };

/**
 * Fetches the provider registry and active provider from the backend.
 * Supports switching the active provider with automatic refresh.
 */
export function useProviders() {
  const api = useApi(agenticChatApiRef);

  const fetcher = useCallback(() => api.listProviders(), [api]);
  const { data, loading, error, refresh } = useApiQuery<ProvidersData>({
    fetcher,
    initialValue: INITIAL,
  });

  const switchProvider = useCallback(
    async (id: string) => {
      await api.setActiveProvider(id);
      await refresh();
    },
    [api, refresh],
  );

  const activeProvider = useMemo(
    () => data.providers.find(p => p.id === data.activeProviderId) ?? undefined,
    [data.providers, data.activeProviderId],
  );

  return {
    providers: data.providers,
    activeProviderId: data.activeProviderId,
    activeProvider,
    switchProvider,
    loading,
    error,
  };
}
