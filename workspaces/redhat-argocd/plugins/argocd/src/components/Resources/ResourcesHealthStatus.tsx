import React from 'react';

import { AppHealthIcon } from '../AppStatus/StatusIcons';
import { HealthStatus } from '../../types';

export const ResourceHealthStatus = ({
  healthStatus,
}: {
  healthStatus: string;
}) => {
  return (
    <>
      <AppHealthIcon status={healthStatus as HealthStatus} /> {healthStatus}
    </>
  );
};
