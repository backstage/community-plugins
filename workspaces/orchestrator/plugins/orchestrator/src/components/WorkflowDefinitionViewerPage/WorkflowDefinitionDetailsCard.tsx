import React from 'react';

import { InfoCard } from '@backstage/core-components';
import { AboutField } from '@backstage/plugin-catalog';

import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';

import {
  ProcessInstanceStateValues,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../../constants';
import WorkflowOverviewFormatter from '../../dataFormatters/WorkflowOverviewFormatter';
import { WorkflowInstanceStatusIndicator } from '../WorkflowInstanceStatusIndicator';

const DetailsInfoCard = styled(InfoCard)({
  overflowY: 'auto',
  height: '15rem',
});

const WorkflowDefinitionDetailsCard = ({
  loading,
  workflowOverview,
}: {
  loading: boolean;
  workflowOverview?: WorkflowOverview;
}) => {
  const formattedWorkflowOverview = React.useMemo(
    () =>
      workflowOverview
        ? WorkflowOverviewFormatter.format(workflowOverview)
        : undefined,
    [workflowOverview],
  );

  const details = React.useMemo(
    () => [
      {
        label: 'type',
        value: formattedWorkflowOverview?.category,
      },
      {
        label: 'average duration',
        value: formattedWorkflowOverview?.avgDuration,
      },
      {
        label: 'last run',
        value: formattedWorkflowOverview?.lastTriggered,
      },
      {
        label: 'last run status',
        value: formattedWorkflowOverview?.lastRunStatus,
        children:
          formattedWorkflowOverview?.lastRunStatus !== VALUE_UNAVAILABLE ? (
            <WorkflowInstanceStatusIndicator
              status={
                formattedWorkflowOverview?.lastRunStatus as ProcessInstanceStateValues
              }
              lastRunId={formattedWorkflowOverview?.lastRunId}
            />
          ) : (
            VALUE_UNAVAILABLE
          ),
      },
    ],
    [formattedWorkflowOverview],
  );

  return (
    <DetailsInfoCard title="Details">
      <Grid container spacing={3} alignContent="flex-start">
        <Grid container item md={4} spacing={3} alignContent="flex-start">
          {details?.map(({ label, value, children }) => (
            <Grid item md={6} key={label}>
              {/* AboutField requires the value to be defined as a prop as well */}
              <AboutField label={label} value={value}>
                {loading ? <Skeleton variant="text" /> : children || value}
              </AboutField>
            </Grid>
          ))}
        </Grid>
        <Grid item md={8}>
          <AboutField
            label="description"
            value={formattedWorkflowOverview?.description}
          >
            {loading ? (
              <Skeleton variant="text" />
            ) : (
              formattedWorkflowOverview?.description
            )}
          </AboutField>
        </Grid>
      </Grid>
    </DetailsInfoCard>
  );
};

export default WorkflowDefinitionDetailsCard;
