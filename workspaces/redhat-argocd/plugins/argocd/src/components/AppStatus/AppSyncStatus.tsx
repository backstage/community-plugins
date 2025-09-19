/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { FC } from 'react';

import { Chip } from '@material-ui/core';

import {
  Application,
  SyncStatusCode,
} from '@backstage-community/plugin-redhat-argocd-common';
import { SyncIcon } from './StatusIcons';
import { TranslationFunction } from '@backstage/core-plugin-api/alpha';
import { argocdTranslationRef } from '../../translations/ref';
import { useTranslation } from '../../hooks/useTranslation';

const getSyncStatusTranslation = (
  status: SyncStatusCode,
  t: TranslationFunction<typeof argocdTranslationRef.T>,
) => {
  return t(`appStatus.appSyncStatus.${status}`);
};

const AppSyncStatus: FC<{
  app: Application;
  isChip?: boolean;
}> = ({ app, isChip = false }) => {
  const { t } = useTranslation();
  return isChip ? (
    <Chip
      data-testid="app-sync-status-chip"
      size="small"
      variant="outlined"
      icon={<SyncIcon status={app?.status?.sync?.status as SyncStatusCode} />}
      label={getSyncStatusTranslation(
        app?.status?.sync?.status as SyncStatusCode,
        t,
      )}
    />
  ) : (
    <>
      <SyncIcon status={app?.status?.sync?.status as SyncStatusCode} />{' '}
      {getSyncStatusTranslation(app?.status?.sync?.status as SyncStatusCode, t)}
    </>
  );
};
export default AppSyncStatus;
