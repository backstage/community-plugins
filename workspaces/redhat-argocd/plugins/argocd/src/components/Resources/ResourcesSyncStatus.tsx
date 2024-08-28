import React from 'react';

import { SyncIcon } from '../AppStatus/StatusIcons';
import { SyncStatusCode } from '../../types';

interface ResourceSyncStatusProps {
  syncStatus: string;
}

export const ResourceSyncStatus: React.FC<ResourceSyncStatusProps> = ({
  syncStatus,
}) => {
  return (
    <>
      <SyncIcon status={syncStatus as SyncStatusCode} /> {syncStatus}
    </>
  );
};
