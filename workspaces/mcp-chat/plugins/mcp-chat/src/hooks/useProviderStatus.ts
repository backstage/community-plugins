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
import { useEffect, useState, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { ProviderStatusData } from '../types';
import { mcpChatApiRef } from '../api';

export interface UseProviderStatusReturn {
  providerStatusData: ProviderStatusData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProviderStatus = (): UseProviderStatusReturn => {
  const mcpChatApi = useApi(mcpChatApiRef);
  const [providerStatusData, setProviderStatusData] =
    useState<ProviderStatusData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviderStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const statusData = await mcpChatApi.getProviderStatus();
      setProviderStatusData(statusData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch provider status';
      // eslint-disable-next-line no-console
      console.error('Failed to fetch provider status:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [mcpChatApi]);

  useEffect(() => {
    fetchProviderStatus();
  }, [fetchProviderStatus]);

  return {
    providerStatusData,
    isLoading,
    error,
    refetch: fetchProviderStatus,
  };
};
