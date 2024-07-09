import {
  NodeInstance,
  ProcessInstanceError,
  ProcessInstanceStateValues,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { isNonNullable } from '../utils/TypeGuards';

export type WorkflowProgressNodeModel = NodeInstance & {
  status?: ProcessInstanceStateValues;
  error?: ProcessInstanceError;
};

export const fromNodeInstanceToWorkflowProgressNodeModel =
  (
    workflowStatus?: ProcessInstanceStateValues,
    workflowError?: ProcessInstanceError,
  ) =>
  (
    node: NodeInstance,
    nodeIndex: number,
    nodes: NodeInstance[],
  ): WorkflowProgressNodeModel => {
    const isLastNode = nodeIndex === nodes.length - 1;
    const model: WorkflowProgressNodeModel = {
      ...node,
      status: workflowStatus,
      enter: new Date(node.enter),
    };

    if (isNonNullable(node.exit)) {
      model.exit = new Date(node.exit);
    }

    if (node.definitionId === workflowError?.nodeDefinitionId) {
      model.status = 'ERROR';
      model.error = workflowError;
    } else if (node.enter && node.exit) {
      model.status = 'COMPLETED';
    } else if (!node.exit) {
      model.status = 'ACTIVE';
    }

    if (
      workflowStatus &&
      isLastNode &&
      ['ABORTED', 'SUSPENDED'].includes(workflowStatus)
    ) {
      model.status = workflowStatus;
    }

    return model;
  };
