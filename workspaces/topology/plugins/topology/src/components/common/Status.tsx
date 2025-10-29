/*
 * Copyright 2025 The Backstage Authors
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

import { ReactElement, CSSProperties } from 'react';
import {
  StatusClassKey,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusWarning,
} from '@backstage/core-components';

import { createStyles, makeStyles, Theme } from '@material-ui/core';
import OffIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import UnknownIcon from '@mui/icons-material/HelpOutline';
import AngleDoubleRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import BanIcon from '@mui/icons-material/NotInterestedOutlined';
import PauseIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import cx from 'classnames';

import { StatusIconAndText } from './StatusIconAndText';

const useStyles = makeStyles<Theme>(theme =>
  createStyles({
    iconStyles: {
      height: '0.8em',
      width: '0.8em',
      top: '0.125em',
      position: 'relative',
      flexShrink: 0,
      marginRight: theme.spacing(0.6),
    },
  }),
);

const DASH = '-';

const useStatusStyles = makeStyles(theme => ({
  success: {
    '& svg': {
      fill: theme.palette.status.ok,
    },
  },
  running: {
    '& svg': {
      fill: theme.palette.status.running,
    },
  },
  pending: {
    '& svg': {
      fill: theme.palette.status.pending,
    },
  },
  warning: {
    '& svg': {
      fill: theme.palette.status.warning,
    },
  },
  error: {
    '& svg': {
      fill: theme.palette.status.error,
    },
  },
}));

const StatusIcon = ({
  statusKey,
  className,
}: {
  statusKey: StatusClassKey;
  className?: string;
}) => {
  const statusStyles = useStatusStyles();

  switch (statusKey) {
    case 'ok':
      return (
        <g className={cx(statusStyles.success, className)}>
          <StatusOK />{' '}
        </g>
      );
    case 'pending':
      return (
        <g className={cx(statusStyles.pending, className)}>
          <StatusPending />{' '}
        </g>
      );
    case 'running':
      return (
        <g className={cx(statusStyles.running, className)}>
          <StatusRunning />{' '}
        </g>
      );
    case 'warning':
      return (
        <g className={cx(statusStyles.warning, className)}>
          <StatusWarning />{' '}
        </g>
      );
    case 'error':
      return (
        <g className={cx(statusStyles.error, className)}>
          <StatusError />{' '}
        </g>
      );
    default:
      return null;
  }
};

/**
 * Component for displaying a status message
 * @param {string} status - type of status to be displayed
 * @param {boolean} [iconOnly] - (optional) if true, only displays icon
 * @param {string} [className] - (optional) additional class name for the component
 * @param {string} [displayStatusText] - (optional) use a different text to display the status

 * @example
 * ```tsx
 * <Status status='Warning' />
 * ```
 */
export const Status = ({
  status,
  iconOnly,
  className,
  displayStatusText,
  dataTestId,
  iconStyles,
  iconClassName,
}: {
  status: string | null;
  displayStatusText?: string;
  iconOnly?: boolean;
  className?: string;
  dataTestId?: string;
  iconStyles?: CSSProperties;
  iconClassName?: string;
}): ReactElement => {
  const classes = useStyles();
  const statusProps = {
    title: displayStatusText || status || '',
    iconOnly,
    className,
    dataTestId,
  };

  switch (status) {
    case 'New':
    case 'Idle':
    case 'Pending':
    case 'PipelineNotStarted':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<StatusIcon statusKey="pending" className={iconClassName} />}
        />
      );

    case 'In Progress':
    case 'Progress':
    case 'Progressing':
    case 'Installing':
    case 'InstallReady':
    case 'Replacing':
    case 'Running':
    case 'Updating':
    case 'Upgrading':
    case 'PendingInstall':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<StatusIcon statusKey="running" className={iconClassName} />}
        />
      );

    case 'Cancelled':
    case 'Deleting':
    case 'Expired':
    case 'Not Ready':
    case 'Cancelling':
    case 'Terminating':
    case 'Superseded':
    case 'Uninstalling':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<BanIcon className={classes.iconStyles} style={iconStyles} />}
        />
      );

    case 'Warning':
    case 'RequiresApproval':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<StatusIcon statusKey="warning" className={iconClassName} />}
        />
      );

    case 'ImagePullBackOff':
    case 'Error':
    case 'Failed':
    case 'Failure':
    case 'CrashLoopBackOff':
    case 'ErrImagePull':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<StatusIcon statusKey="error" className={iconClassName} />}
        />
      );

    case 'Completed':
    case 'Succeeded':
    case 'Synced':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<StatusIcon statusKey="ok" className={iconClassName} />}
        />
      );

    case 'Skipped':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <AngleDoubleRightIcon
              className={classes.iconStyles}
              style={iconStyles}
            />
          }
        />
      );
    case 'Paused':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<PauseIcon className={classes.iconStyles} style={iconStyles} />}
        />
      );
    case 'Stopped':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<OffIcon className={classes.iconStyles} style={iconStyles} />}
        />
      );

    case 'Unknown':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <UnknownIcon className={classes.iconStyles} style={iconStyles} />
          }
        />
      );

    default:
      return <>{status || DASH}</>;
  }
};
