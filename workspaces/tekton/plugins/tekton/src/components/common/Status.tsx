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

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import OffIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import UnknownIcon from '@mui/icons-material/HelpOutline';
import AngleDoubleRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import BanIcon from '@mui/icons-material/NotInterestedOutlined';
import PauseIcon from '@mui/icons-material/PauseCircleOutlineOutlined';

import { StatusIconAndText } from './StatusIconAndText';

const DASH = '-';

const iconSx = {
  height: '0.8em',
  width: '0.8em',
  top: '0.125em',
  position: 'relative',
  flexShrink: 0,
  marginRight: 0.6,
};

const statusIconSx: Record<string, SxProps<Theme>> = {
  success: {
    '& svg': {
      fill: (theme: Theme) => theme.palette.status.ok,
    },
  },
  running: {
    '& svg': {
      fill: (theme: Theme) => theme.palette.status.running,
    },
  },
  pending: {
    '& svg': {
      fill: (theme: Theme) => theme.palette.status.pending,
    },
  },
  warning: {
    '& svg': {
      fill: (theme: Theme) => theme.palette.status.warning,
    },
  },
  error: {
    '& svg': {
      fill: (theme: Theme) => theme.palette.status.error,
    },
  },
};

const StatusIcon = ({
  statusKey,
  className,
}: {
  statusKey: StatusClassKey;
  className?: string;
}) => {
  const statusSx = statusIconSx[statusKey as keyof typeof statusIconSx];

  switch (statusKey) {
    case 'ok':
      return (
        <Box component="g" sx={statusSx} className={className}>
          <StatusOK />{' '}
        </Box>
      );
    case 'pending':
      return (
        <Box component="g" sx={statusSx} className={className}>
          <StatusPending />{' '}
        </Box>
      );
    case 'running':
      return (
        <Box component="g" sx={statusSx} className={className}>
          <StatusRunning />{' '}
        </Box>
      );
    case 'warning':
      return (
        <Box component="g" sx={statusSx} className={className}>
          <StatusWarning />{' '}
        </Box>
      );
    case 'error':
      return (
        <Box component="g" sx={statusSx} className={className}>
          <StatusError />{' '}
        </Box>
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
          icon={<BanIcon sx={iconSx} style={iconStyles} />}
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
          icon={<AngleDoubleRightIcon sx={iconSx} style={iconStyles} />}
        />
      );
    case 'Paused':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<PauseIcon sx={iconSx} style={iconStyles} />}
        />
      );
    case 'Stopped':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<OffIcon sx={iconSx} style={iconStyles} />}
        />
      );

    case 'Unknown':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<UnknownIcon sx={iconSx} style={iconStyles} />}
        />
      );

    default:
      return <>{status || DASH}</>;
  }
};
