import React from 'react';

import { Chip } from '@material-ui/core';

import { Application, SyncStatusCode } from '../../types';
import { SyncIcon } from './StatusIcons';

const AppSyncStatus: React.FC<{
  app: Application;
  isChip?: boolean;
}> = ({ app, isChip = false }) => {
  return isChip ? (
    <Chip
      data-testid="app-sync-status-chip"
      size="small"
      variant="outlined"
      icon={<SyncIcon status={app?.status?.sync?.status as SyncStatusCode} />}
      label={app?.status?.sync?.status}
    />
  ) : (
    <>
      <SyncIcon status={app?.status?.sync?.status as SyncStatusCode} />{' '}
      {app?.status?.sync?.status}
    </>
  );
};
export default AppSyncStatus;
