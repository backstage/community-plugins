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

import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Skeleton, Text } from '@backstage/ui';
import {
  useArgoWorkflowDetail,
  buildDAG,
} from '@backstage-community/plugin-argo-workflows-react';
import {
  computeLayout,
  useDAGInteraction,
  DAG_VIEW_CONFIG,
} from './dagHelpers';
import { formatDurationSeconds } from './utils';
import { DAGCanvas } from './DAGCanvas';
import styles from './WorkflowDAGView.module.css';

/** @public */
export interface WorkflowDAGViewProps {
  instanceName?: string;
}

/**
 * Full-page DAG visualization for a single Argo Workflow execution.
 * Fetches the workflow by namespace/name from route params, then renders
 * an interactive SVG with zoom/pan, status-colored nodes, and a detail panel.
 */
export const WorkflowDAGView = ({ instanceName }: WorkflowDAGViewProps) => {
  const { namespace = '', name = '' } = useParams<{
    namespace: string;
    name: string;
  }>();

  const { workflow, loading, error } = useArgoWorkflowDetail({
    namespace,
    name,
    instanceName,
  });

  const interaction = useDAGInteraction(DAG_VIEW_CONFIG);

  const layout = useMemo(() => {
    if (!workflow) return null;
    const workflowNodes = workflow.status.nodes ?? {};
    if (Object.keys(workflowNodes).length === 0) return null;
    try {
      const graph = buildDAG(workflow);
      return computeLayout(graph, DAG_VIEW_CONFIG);
    } catch {
      return null;
    }
  }, [workflow]);

  const handleFit = useCallback(() => {
    if (layout) interaction.fitToView(layout);
  }, [layout, interaction]);

  if (loading) {
    return (
      <div
        data-testid="workflow-dag-loading"
        aria-live="polite"
        aria-busy="true"
      >
        <Skeleton style={{ height: 600, width: '100%' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="workflow-dag-error">
        <Alert
          status="danger"
          icon
          title="Failed to load workflow"
          description={error.message}
        />
      </div>
    );
  }

  if (!workflow || !layout) {
    return (
      <div data-testid="workflow-dag-empty" role="status">
        <Alert
          status="info"
          icon
          title="No tasks"
          description="This workflow does not contain any tasks."
        />
      </div>
    );
  }

  return (
    <div data-testid="workflow-dag-view" className={styles.root}>
      <DAGCanvas
        layout={layout}
        config={DAG_VIEW_CONFIG}
        interaction={interaction}
        ariaLabel={`DAG for workflow ${name}`}
        markerId="arrowhead"
        styles={styles}
        onFit={handleFit}
      />

      <details
        id="workflow-dag-text-description"
        data-testid="workflow-dag-text-description"
        className={styles.srOnly}
      >
        <summary>Text description of the DAG</summary>
        <Text variant="body-small">
          Workflow {name} contains {layout.nodes.length} node
          {layout.nodes.length > 1 ? 's' : ''} and {layout.edges.length}{' '}
          dependency
          {layout.edges.length > 1 ? 'ies' : 'y'}.
        </Text>
        <ul>
          {layout.nodes.map(node => (
            <li key={node.id}>
              {node.label} — {node.status}
              {node.duration !== undefined
                ? ` (${formatDurationSeconds(node.duration)})`
                : ''}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};
