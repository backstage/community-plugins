import React from 'react';

import { AppHealthIcon } from '../AppStatus/StatusIcons';
import { HealthStatus } from '../../types';

interface ResourceHealthStatusProps {
  healthStatus: string;
}

export const ResourceHealthStatus: React.FC<ResourceHealthStatusProps> = ({
  healthStatus,
}) => {
  return (
    <>
      <AppHealthIcon status={healthStatus as HealthStatus} /> {healthStatus}
    </>
  );
};
