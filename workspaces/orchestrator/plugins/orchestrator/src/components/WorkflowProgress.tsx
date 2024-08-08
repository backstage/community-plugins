import React from 'react';

import { ProcessInstance } from '@backstage-community/plugin-orchestrator-common';

import { compareNodes } from '../utils/NodeInstanceUtils';
import { Paragraph } from './Paragraph';
import { WorkflowProgressNode } from './WorkflowProgressNode';
import { fromNodeInstanceToWorkflowProgressNodeModel } from './WorkflowProgressNodeModel';

export interface WorkflowProgressProps {
  workflowStatus: ProcessInstance['state'];
  workflowNodes: ProcessInstance['nodes'];
  workflowError?: ProcessInstance['error'];
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
