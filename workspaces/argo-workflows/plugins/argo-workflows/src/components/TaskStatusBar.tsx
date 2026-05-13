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

import { Flex, Text, Tooltip, TooltipTrigger } from '@backstage/ui';
import type { WorkflowStatus } from '@backstage-community/plugin-argo-workflows-common';
import type { WorkflowNode } from '@backstage-community/plugin-argo-workflows-common';
import styles from './TaskStatusBar.module.css';

/** Props for the TaskStatusBar component. */
export interface TaskStatusBarProps {
  /** The workflow nodes record from status.nodes. */
  nodes?: Record<string, WorkflowNode>;
}

/** Display order and CSS class for each status. */
const statusConfig: {
  status: WorkflowStatus;
  className: string;
  label: string;
}[] = [
  { status: 'Succeeded', className: styles.succeeded, label: 'Succeeded' },
  { status: 'Running', className: styles.running, label: 'Running' },
  { status: 'Pending', className: styles.pending, label: 'Pending' },
  { status: 'Failed', className: styles.failed, label: 'Failed' },
  { status: 'Error', className: styles.error, label: 'Error' },
];

/**
 * Counts task nodes by status, filtering to only Pod-type nodes
 * (actual task executions, not DAG/Steps/StepGroup orchestration nodes).
 */
function countByStatus(
  nodes?: Record<string, WorkflowNode>,
): Record<WorkflowStatus, number> {
  const counts: Record<WorkflowStatus, number> = {
    Pending: 0,
    Running: 0,
    Succeeded: 0,
    Failed: 0,
    Error: 0,
  };

  if (!nodes) return counts;

  for (const node of Object.values(nodes)) {
    if (node.type === 'Pod') {
      counts[node.phase] = (counts[node.phase] ?? 0) + 1;
    }
  }

  return counts;
}

/**
 * A horizontal stacked bar showing the proportion of task statuses
 * in a workflow, similar to the Tekton pipeline task status bar.
 *
 * Each segment is colored by status and sized proportionally.
 * Hovering shows a tooltip with the exact counts.
 */
export function TaskStatusBar({ nodes }: TaskStatusBarProps) {
  const counts = countByStatus(nodes);
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  if (total === 0) {
    return (
      <Text variant="body-small" color="secondary">
        —
      </Text>
    );
  }

  const tooltipText = statusConfig
    .filter(s => counts[s.status] > 0)
    .map(s => `${s.label}: ${counts[s.status]}`)
    .join(', ');

  return (
    <TooltipTrigger>
      <Flex align="center" style={{ gap: 'var(--bui-space-1)' }}>
        <div
          className={styles.bar}
          role="img"
          aria-label={`Task status: ${tooltipText}`}
        >
          {statusConfig.map(({ status, className }) => {
            const count = counts[status];
            if (count === 0) return null;
            const pct = (count / total) * 100;
            return (
              <div
                key={status}
                className={`${styles.segment} ${className}`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
        <Text variant="body-x-small" color="secondary" className={styles.count}>
          {total}
        </Text>
      </Flex>
      <Tooltip>{tooltipText}</Tooltip>
    </TooltipTrigger>
  );
}
