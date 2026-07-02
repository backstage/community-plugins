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

import { ButtonIcon, Flex, Text } from '@backstage/ui';
import { WorkflowStatusIcon } from '@backstage-community/plugin-argo-workflows-react';
import type { DAGNode } from '@backstage-community/plugin-argo-workflows-react';
import { RiCloseLine } from '@remixicon/react';
import { formatDurationSeconds, formatDate } from '../utils';
import styles from './NodeDetailPanel.module.css';

/** Props for the NodeDetailPanel component. */
export interface NodeDetailPanelProps {
  /** The selected DAG node to display details for. */
  node: DAGNode;
  /** Callback when the panel is dismissed. */
  onClose: () => void;
}

/**
 * A detail panel that displays information about a selected DAG node.
 * Shown when a user clicks on a node in the DAG visualization.
 */
export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  return (
    <div
      className={styles.panel}
      data-testid="node-detail-panel"
      role="region"
      aria-label={`Details for node ${node.label}`}
    >
      <Flex align="center" justify="between" className={styles.header}>
        <Flex align="center" style={{ gap: 'var(--bui-space-2)' }}>
          <WorkflowStatusIcon status={node.status} size="medium" />
          <Text variant="title-x-small">{node.label}</Text>
        </Flex>
        <ButtonIcon
          variant="tertiary"
          icon={<RiCloseLine size={18} />}
          onPress={onClose}
          aria-label="Close detail panel"
        />
      </Flex>

      <div className={styles.body}>
        <div className={styles.row}>
          <Text variant="body-small" className={styles.label}>
            Type
          </Text>
          <Text variant="body-small">{node.type || '—'}</Text>
        </div>

        <div className={styles.row}>
          <Text variant="body-small" className={styles.label}>
            Duration
          </Text>
          <Text variant="body-small">
            {formatDurationSeconds(node.duration)}
          </Text>
        </div>

        <div className={styles.row}>
          <Text variant="body-small" className={styles.label}>
            Started
          </Text>
          <Text variant="body-small">{formatDate(node.startedAt)}</Text>
        </div>

        <div className={styles.row}>
          <Text variant="body-small" className={styles.label}>
            Finished
          </Text>
          <Text variant="body-small">{formatDate(node.finishedAt)}</Text>
        </div>

        {node.message && (
          <div
            className={
              node.status === 'Failed' || node.status === 'Error'
                ? styles.messageBoxDanger
                : styles.messageBox
            }
          >
            <Text variant="body-small" className={styles.messageText}>
              {node.message}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
