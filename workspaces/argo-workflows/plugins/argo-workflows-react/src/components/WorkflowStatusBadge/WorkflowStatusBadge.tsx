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

import { Box, Flex, Text } from '@backstage/ui';
import type { WorkflowStatus } from '@backstage-community/plugin-argo-workflows-common';
import { WorkflowStatusIcon } from '../WorkflowStatusIcon';
import styles from './WorkflowStatusBadge.module.css';

/**
 * Props for the WorkflowStatusBadge component.
 *
 * @public
 */
export interface WorkflowStatusBadgeProps {
  /** The workflow execution status to display */
  status: WorkflowStatus;
}

const statusClassMap: Record<WorkflowStatus, string> = {
  Pending: styles.pending,
  Running: styles.running,
  Succeeded: styles.succeeded,
  Failed: styles.failed,
  Error: styles.error,
};

const statusLabelMap: Record<WorkflowStatus, string> = {
  Pending: 'Pending',
  Running: 'Running',
  Succeeded: 'Succeeded',
  Failed: 'Failed',
  Error: 'Error',
};

/**
 * Displays a workflow status as a badge containing an icon and a text label.
 *
 * Uses BUI components and CSS modules with BUI tokens for styling.
 *
 * @public
 */
export const WorkflowStatusBadge = ({ status }: WorkflowStatusBadgeProps) => {
  const label = statusLabelMap[status] ?? status;
  const colorClass = statusClassMap[status] ?? styles.pending;

  return (
    <Box
      className={`${styles.badge} ${colorClass}`}
      data-testid={`workflow-status-badge-${status.toLowerCase()}`}
    >
      <Flex align="center" style={{ gap: 'var(--bui-space-1)' }}>
        <WorkflowStatusIcon status={status} size="small" />
        <Text variant="body-small" weight="bold">
          {label}
        </Text>
      </Flex>
    </Box>
  );
};
