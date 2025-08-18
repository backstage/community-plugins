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

import { ProjectListResponse } from '@backstage-community/plugin-report-portal-common';
import { useEffect, useState } from 'react';
import { reportPortalApiRef } from '../api';

export function useInstanceDetails(host: string, filterType: string) {
  const reportPortalApi = useApi(reportPortalApiRef);
  const [loading, setLoading] = useState(true);
  const [projectListData, setProjectListData] = useState<ProjectListResponse>({
    content: [],
    page: {
      number: 1,
      size: 10,
      totalElements: 0,
      totalPages: 1,
    },
  });

  useEffect(() => {
    setLoading(true);
    reportPortalApi
      .getInstanceDetails(host, { 'filter.eq.type': filterType })
      .then(res => {
        setProjectListData(res);
        setLoading(false);
      })
      .catch(err => err);
  }, [host, reportPortalApi, filterType]);

  return { loading, projectListData };
}
