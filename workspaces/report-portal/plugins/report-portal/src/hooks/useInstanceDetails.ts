import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { ProjectListResponse, reportPortalApiRef } from '../api';

export function useInstanceDetails(host: string, filterType: string) {
  const reportPortalApi = useApi(reportPortalApiRef);
  const [loading, setLoading] = React.useState(true);
  const [projectListData, setProjectListData] =
    React.useState<ProjectListResponse>({
      content: [],
      page: {
        number: 1,
        size: 10,
        totalElements: 0,
        totalPages: 1,
      },
    });

  React.useEffect(() => {
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
