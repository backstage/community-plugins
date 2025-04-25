/*
 * Copyright 2024 The Backstage Authors
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
import type { ComponentType } from 'react';

import {
  ComponentFactory,
  DagreLayout,
  DefaultTaskGroup,
  Graph,
  GraphComponent,
  GraphElement,
  LayoutFactory,
  ModelKind,
  PipelineDagreLayout,
  SpacerNode,
  TaskEdge,
  withPanZoom,
} from '@patternfly/react-topology';

import { NodeType, PipelineLayout } from '../../consts/pipeline-topology-const';
import { getLayoutData } from '../../utils/pipeline-topology-utils';
import PipelineTaskNode from './PipelineTaskNode';
import TaskGroupEdge from './TaskGroupEdge';

const GROUPED_EDGE_TYPE = 'GROUPED_EDGE';

export const layoutFactory: LayoutFactory = (type: string, graph: Graph) => {
  switch (type) {
    case PipelineLayout.DAGRE_BUILDER:
    case PipelineLayout.DAGRE_BUILDER_SPACED:
      return new DagreLayout(graph, {
        // Hack to get around undesirable defaults
        linkDistance: 0,
        nodeDistance: 0,
        groupDistance: 0,
        collideDistance: 0,
        simulationSpeed: 0,
        chargeStrength: 0,
        allowDrag: false,
        layoutOnDrag: false,
        ...getLayoutData(type),
      });
    case PipelineLayout.DAGRE_VIEWER:
      return new PipelineDagreLayout(graph, { nodesep: 25 });
    default:
      return undefined;
  }
};

const pipelineComponentFactory: ComponentFactory = (
  kind: ModelKind,
  type: string,
): ComponentType<{ element: GraphElement }> | undefined => {
  if (kind === ModelKind.graph) {
    return withPanZoom()(GraphComponent) as ComponentType<{
      element: GraphElement;
    }>;
  }
  if (kind === ModelKind.edge) {
    return TaskEdge as ComponentType<{ element: GraphElement }>;
  }
  if (kind === ModelKind.node) {
    switch (type) {
      case NodeType.TASK_NODE:
      case NodeType.FINALLY_NODE:
        return PipelineTaskNode as ComponentType<any>;
      case 'task-group':
      case NodeType.FINALLY_GROUP:
        return DefaultTaskGroup as ComponentType<{
          element: GraphElement;
        }>;
      case NodeType.SPACER_NODE:
        return SpacerNode as ComponentType<{ element: GraphElement }>;
      case 'finally-spacer-edge':
      case NodeType.EDGE:
        return TaskEdge as ComponentType<{ element: GraphElement }>;
      case GROUPED_EDGE_TYPE:
        return TaskGroupEdge as ComponentType<{ element: GraphElement }>;
      default:
        return undefined;
    }
  }
  return undefined;
};

export default pipelineComponentFactory;
