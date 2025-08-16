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
import { FluxRelease } from '../objects';
import { useQuery } from '@tanstack/react-query';
import { FetchApi, fetchApiRef, useApi } from '@backstage/core-plugin-api';

export const LATEST_FLUX_RELEASE_PATH =
  'https://api.github.com/repos/fluxcd/flux2/releases/latest';

export async function getFluxLatestRelease(fetchApi: FetchApi) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const response = await fetchApi.fetch(LATEST_FLUX_RELEASE_PATH, {
    headers,
  });

  return await response.json();
}

export function useGetLatestFluxRelease() {
  const fetchApi = useApi(fetchApiRef);
  const { isLoading, data, error } = useQuery<FluxRelease, Error>({
    queryKey: ['latest_flux_release'],
    queryFn: () => getFluxLatestRelease(fetchApi),
    // Use cached data for 1hour.
    staleTime: 1000 * 60 * 60,
  });

  return { isLoading, data, error };
}
