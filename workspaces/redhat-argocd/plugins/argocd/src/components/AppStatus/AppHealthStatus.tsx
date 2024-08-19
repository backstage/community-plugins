import React from 'react';

import { Chip } from '@material-ui/core';

import { Application, HealthStatus } from '../../types';
import { AppHealthIcon } from './StatusIcons';

const AppHealthStatus: React.FC<{ app: Application; isChip?: boolean }> = ({
  app,
  isChip = false,
}) => {
  return isChip ? (
    <Chip
      data-testid="app-health-status-chip"
      size="small"
      variant="outlined"
      icon={<AppHealthIcon status={app.status.health.status as HealthStatus} />}
      label={app.status.health.status}
    />
  ) : (
    <>
      <AppHealthIcon status={app.status.health.status as HealthStatus} />{' '}
      {app.status.health.status}
    </>
  );
};

export default AppHealthStatus;
