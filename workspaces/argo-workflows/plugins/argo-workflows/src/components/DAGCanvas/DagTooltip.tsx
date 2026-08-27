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

import { Text } from '@backstage/ui';
import type { DAGNode } from '@backstage-community/plugin-argo-workflows-react';
import { formatDurationSeconds, statusColor } from '../utils';
import { DAG_THEME } from '../dag';
import type { DAGCanvasStyles } from './styles';

export interface DagTooltipProps {
  node: DAGNode;
  /** Cursor position relative to the canvas, in pixels. */
  x: number;
  y: number;
  styles: DAGCanvasStyles;
}

/** Status and duration for the node currently under the cursor or focus ring. */
export function DagTooltip({ node, x, y, styles }: DagTooltipProps) {
  const { offsetX, offsetY } = DAG_THEME.tooltip;

  return (
    <div
      data-testid="workflow-dag-tooltip"
      role="tooltip"
      className={styles.tooltip}
      style={{ left: x + offsetX, top: y + offsetY }}
    >
      <div className={styles.tooltipTitle}>{node.label}</div>
      <div>
        <Text variant="body-x-small" className={styles.tooltipLabel}>
          Status:
        </Text>{' '}
        <Text
          variant="body-x-small"
          className={styles.tooltipStatus}
          style={{ color: statusColor(node.status) }}
        >
          {node.status}
        </Text>
      </div>
      <div>
        <Text variant="body-x-small" className={styles.tooltipLabel}>
          Duration:
        </Text>{' '}
        {formatDurationSeconds(node.duration)}
      </div>
    </div>
  );
}
