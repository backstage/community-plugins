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
  WorkflowMetadata,
  WorkflowNode,
  WorkflowStatus,
  WorkflowStatusDetail,
} from './types';

const VALID_WORKFLOW_STATUSES: ReadonlySet<string> = new Set([
  'Pending',
  'Running',
  'Succeeded',
  'Failed',
  'Error',
]);

const VALID_NODE_TYPES: ReadonlySet<string> = new Set([
  'Pod',
  'Steps',
  'StepGroup',
  'DAG',
  'Retry',
  'Skipped',
  'Suspend',
]);

/**
 * Safely retrieves a nested value from a plain object using a dot-separated path.
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Parses a raw JSON response from the Argo Workflows API into a typed
 * {@link Workflow} object.
 *
 * Required fields: `metadata.name`, `metadata.namespace`, `status.phase`.
 * Unknown fields in the raw JSON are silently ignored.
 *
 * @param raw - The raw JSON object from the Argo API
 * @returns A typed Workflow object
 * @throws Error if any required field is missing
 *
 * @public
 */
export function parseWorkflow(raw: Record<string, unknown>): Workflow {
  // Validate required fields
  const missingFields: string[] = [];

  if (typeof getNestedValue(raw, 'metadata.name') !== 'string') {
    missingFields.push('metadata.name');
  }
  if (typeof getNestedValue(raw, 'metadata.namespace') !== 'string') {
    missingFields.push('metadata.namespace');
  }

  const rawPhase = getNestedValue(raw, 'status.phase');
  if (typeof rawPhase !== 'string' || !VALID_WORKFLOW_STATUSES.has(rawPhase)) {
    missingFields.push('status.phase');
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Invalid workflow response: missing or invalid required fields: ${missingFields.join(
        ', ',
      )}`,
    );
  }

  const rawMetadata = raw.metadata as Record<string, unknown>;
  const rawStatus = raw.status as Record<string, unknown>;

  const metadata: WorkflowMetadata = {
    name: rawMetadata.name as string,
    namespace: rawMetadata.namespace as string,
    uid: typeof rawMetadata.uid === 'string' ? rawMetadata.uid : '',
    creationTimestamp:
      typeof rawMetadata.creationTimestamp === 'string'
        ? rawMetadata.creationTimestamp
        : '',
  };

  if (
    rawMetadata.labels !== undefined &&
    rawMetadata.labels !== null &&
    typeof rawMetadata.labels === 'object'
  ) {
    metadata.labels = rawMetadata.labels as Record<string, string>;
  }

  if (
    rawMetadata.annotations !== undefined &&
    rawMetadata.annotations !== null &&
    typeof rawMetadata.annotations === 'object'
  ) {
    metadata.annotations = rawMetadata.annotations as Record<string, string>;
  }

  const status: WorkflowStatusDetail = {
    phase: rawStatus.phase as WorkflowStatus,
  };

  if (typeof rawStatus.startedAt === 'string') {
    status.startedAt = rawStatus.startedAt;
  }

  if (typeof rawStatus.finishedAt === 'string') {
    status.finishedAt = rawStatus.finishedAt;
  }

  if (typeof rawStatus.message === 'string') {
    status.message = rawStatus.message;
  }

  if (
    rawStatus.nodes !== undefined &&
    rawStatus.nodes !== null &&
    typeof rawStatus.nodes === 'object'
  ) {
    status.nodes = parseNodes(rawStatus.nodes as Record<string, unknown>);
  }

  return { metadata, status };
}

/**
 * Parses the raw nodes map into typed WorkflowNode records.
 */
function parseNodes(
  rawNodes: Record<string, unknown>,
): Record<string, WorkflowNode> {
  const nodes: Record<string, WorkflowNode> = {};

  for (const [id, rawNode] of Object.entries(rawNodes)) {
    if (
      rawNode === null ||
      rawNode === undefined ||
      typeof rawNode !== 'object'
    ) {
      continue;
    }
    const node = rawNode as Record<string, unknown>;

    const parsedNode: WorkflowNode = {
      id: typeof node.id === 'string' ? node.id : id,
      name: typeof node.name === 'string' ? node.name : '',
      displayName: typeof node.displayName === 'string' ? node.displayName : '',
      type:
        typeof node.type === 'string' && VALID_NODE_TYPES.has(node.type)
          ? (node.type as WorkflowNode['type'])
          : 'Pod',
      phase:
        typeof node.phase === 'string' &&
        VALID_WORKFLOW_STATUSES.has(node.phase)
          ? (node.phase as WorkflowStatus)
          : 'Pending',
    };

    if (typeof node.startedAt === 'string') {
      parsedNode.startedAt = node.startedAt;
    }

    if (typeof node.finishedAt === 'string') {
      parsedNode.finishedAt = node.finishedAt;
    }

    if (Array.isArray(node.children)) {
      parsedNode.children = node.children.filter(
        (c: unknown) => typeof c === 'string',
      );
    }

    if (typeof node.message === 'string') {
      parsedNode.message = node.message;
    }

    if (typeof node.templateName === 'string') {
      parsedNode.templateName = node.templateName;
    }

    nodes[id] = parsedNode;
  }

  return nodes;
}

/**
 * Formats a typed {@link Workflow} object into a plain JSON object
 * conforming to the Argo Workflows API schema.
 *
 * @param workflow - The typed Workflow object
 * @returns A plain JSON object suitable for the Argo API
 *
 * @public
 */
export function formatWorkflow(workflow: Workflow): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    name: workflow.metadata.name,
    namespace: workflow.metadata.namespace,
    uid: workflow.metadata.uid,
    creationTimestamp: workflow.metadata.creationTimestamp,
  };

  if (workflow.metadata.labels !== undefined) {
    metadata.labels = workflow.metadata.labels;
  }

  if (workflow.metadata.annotations !== undefined) {
    metadata.annotations = workflow.metadata.annotations;
  }

  const status: Record<string, unknown> = {
    phase: workflow.status.phase,
  };

  if (workflow.status.startedAt !== undefined) {
    status.startedAt = workflow.status.startedAt;
  }

  if (workflow.status.finishedAt !== undefined) {
    status.finishedAt = workflow.status.finishedAt;
  }

  if (workflow.status.message !== undefined) {
    status.message = workflow.status.message;
  }

  if (workflow.status.nodes !== undefined) {
    status.nodes = formatNodes(workflow.status.nodes);
  }

  return { metadata, status };
}

/**
 * Formats the typed nodes map into a plain JSON object.
 */
function formatNodes(
  nodes: Record<string, WorkflowNode>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [id, node] of Object.entries(nodes)) {
    const formatted: Record<string, unknown> = {
      id: node.id,
      name: node.name,
      displayName: node.displayName,
      type: node.type,
      phase: node.phase,
    };

    if (node.startedAt !== undefined) {
      formatted.startedAt = node.startedAt;
    }

    if (node.finishedAt !== undefined) {
      formatted.finishedAt = node.finishedAt;
    }

    if (node.children !== undefined) {
      formatted.children = node.children;
    }

    if (node.message !== undefined) {
      formatted.message = node.message;
    }

    if (node.templateName !== undefined) {
      formatted.templateName = node.templateName;
    }

    result[id] = formatted;
  }

  return result;
}
