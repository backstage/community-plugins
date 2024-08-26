import React from 'react';

import { SyncIcon } from '../AppStatus/StatusIcons';
import { SyncStatusCode } from '../../types';

export const ResourceSyncStatus = ({ syncStatus }: { syncStatus: string }) => {
  return (
    <>
      <SyncIcon status={syncStatus as SyncStatusCode} /> {syncStatus}
    </>
  );
};
