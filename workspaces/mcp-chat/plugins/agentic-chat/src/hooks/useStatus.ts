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
import { useCallback, useEffect, useRef } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import { AgenticChatStatus } from '../types';
import { useApiQuery } from './useApiQuery';

const STATUS_POLL_INTERVAL_MS = 30_000;

/**
 * Hook to fetch and manage Agentic Chat status.
 * Polls every 30 seconds while mounted.
 */
export function useStatus() {
  const api = useApi(agenticChatApiRef);

  const fetcher = useCallback(() => api.getStatus(), [api]);
  const {
    data: status,
    loading,
    error,
    refresh,
  } = useApiQuery<AgenticChatStatus | null>({
    fetcher,
    initialValue: null,
  });

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    const interval = setInterval(() => {
      refreshRef.current();
    }, STATUS_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return { status, loading, error, refresh };
}
