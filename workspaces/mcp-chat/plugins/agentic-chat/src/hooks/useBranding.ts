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

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../api';
import { DEFAULT_BRANDING } from '@backstage-community/plugin-agentic-chat-common';
import { useApiQuery } from './useApiQuery';

const BRANDING_REFRESH_EVENT = 'agentic-chat:branding-refresh';

/**
 * Dispatch a global event so every useBranding() instance re-fetches.
 * Call this after saving branding in the admin panel.
 */
export const dispatchBrandingRefresh = () => {
  window.dispatchEvent(new Event(BRANDING_REFRESH_EVENT));
};

export const useBranding = () => {
  const api = useApi(agenticChatApiRef);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  // Listen for cross-instance refresh events
  useEffect(() => {
    const handler = () => setRefreshKey(k => k + 1);
    window.addEventListener(BRANDING_REFRESH_EVENT, handler);
    return () => window.removeEventListener(BRANDING_REFRESH_EVENT, handler);
  }, []);

  const fetcher = useCallback(async () => {
    try {
      const response = await api.getBranding();
      return { ...DEFAULT_BRANDING, ...response };
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to fetch branding');
    }
  }, [api]);

  const {
    data: branding,
    loading,
    error: errorStr,
  } = useApiQuery({
    fetcher,
    initialValue: DEFAULT_BRANDING,
    deps: [refreshKey],
  });

  const error = errorStr ? new Error(errorStr) : null;

  return { branding, loading, error, refresh };
};
