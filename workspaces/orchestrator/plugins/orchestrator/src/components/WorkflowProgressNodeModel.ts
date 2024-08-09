import {
  NodeInstanceDTO,
  ProcessInstanceErrorDTO,
  ProcessInstanceStatusDTO,
} from '@backstage-community/plugin-orchestrator-common';

import { isNonNullable } from '../utils/TypeGuards';

export type WorkflowProgressNodeModel = NodeInstanceDTO & {
  status?: ProcessInstanceStatusDTO;
  error?: ProcessInstanceErrorDTO;
};

export const fromNodeInstanceToWorkflowProgressNodeModel =
  (
    workflowStatus?: ProcessInstanceStatusDTO,
    workflowError?: ProcessInstanceErrorDTO,
  ) =>
  (
    node: NodeInstanceDTO,
    nodeIndex: number,
    nodes: NodeInstanceDTO[],
  ): WorkflowProgressNodeModel => {
    const isLastNode = nodeIndex === nodes.length - 1;
    const model: WorkflowProgressNodeModel = {
      ...node,
      status: workflowStatus,
      enter: node.enter,
    };

    if (isNonNullable(node.exit)) {
      model.exit = node.exit;
    }

    if (node.definitionId === workflowError?.nodeDefinitionId) {
      model.status = 'Error';
      model.error = workflowError;
    } else if (node.enter && node.exit) {
      model.status = 'Completed';
    } else if (!node.exit) {
      model.status = 'Active';
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
