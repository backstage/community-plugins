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
import type { SecurityMode } from '../types';
import { debugError, normalizeErrorMessage } from '../utils';
import { useBranding } from './useBranding';
import { useApiQuery } from './useApiQuery';

interface BackendStatusData {
  securityMode: SecurityMode | null;
  backendReady: boolean | null;
  configurationErrors: string[];
  isAdmin: boolean;
}

const INITIAL_STATUS: BackendStatusData = {
  securityMode: null,
  backendReady: null,
  configurationErrors: [],
  isAdmin: false,
};

/**
 * Hook to fetch backend status (security mode, readiness, configuration errors, admin flag).
 * Calls api.getStatus() once on mount.
 */
export function useBackendStatus() {
  const api = useApi(agenticChatApiRef);
  const { branding } = useBranding();

  const fetcher = useCallback(async (): Promise<BackendStatusData> => {
    try {
      const status = await api.getStatus();
      return {
        securityMode: status.securityMode,
        backendReady: status.ready,
        configurationErrors: status.configurationErrors || [],
        isAdmin: status.isAdmin === true,
      };
    } catch (err) {
      debugError('Failed to fetch status, defaulting to plugin-only:', err);
      return {
        securityMode: 'plugin-only',
        backendReady: false,
        configurationErrors: [
          `Failed to connect to ${
            branding.appName
          } backend: ${normalizeErrorMessage(err, 'Unknown error')}`,
        ],
        isAdmin: false,
      };
    }
  }, [api, branding.appName]);

  const { data, loading: securityLoading } = useApiQuery<BackendStatusData>({
    fetcher,
    initialValue: INITIAL_STATUS,
  });

  return useMemo(
    () => ({
      securityMode: data.securityMode,
      securityLoading,
      backendReady: data.backendReady,
      configurationErrors: data.configurationErrors,
      isAdmin: data.isAdmin,
    }),
    [data, securityLoading],
  );
}
