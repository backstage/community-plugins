import React, { useCallback } from 'react';

import {
  Content,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import Grid from '@mui/material/Grid';

import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import usePolling from '../hooks/usePolling';
import { WorkflowsTable } from './WorkflowsTable';

export const WorkflowsTabContent = () => {
  const orchestratorApi = useApi(orchestratorApiRef);

  const fetchWorkflowOverviews = useCallback(async () => {
    const data = await orchestratorApi.listWorkflowOverviews();
    return data.items;
  }, [orchestratorApi]);

  const { loading, error, value } = usePolling<WorkflowOverview[]>(
    fetchWorkflowOverviews,
  );

  const isReady = React.useMemo(() => !loading && !error, [loading, error]);

  return (
    <Content noPadding>
      {loading ? <Progress /> : null}
      {error ? <ResponseErrorPanel error={error} /> : null}
      {isReady ? (
        <Grid container direction="column">
          <Grid item>
            <WorkflowsTable items={value ?? []} />
          </Grid>
        </Grid>
      ) : null}
    </Content>
  );
};
