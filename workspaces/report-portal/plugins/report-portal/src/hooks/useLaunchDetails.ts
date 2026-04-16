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
import { useEffect, useState } from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { reportPortalApiRef } from '../api';
import { LaunchDetails } from '@backstage-community/plugin-report-portal-common';

export function useLaunchDetails(
  projectId: string,
  hostName: string,
  filters: { [key: string]: string | number } | undefined,
) {
  const reportPortalApi = useApi(reportPortalApiRef);
  const [loading, setLoading] = useState(true);
  const [launchDetails, setLaunchDetails] = useState<LaunchDetails>();

  const [error, setError] = useState<Error>();

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    reportPortalApi
      .getLaunchResults(projectId, hostName, filters)
      .then(res => {
        setLaunchDetails(res.content[0]);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [filters, projectId, hostName, reportPortalApi]);

  return { loading, launchDetails, error };
}

export function useMultipleLaunchDetails(
  projectId: string,
  hostName: string,
  launchNames: string[],
) {
  const reportPortalApi = useApi(reportPortalApiRef);
  const [loading, setLoading] = useState(true);
  const [launches, setLaunches] = useState<LaunchDetails[]>([]);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setLoading(true);
    setError(undefined);

    const filters: { [key: string]: string | number } | undefined =
      launchNames.length > 0
        ? { 'filter.in.name': launchNames.join(',') }
        : undefined;

    reportPortalApi
      .getLaunchResults(projectId, hostName, filters)
      .then(res => {
        setLaunches(res.content);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [launchNames, projectId, hostName, reportPortalApi]);

  return { loading, launches, error };
}
