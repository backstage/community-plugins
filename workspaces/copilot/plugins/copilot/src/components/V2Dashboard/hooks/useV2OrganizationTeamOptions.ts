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

import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { useApi } from '@backstage/core-plugin-api';
import { copilotApiV2Ref } from '../../../api';

type OptionsResult = {
  queryKey: string;
  organizations: string[];
  teams: string[];
  teamsReady: boolean;
  hasPendingOrganizations: boolean;
  error?: Error;
};

export function useV2OrganizationTeamOptions(
  from: string,
  to: string,
  organization?: string,
  enabled = true,
) {
  const api = useApi(copilotApiV2Ref);
  const queryKey = JSON.stringify([from, to, organization, enabled]);
  const { value, loading, retry } =
    useAsyncRetry(async (): Promise<OptionsResult> => {
      if (!enabled) {
        return {
          queryKey,
          organizations: [],
          teams: [],
          teamsReady: false,
          hasPendingOrganizations: false,
        };
      }

      try {
        const options = await api.getOrganizationTeamOptions({
          from,
          to,
          organization,
        });
        return { queryKey, ...options };
      } catch (error) {
        return {
          queryKey,
          organizations: [],
          teams: [],
          teamsReady: false,
          hasPendingOrganizations: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    }, [api, from, to, organization, enabled]);
  const hasCurrentResult = value?.queryKey === queryKey;

  return {
    organizations: hasCurrentResult ? value.organizations : [],
    teams: hasCurrentResult ? value.teams : [],
    teamsReady: hasCurrentResult && value.teamsReady,
    hasPendingOrganizations: hasCurrentResult && value.hasPendingOrganizations,
    loading: loading || !hasCurrentResult,
    error: hasCurrentResult ? value.error : undefined,
    retry,
  };
}
