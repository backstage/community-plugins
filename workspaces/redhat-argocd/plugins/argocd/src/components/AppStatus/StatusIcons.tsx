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
import React from 'react';

import ArrowCircleUpIcon from '@patternfly/react-icons/dist/esm/icons/arrow-alt-circle-up-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import CircleNotchIcon from '@patternfly/react-icons/dist/esm/icons/circle-notch-icon';
import GhostIcon from '@patternfly/react-icons/dist/esm/icons/ghost-icon';
import HeartBrokenIcon from '@patternfly/react-icons/dist/esm/icons/heart-broken-icon';
import HeartIcon from '@patternfly/react-icons/dist/esm/icons/heart-icon';
import PauseCircleIcon from '@patternfly/react-icons/dist/esm/icons/pause-circle-icon';
import QuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/question-circle-icon';

import {
  HealthStatus,
  SyncStatusCode,
  SyncStatuses,
} from '@backstage-community/plugin-redhat-argocd-common';
import useIconStyles from '../../hooks/useIconStyles';

export const SyncIcon: React.FC<{ status: SyncStatusCode }> = ({
  status,
}): React.ReactNode => {
  const classes = useIconStyles();
  switch (status) {
    case SyncStatuses.Synced:
      return (
        <CheckCircleIcon
          data-testid="synced-icon"
          className={`${classes.icon}`}
          style={{ height: '1em', color: 'green' }}
        />
      );
    case SyncStatuses.OutOfSync:
      return (
        <ArrowCircleUpIcon
          data-testid="outofsync-icon"
          className={`${classes.icon}`}
          style={{ height: '1em', color: '#f4c030' }}
        />
      );
    case SyncStatuses.Unknown:
      return (
        <CircleNotchIcon
          data-testid="unknown-icon"
          className={`${classes.icon} ${classes['icon-spin']}`}
          style={{ height: '1em', color: '#0DADEA' }}
        />
      );
    default:
      return null;
  }
};

export const AppHealthIcon: React.FC<{ status: HealthStatus }> = ({
  status,
}): React.ReactNode => {
  const classes = useIconStyles();

  switch (status) {
    case HealthStatus.Healthy:
      return (
        <HeartIcon
          data-testid="healthy-icon"
          className={`${classes.icon}`}
          style={{ height: '1em', color: 'green' }}
        />
      );
    case HealthStatus.Suspended:
      return (
        <PauseCircleIcon
          data-testid="suspended-icon"
          className={`${classes.icon}`}
          style={{ height: '1em', color: '#766f94' }}
        />
      );
    case HealthStatus.Degraded:
      return (
        <HeartBrokenIcon
          data-testid="degraded-icon"
          className={`${classes.icon}`}
          style={{ height: '1em', color: '#E96D76' }}
        />
      );
    case HealthStatus.Progressing:
      return (
        <CircleNotchIcon
          data-testid="progressing-icon"
          className={`${classes.icon} ${classes['icon-spin']}`}
          style={{ height: '1em', color: '#0DADEA' }}
        />
      );
    case HealthStatus.Missing:
      return (
        <GhostIcon
          data-testid="missing-icon"
          className={`${classes.icon}`}
          style={{ height: '1em', color: '#f4c030' }}
        />
      );
    default:
      return (
        <QuestionCircleIcon
          data-testid="unknown-icon"
          style={{ height: '1em', color: 'green' }}
        />
      );
  }
};
