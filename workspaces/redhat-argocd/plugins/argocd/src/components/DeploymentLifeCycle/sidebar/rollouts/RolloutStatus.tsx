import React from 'react';

import { Chip } from '@material-ui/core';

import { RolloutPhase } from '../../../../types/rollouts';
import RolloutStatusIcon from './RolloutStatusIcon';

interface RolloutStatusProps {
  status: keyof typeof RolloutPhase;
}
const RolloutStatus: React.FC<RolloutStatusProps> = ({ status }) => {
  if (!status) {
    return null;
  }
  return (
    <Chip
      data-testid="rollout-status-chip"
      size="small"
      variant="outlined"
      icon={<RolloutStatusIcon status={status} />}
      label={status}
    />
  );
};

export default RolloutStatus;
