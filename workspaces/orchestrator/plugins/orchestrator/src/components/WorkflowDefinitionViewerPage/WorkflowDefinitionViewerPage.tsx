import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import { InfoCard, ResponseErrorPanel } from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';

import { orchestratorWorkflowExecutePermission } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  executeWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage';
import { EditorViewKind, WorkflowEditor } from '../WorkflowEditor';
import WorkflowDefinitionDetailsCard from './WorkflowDefinitionDetailsCard';

export const WorkflowDefinitionViewerPage = () => {
  const { workflowId, format } = useRouteRefParams(workflowDefinitionsRouteRef);
  const orchestratorApi = useApi(orchestratorApiRef);
  const { loading: loadingPermission, allowed: canRun } = usePermission({
    permission: orchestratorWorkflowExecutePermission,
  });
  const {
    value: workflowOverview,
    loading,
    error,
  } = useAsync(() => {
    return orchestratorApi.getWorkflowOverview(workflowId);
  }, []);
  const navigate = useNavigate();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);

  const workflowFormat = useMemo(
    () => (format === 'json' ? 'json' : 'yaml'),
    [format],
  );

  const handleExecute = () => {
    navigate(executeWorkflowLink({ workflowId }));
  };

  return (
    <BaseOrchestratorPage
      title={workflowOverview?.name || workflowId}
      type="Workflows"
      typeLink="/orchestrator"
    >
      <Grid container spacing={2} direction="column" wrap="nowrap">
        {error && (
          <Grid item>
            <ResponseErrorPanel error={error} />
          </Grid>
        )}
        <Grid container item justifyContent="flex-end" spacing={1}>
          <Grid item>
            {loading || loadingPermission ? (
              <Skeleton variant="text" width="5rem" />
            ) : (
              <Tooltip
                title="user not authorized to execute workflow"
                disableHoverListener={canRun}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleExecute}
                  disabled={!canRun}
                >
                  Run
                </Button>
              </Tooltip>
            )}
          </Grid>
        </Grid>
        <Grid item>
          <WorkflowDefinitionDetailsCard
            workflowOverview={workflowOverview}
            loading={loading}
          />
        </Grid>
        <Grid item>
          <InfoCard title="Workflow definition">
            <div style={{ height: '600px' }}>
              <WorkflowEditor
                kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
                workflowId={workflowId}
                format={workflowFormat}
              />
            </div>
          </InfoCard>
        </Grid>
      </Grid>
    </BaseOrchestratorPage>
  );
};
