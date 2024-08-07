import { useEffect, useState } from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { LaunchDetails, reportPortalApiRef } from '../api';

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
