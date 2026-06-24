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

import { StatusClassKey } from '@backstage/core-components';
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiErrorWarningLine,
  RiQuestionLine,
  RiSkipForwardLine,
  RiPauseCircleLine,
  RiStopCircleLine,
} from '@remixicon/react';
import cx from 'classnames';

import { StatusIconAndText } from './StatusIconAndText';
import { PendingStatusIcon, RunningStatusIcon } from './StatusIcons';
import styles from './Status.module.css';

const DASH = '-';

const StatusIcon = ({
  statusKey,
  className,
}: {
  statusKey: StatusClassKey;
  className?: string;
}) => {
  const iconClass = cx(styles.iconStyles, className);

  switch (statusKey) {
    case 'ok':
      return (
        <RiCheckboxCircleLine
          className={cx(iconClass, styles.success)}
          data-testid="status-ok"
          aria-hidden
        />
      );
    case 'pending':
      return (
        <PendingStatusIcon
          className={cx(iconClass, styles.pending)}
          data-testid="status-pending"
        />
      );
    case 'running':
      return (
        <RunningStatusIcon
          className={cx(iconClass, styles.running)}
          data-testid="status-running"
        />
      );
    case 'warning':
      return (
        <RiErrorWarningLine
          className={cx(iconClass, styles.warning)}
          data-testid="status-warning"
          aria-hidden
        />
      );
    case 'error':
      return (
        <RiCloseCircleLine
          className={cx(iconClass, styles.error)}
          data-testid="status-error"
          aria-hidden
        />
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
          icon={
            <RiCloseCircleLine
              className={cx(styles.iconStyles, styles.error)}
              style={iconStyles}
            />
          }
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
            <RiSkipForwardLine
              className={styles.iconStyles}
              style={iconStyles}
            />
          }
        />
      );
    case 'Paused':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <RiPauseCircleLine
              className={styles.iconStyles}
              style={iconStyles}
            />
          }
        />
      );
    case 'Stopped':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <RiStopCircleLine
              className={styles.iconStyles}
              style={iconStyles}
            />
          }
        />
      );

    case 'Unknown':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <RiQuestionLine className={styles.iconStyles} style={iconStyles} />
          }
        />
      );

    default:
      return <>{status || DASH}</>;
  }
};
