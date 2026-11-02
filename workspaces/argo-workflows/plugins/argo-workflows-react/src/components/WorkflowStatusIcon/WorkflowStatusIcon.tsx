/*
 * Copyright 2026 The Backstage Authors
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

import type { PropsWithChildren } from 'react';
import type { WorkflowStatus } from '@backstage-community/plugin-argo-workflows-common';
import { Text } from '@backstage/ui';
import {
  RiTimeLine,
  RiLoader4Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiErrorWarningLine,
} from '@remixicon/react';
import classNames from 'classnames';
import styles from './WorkflowStatusIcon.module.css';

/**
 * Props for the WorkflowStatusIcon component.
 *
 * @public
 */
export interface WorkflowStatusIconProps {
  /** The workflow execution status to display */
  status: WorkflowStatus;
  /** Icon size variant — ignored in the Flux-style layout, kept for API compat */
  size?: 'small' | 'medium' | 'large';
}

function StatusSucceeded(props: PropsWithChildren<{}>) {
  const { children, ...rest } = props;
  return (
    <Text className={styles.status} aria-label="Status: Succeeded" {...rest}>
      <RiCheckboxCircleLine
        className={classNames(
          styles.succeeded,
          styles.statusIcon,
          styles.statusIconSize,
        )}
      />
      {children}
    </Text>
  );
}

function StatusFailed(props: PropsWithChildren<{}>) {
  const { children, ...rest } = props;
  return (
    <Text className={styles.status} aria-label="Status: Failed" {...rest}>
      <RiCloseCircleLine
        className={classNames(
          styles.failed,
          styles.statusIcon,
          styles.statusIconSize,
        )}
      />
      {children}
    </Text>
  );
}

function StatusRunning(props: PropsWithChildren<{}>) {
  const { children, ...rest } = props;
  return (
    <Text className={styles.status} aria-label="Status: Running" {...rest}>
      <RiLoader4Line
        className={classNames(
          styles.running,
          styles.statusIcon,
          styles.statusIconSize,
          styles.spin,
        )}
      />
      {children}
    </Text>
  );
}

function StatusPending(props: PropsWithChildren<{}>) {
  const { children, ...rest } = props;
  return (
    <Text className={styles.status} aria-label="Status: Pending" {...rest}>
      <RiTimeLine
        className={classNames(
          styles.pending,
          styles.statusIcon,
          styles.statusIconSize,
        )}
      />
      {children}
    </Text>
  );
}

function StatusError(props: PropsWithChildren<{}>) {
  const { children, ...rest } = props;
  return (
    <Text className={styles.status} aria-label="Status: Error" {...rest}>
      <RiErrorWarningLine
        className={classNames(
          styles.error,
          styles.statusIcon,
          styles.statusIconSize,
        )}
      />
      {children}
    </Text>
  );
}

/**
 * Displays a colored icon representing a workflow execution status.
 *
 * Uses Remix Icons with BUI CSS custom-property tokens for colors,
 * following the same pattern as the Flux plugin's KubeStatusIndicator.
 *
 * @public
 */
export const WorkflowStatusIcon = ({ status }: WorkflowStatusIconProps) => {
  switch (status) {
    case 'Succeeded':
      return <StatusSucceeded>{status}</StatusSucceeded>;
    case 'Failed':
      return <StatusFailed>{status}</StatusFailed>;
    case 'Running':
      return <StatusRunning>{status}</StatusRunning>;
    case 'Pending':
      return <StatusPending>{status}</StatusPending>;
    case 'Error':
      return <StatusError>{status}</StatusError>;
    default:
      return <StatusPending>{status}</StatusPending>;
  }
};
