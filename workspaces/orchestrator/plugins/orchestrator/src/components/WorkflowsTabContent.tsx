import React, { useCallback } from 'react';

import {
  Content,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import Grid from '@mui/material/Grid';

import { WorkflowOverviewDTO } from '@backstage-community/plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import usePolling from '../hooks/usePolling';
import { WorkflowsTable } from './WorkflowsTable';

export const WorkflowsTabContent = () => {
  const orchestratorApi = useApi(orchestratorApiRef);

  const fetchWorkflowOverviews = useCallback(async () => {
    const overviewsResp = await orchestratorApi.listWorkflowOverviews();
    return overviewsResp.data.overviews;
  }, [orchestratorApi]);

  const { loading, error, value } = usePolling<
    WorkflowOverviewDTO[] | undefined
  >(fetchWorkflowOverviews);

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
