/*
 * Copyright 2024 The Backstage Authors
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
import { useApi } from '@backstage/core-plugin-api';
import { announcementsApiRef } from '../apis';
import { Settings } from '@backstage-community/plugin-announcements-common';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';

/**
 * Hook to get and manage announcements settings.
 *
 * @returns settings data, loading state, and mutation functions
 *
 * @public
 */
export const useSettings = (): {
  settings: Settings | undefined;
  loading: boolean;
  error: Error | undefined;
  retry: () => void;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
} => {
  const api = useApi(announcementsApiRef);

  const { value, loading, error, retry } = useAsyncRetry(async () => {
    return await api.settings();
  }, [api]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    await api.updateSettings(newSettings);
    retry();
  };

  const resetSettings = async () => {
    await api.resetSettings();
    retry();
  };

  return {
    settings: value,
    loading,
    error,
    retry,
    updateSettings,
    resetSettings,
  };
};
