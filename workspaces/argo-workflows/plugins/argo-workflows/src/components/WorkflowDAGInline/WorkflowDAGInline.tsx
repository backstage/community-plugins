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

import { useCallback, useImperativeHandle, useMemo, forwardRef } from 'react';
import { Text } from '@backstage/ui';
import { buildDAG } from '@backstage-community/plugin-argo-workflows-react';
import type { Workflow } from '@backstage-community/plugin-argo-workflows-common';
import { computeLayout, useDAGInteraction, DAG_INLINE_CONFIG } from '../dag';
import { DAGCanvas } from '../DAGCanvas';
import styles from './WorkflowDAGInline.module.css';

/** Handle exposed by WorkflowDAGInline for external zoom control. */
export interface WorkflowDAGInlineHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: () => void;
}

/** @public */
export interface WorkflowDAGInlineProps {
  workflow: Workflow;
}

/**
 * Inline DAG visualization rendered inside an expandable table row.
 * Accepts a Workflow object directly — no routing or fetching needed.
 * Exposes zoom actions via ref (WorkflowDAGInlineHandle).
 */
export const WorkflowDAGInline = forwardRef<
  WorkflowDAGInlineHandle,
  WorkflowDAGInlineProps
>(({ workflow }, ref) => {
  const interaction = useDAGInteraction(DAG_INLINE_CONFIG);

  const layout = useMemo(() => {
    const workflowNodes = workflow.status.nodes ?? {};
    if (Object.keys(workflowNodes).length === 0)
      return { empty: true as const };
    try {
      const graph = buildDAG(workflow);
      return computeLayout(graph, DAG_INLINE_CONFIG);
    } catch {
      return { error: true as const };
    }
  }, [workflow]);

  const handleFit = useCallback(() => {
    if (layout && !('empty' in layout) && !('error' in layout)) {
      interaction.fitToView(layout);
    }
  }, [layout, interaction]);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => interaction.zoomIn(),
      zoomOut: () => interaction.zoomOut(),
      fitToView: () => {
        if (layout && !('empty' in layout) && !('error' in layout)) {
          interaction.fitToView(layout);
        }
      },
    }),
    [interaction, layout],
  );

  if (!layout || 'empty' in layout) {
    return (
      <div data-testid="workflow-dag-inline-empty" className={styles.empty}>
        <Text variant="body-small" color="secondary">
          This workflow does not contain any tasks.
        </Text>
      </div>
    );
  }

  if ('error' in layout) {
    return (
      <div data-testid="workflow-dag-inline-error" className={styles.empty}>
        <Text variant="body-small" color="secondary">
          Unable to render DAG visualization for this workflow.
        </Text>
      </div>
    );
  }

  return (
    <div data-testid="workflow-dag-inline" className={styles.root}>
      <DAGCanvas
        layout={layout}
        config={DAG_INLINE_CONFIG}
        interaction={interaction}
        ariaLabel={`DAG for workflow ${workflow.metadata.name}`}
        markerId="arrowhead-inline"
        styles={styles}
        onFit={handleFit}
        hideControls
      />
    </div>
  );
});

WorkflowDAGInline.displayName = 'WorkflowDAGInline';
