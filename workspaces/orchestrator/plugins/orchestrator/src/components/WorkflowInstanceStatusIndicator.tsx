import React from 'react';

import { Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import DotIcon from '@mui/icons-material/FiberManualRecord';

import {
  capitalize,
  ProcessInstanceStateValues,
} from '@backstage-community/plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../constants';
import { useWorkflowInstanceStateColors } from '../hooks/useWorkflowInstanceStatusColors';
import { workflowInstanceRouteRef } from '../routes';

export const WorkflowInstanceStatusIndicator = ({
  status,
  lastRunId,
}: {
  status?: ProcessInstanceStateValues;
  lastRunId?: string;
}) => {
  const iconColor = useWorkflowInstanceStateColors(status);
  const workflowInstanceLink = useRouteRef(workflowInstanceRouteRef);

  if (!status) {
    return VALUE_UNAVAILABLE;
  }

  return (
    <>
      <DotIcon style={{ fontSize: '0.75rem', color: iconColor }} />{' '}
      {lastRunId ? (
        <Link to={workflowInstanceLink({ instanceId: lastRunId })}>
          {capitalize(status)}
        </Link>
      ) : (
        <>{capitalize(status)}</>
      )}
    </>
  );
};
