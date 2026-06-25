/*
 * Copyright 2026 The Backstage Authors
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
import { azureDevOpsApiRef } from '../api';
import useAsync from 'react-use/esm/useAsync';

/**
 * React hook that fetches and returns the list of project names for a given organization.
 *
 * @param host - Optional Azure DevOps hostname without a URL scheme (e.g. `dev.azure.com`)
 * @param org - The Azure DevOps organization name
 * @returns Object containing projects array, loading state, and error
 */
export function useProjects(
  host?: string,
  org?: string,
): {
  projects: string[];
  loading: boolean;
  error?: Error;
} {
  const azureDevOpsApi = useApi(azureDevOpsApiRef);

  const { value, loading, error } = useAsync(async () => {
    if (!host || !org) {
      return [];
    }
    return await azureDevOpsApi.getProjects(host, org);
  }, [host, org]);

  return {
    projects: value ?? [],
    loading,
    error,
  };
}
