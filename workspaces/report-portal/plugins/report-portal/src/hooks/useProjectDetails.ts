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

import { ProjectDetails } from '@backstage-community/plugin-report-portal-common';
import { useEffect, useState } from 'react';
import { reportPortalApiRef } from '../api';

export function useProjectDetails(
  projectId: string,
  host: string,
): { loading: boolean; projectDetails: ProjectDetails | undefined } {
  const reportPortalApi = useApi(reportPortalApiRef);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    reportPortalApi
      .getProjectDetails(projectId, host)
      .then(resp => {
        setProjectDetails(resp);
        setLoading(false);
      })
      .catch(err => err);
  }, [projectId, reportPortalApi, host]);

  return { loading, projectDetails };
}
