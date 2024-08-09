import React from 'react';

import { ProcessInstanceDTO } from '@backstage-community/plugin-orchestrator-common';

import { compareNodes } from '../utils/NodeInstanceUtils';
import { Paragraph } from './Paragraph';
import { WorkflowProgressNode } from './WorkflowProgressNode';
import { fromNodeInstanceToWorkflowProgressNodeModel } from './WorkflowProgressNodeModel';

export interface WorkflowProgressProps {
  workflowStatus: ProcessInstanceDTO['status'];
  workflowNodes: ProcessInstanceDTO['nodes'];
  workflowError?: ProcessInstanceDTO['error'];
  emptyState?: React.ReactNode;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  workflowStatus,
  workflowError,
  workflowNodes,
  emptyState = <Paragraph>No data available</Paragraph>,
}) => (
  <>
    {workflowNodes.length === 0
      ? emptyState
      : structuredClone(workflowNodes)
          .sort(compareNodes)
          .map(
            fromNodeInstanceToWorkflowProgressNodeModel(
              workflowStatus,
              workflowError,
            ),
          )
          .map(model => <WorkflowProgressNode model={model} key={model.id} />)}
  </>
);
WorkflowProgress.displayName = 'WorkflowProgress';
