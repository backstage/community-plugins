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

import type {
  Workflow,
  WorkflowStatus,
} from '@backstage-community/plugin-argo-workflows-common';

/**
 * A node in the DAG representation of a workflow.
 *
 * @public
 */
export interface DAGNode {
  id: string;
  label: string;
  status: WorkflowStatus;
  startedAt?: string;
  finishedAt?: string;
  duration?: number;
  type: string;
  message?: string;
}

/**
 * A directed edge in the DAG.
 *
 * @public
 */
export interface DAGEdge {
  source: string;
  target: string;
}

/**
 * The complete DAG graph for a workflow.
 *
 * @public
 */
export interface DAGGraph {
  nodes: DAGNode[];
  edges: DAGEdge[];
}

/**
 * Calculate duration in seconds between two ISO date strings.
 * Returns undefined if either date is missing.
 */
function calculateDuration(
  startedAt?: string,
  finishedAt?: string,
): number | undefined {
  if (!startedAt || !finishedAt) {
    return undefined;
  }
  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  return Math.round((end - start) / 1000);
}

/**
 * Detect cycles in the graph using DFS.
 * Throws a descriptive error if a cycle is found.
 */
function detectCycles(adjacency: Map<string, string[]>): void {
  const WHITE = 0; // unvisited
  const GRAY = 1; // in current DFS path
  const BLACK = 2; // fully processed

  const color = new Map<string, number>();
  for (const nodeId of adjacency.keys()) {
    color.set(nodeId, WHITE);
  }

  function dfs(nodeId: string, path: string[]): void {
    color.set(nodeId, GRAY);
    path.push(nodeId);

    const children = adjacency.get(nodeId) ?? [];
    for (const child of children) {
      const childColor = color.get(child);
      if (childColor === GRAY) {
        // Found a cycle — build a descriptive message
        const cycleStart = path.indexOf(child);
        const cyclePath = [...path.slice(cycleStart), child];
        throw new Error(
          `Cycle detected in workflow DAG: ${cyclePath.join(' → ')}`,
        );
      }
      if (childColor === WHITE) {
        dfs(child, path);
      }
    }

    path.pop();
    color.set(nodeId, BLACK);
  }

  for (const nodeId of adjacency.keys()) {
    if (color.get(nodeId) === WHITE) {
      dfs(nodeId, []);
    }
  }
}

/**
 * Build a DAG graph from a Workflow object.
 *
 * Creates a node for each entry in `status.nodes` and a directed edge
 * for each parent→child relationship via the `children` field.
 * Detects cycles and throws a descriptive error if one is found.
 *
 * @param workflow - The Argo Workflow object
 * @returns The DAG graph with nodes and edges
 * @throws Error if the workflow DAG contains a cycle
 *
 * @public
 */
export function buildDAG(workflow: Workflow): DAGGraph {
  const workflowNodes = workflow.status.nodes ?? {};

  const nodes: DAGNode[] = [];
  const edges: DAGEdge[] = [];
  const adjacency = new Map<string, string[]>();

  // Initialize adjacency map for all nodes
  for (const nodeId of Object.keys(workflowNodes)) {
    adjacency.set(nodeId, []);
  }

  // Build nodes and edges
  for (const [nodeId, wfNode] of Object.entries(workflowNodes)) {
    nodes.push({
      id: wfNode.id,
      label: wfNode.displayName,
      status: wfNode.phase,
      startedAt: wfNode.startedAt,
      finishedAt: wfNode.finishedAt,
      duration: calculateDuration(wfNode.startedAt, wfNode.finishedAt),
      type: wfNode.type,
      message: wfNode.message,
    });

    if (wfNode.children) {
      for (const childId of wfNode.children) {
        edges.push({
          source: nodeId,
          target: childId,
        });
        adjacency.get(nodeId)?.push(childId);
      }
    }
  }

  // Detect cycles before returning
  detectCycles(adjacency);

  return { nodes, edges };
}
