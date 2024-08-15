import React from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core';
import ArrowCircleUpIcon from '@patternfly/react-icons/dist/esm/icons/arrow-alt-circle-up-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import CircleNotchIcon from '@patternfly/react-icons/dist/esm/icons/circle-notch-icon';
import GhostIcon from '@patternfly/react-icons/dist/esm/icons/ghost-icon';
import HeartBrokenIcon from '@patternfly/react-icons/dist/esm/icons/heart-broken-icon';
import HeartIcon from '@patternfly/react-icons/dist/esm/icons/heart-icon';
import PauseCircleIcon from '@patternfly/react-icons/dist/esm/icons/pause-circle-icon';
import QuestionCircleIcon from '@patternfly/react-icons/dist/esm/icons/question-circle-icon';

import { HealthStatus, SyncStatusCode, SyncStatuses } from '../../types';

const useIconStyles = makeStyles<Theme>(theme =>
  createStyles({
    icon: {
      marginLeft: theme.spacing(0.6),
    },
    'icon-spin': {
      animation: '$spin-animation 0.5s infinite',
      display: 'inline-block',
    },

    '@keyframes spin-animation': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(359deg)',
      },
    },
  }),
);
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
