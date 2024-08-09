import React from 'react';
import Moment from 'react-moment';

import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import Tooltip from '@mui/material/Tooltip';

import { VALUE_UNAVAILABLE } from '../constants';
import { useWorkflowInstanceStateColors } from '../hooks/useWorkflowInstanceStatusColors';
import { Paragraph } from './Paragraph';
import { WorkflowProgressNodeModel } from './WorkflowProgressNodeModel';

const WorkflowProgressNodeIcon: React.FC<{
  status?: WorkflowProgressNodeModel['status'];
  error?: WorkflowProgressNodeModel['error'];
}> = ({ status, error }) => {
  const color = useWorkflowInstanceStateColors(status);
  switch (status) {
    case 'Error': {
      return (
        <Tooltip
          title={
            error?.message ??
            'Additional details about this error are not available'
          }
        >
          <ErrorIcon style={{ color }} />
        </Tooltip>
      );
    }
    case 'Completed': {
      return (
        <Tooltip title="Completed">
          <CheckCircleIcon style={{ color }} />
        </Tooltip>
      );
    }
    case 'Active': {
      return (
        <Tooltip title="Active">
          <HourglassTopIcon className={color} />
        </Tooltip>
      );
    }
    case 'Aborted': {
      return (
        <Tooltip title="Aborted">
          <CancelIcon className={color} />
        </Tooltip>
      );
    }
    case 'Suspended': {
      return (
        <Tooltip title="Suspended">
          <PauseCircleIcon className={color} />
        </Tooltip>
      );
    }
    case 'Pending': {
      return (
        <Tooltip title="Pending">
          <HourglassTopIcon className={color} />
        </Tooltip>
      );
    }
    default:
      return null;
  }
};
WorkflowProgressNodeIcon.displayName = 'WorkflowProgressNodeIcon';

export const WorkflowProgressNode: React.FC<{
  model: WorkflowProgressNodeModel;
}> = ({ model }) => (
  <Paragraph>
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <WorkflowProgressNodeIcon status={model.status} error={model.error} />
      <span style={{ paddingLeft: '8px' }}>{model.name}</span>
    </span>
    <small style={{ paddingLeft: '32px', color: 'grey' }}>
      {!model.exit ? (
        VALUE_UNAVAILABLE
      ) : (
        <Moment fromNow>{new Date(`${model.exit}`)}</Moment>
      )}
    </small>
  </Paragraph>
);
WorkflowProgressNode.displayName = 'WorkflowProgressNode';
