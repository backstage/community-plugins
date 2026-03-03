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
 * @param organization - The Azure DevOps organization name
 * @param host - Optional host URL for the Azure DevOps instance
 * @returns Object containing projects array, loading state, and error
 */
export function useProjects(
  organization?: string,
  host?: string,
): {
  projects: string[];
  loading: boolean;
  error?: Error;
} {
  const azureDevOpsApi = useApi(azureDevOpsApiRef);

  const { value, loading, error } = useAsync(async () => {
    if (!organization) {
      return [];
    }
    return await azureDevOpsApi.getProjects(organization, host);
  }, [organization, host]);

  return {
    projects: value ?? [],
    loading,
    error,
  };
}
