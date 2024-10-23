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

import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import HeartIcon from '@mui/icons-material/FavoriteBorder';
import HeartBrokenIcon from '@mui/icons-material/HeartBrokenOutlined';
import PauseCircleIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import { StatusOK, StatusRunning } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import { Status } from '@janus-idp/shared-react';

import GhostIcon from '../icons/GhostIcon';

import {
  HealthStatus,
  SyncStatusCode,
  SyncStatuses,
} from '../../types/application';
import useIconStyles from '../../hooks/useIconStyles';

export const SyncIcon = ({
  status,
  iconOnly,
}: {
  status: SyncStatusCode;
  iconOnly?: boolean;
}): React.ReactNode => {
  const classes = useIconStyles();
  const iconStyle = {
    marginLeft: '4.8px',
    marginBottom: '5px',
    marginRight: '8px',
    width: '0.8em',
  };
  switch (status) {
    case SyncStatuses.Synced:
      return iconOnly ? (
        <Typography style={iconStyle}>
          <StatusOK />
        </Typography>
      ) : (
        <StatusOK>
          <Typography style={{ fontSize: '0.875rem', paddingBottom: '1px' }}>
            {SyncStatuses.Synced}
          </Typography>
        </StatusOK>
      );

    case SyncStatuses.OutOfSync:
      return (
        <>
          <ArrowCircleUpIcon
            data-testid="outofsync-icon"
            className={iconOnly ? classes.iconOnly : classes.icon}
            style={{
              color: '#f4c030',
            }}
          />
          {!iconOnly && status}
        </>
      );
    case SyncStatuses.Unknown:
      return iconOnly ? (
        <Typography style={iconStyle}>{SyncStatuses.Unknown}</Typography>
      ) : (
        <StatusRunning>
          <Typography style={{ fontSize: '0.875rem', paddingBottom: '1px' }}>
            {SyncStatuses.Unknown}
          </Typography>
        </StatusRunning>
      );
    default:
      return null;
  }
};

export const AppHealthIcon = ({
  status,
  iconOnly,
}: {
  status: HealthStatus;
  iconOnly?: boolean;
}): React.ReactNode => {
  const classes = useIconStyles();

  switch (status) {
    case HealthStatus.Healthy:
      return (
        <>
          <HeartIcon
            data-testid="healthy-icon"
            className={iconOnly ? classes.iconOnly : classes.icon}
            style={{ color: 'green' }}
          />
          {!iconOnly && status}
        </>
      );
    case HealthStatus.Suspended:
      return (
        <>
          <PauseCircleIcon
            data-testid="suspended-icon"
            className={iconOnly ? classes.iconOnly : classes.icon}
            style={{ color: '#766f94' }}
          />
          {!iconOnly && status}
        </>
      );
    case HealthStatus.Degraded:
      return (
        <>
          <HeartBrokenIcon
            data-testid="degraded-icon"
            className={iconOnly ? classes.iconOnly : classes.icon}
            style={{ color: '#E96D76' }}
          />
          {!iconOnly && status}
        </>
      );
    case HealthStatus.Progressing:
      return (
        <StatusRunning>
          <Typography style={{ fontSize: '0.875rem' }}>
            {HealthStatus.Progressing}
          </Typography>
        </StatusRunning>
      );
    case HealthStatus.Missing:
      return (
        <>
          <GhostIcon
            dataTestId="missing-icon"
            className={iconOnly ? classes.iconOnly : classes.icon}
          />
          {!iconOnly && status}
        </>
      );
    default:
      return (
        <>
          <Status
            status="Unknown"
            iconStyles={{ color: 'green' }}
            iconOnly={iconOnly}
            iconClassName={iconOnly ? classes.bsIcon : ''}
            dataTestId="unknown-icon"
          />
          {!iconOnly && status}
        </>
      );
  }
};
