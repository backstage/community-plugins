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

import { useRef } from 'react';
import { Button, Flex, Text } from '@backstage/ui';
import { WorkflowDAGInline } from '../WorkflowDAGInline';
import type { WorkflowDAGInlineHandle } from '../WorkflowDAGInline';
import { ZoomControls } from '../DAGCanvas';
import type { WorkflowItem } from '../utils';
import styles from './WorkflowRunsTable.module.css';

export interface WorkflowDAGPanelProps {
  workflow: WorkflowItem;
  onClose: () => void;
  /**
   * Horizontal bounds of the content column. The panel is `position: fixed`, so
   * it is positioned against the viewport and cannot inherit the column's width
   * — without this it would extend under the Backstage sidebar.
   */
  bounds: { left: number; width: number } | null;
}

/**
 * The DAG for one workflow run, pinned to the bottom of the viewport.
 *
 * Zoom controls live in this header rather than inside the canvas, so they sit
 * beside the close button and never overlap the graph. They drive the canvas
 * through an imperative handle.
 */
export function WorkflowDAGPanel({
  workflow,
  onClose,
  bounds,
}: WorkflowDAGPanelProps) {
  const dagRef = useRef<WorkflowDAGInlineHandle>(null);

  return (
    <div
      className={styles.detailPanel}
      role="region"
      aria-label="Workflow DAG view"
      style={bounds ? { left: bounds.left, width: bounds.width } : undefined}
    >
      <div className={styles.detailPanelHeader}>
        <Text variant="title-x-small">DAG — {workflow.metadata.name}</Text>

        <Flex align="center" style={{ gap: 'var(--bui-space-1)' }}>
          <ZoomControls
            onZoomIn={() => dagRef.current?.zoomIn()}
            onZoomOut={() => dagRef.current?.zoomOut()}
            onFit={() => dagRef.current?.fitToView()}
            className={styles.panelZoomControls}
          />
          <Button
            variant="tertiary"
            size="small"
            onPress={onClose}
            aria-label="Close DAG view"
          >
            Close
          </Button>
        </Flex>
      </div>

      <WorkflowDAGInline ref={dagRef} workflow={workflow} />
    </div>
  );
}
