import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { ProjectDetails, reportPortalApiRef } from '../api';

export function useProjectDetails(
  projectId: string,
  host: string,
): { loading: boolean; projectDetails: ProjectDetails | undefined } {
  const reportPortalApi = useApi(reportPortalApiRef);
  const [projectDetails, setProjectDetails] = React.useState<ProjectDetails>();
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
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
