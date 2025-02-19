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

  useEffect(() => {
    setLoading(true);
    reportPortalApi.getLaunchResults(projectId, hostName, filters).then(res => {
      setLaunchDetails(res.content[0]);
      setLoading(false);
    });
  }, [filters, projectId, hostName, reportPortalApi]);

  return { loading, launchDetails };
}
