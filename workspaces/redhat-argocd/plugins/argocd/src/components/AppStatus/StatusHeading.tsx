import React from 'react';

import { Application } from '../../types';
import AppHealthStatus from './AppHealthStatus';
import AppSyncStatus from './AppSyncStatus';

const StatusHeading: React.FC<{ app: Application }> = ({ app }) => {
  if (!app) {
    return null;
  }
  return (
    <>
      <AppSyncStatus app={app} isChip />
      <AppHealthStatus app={app} isChip />
    </>
  );
};

export default StatusHeading;
