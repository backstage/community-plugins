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
import { DeploymentResponse } from '../../api/types';
import { Entity } from '@backstage/catalog-model';
import 'reactflow/dist/style.css';
import { useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Edge,
  Node,
  Position,
  ConnectionLineType,
  addEdge,
  Connection,
} from 'reactflow';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'LR',
) => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);

    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

export const OctopusGraph = ({
  stats,
  entity,
}: {
  stats: DeploymentResponse;
  entity: Entity;
}) => {
  const initialNodes: Node[] = [
    {
      id: 'current',
      position: { x: 0, y: 0 },
      sourcePosition: Position.Left,
      targetPosition: Position.Right,
      selected: true,
      type: 'default',
      data: {
        name: entity.metadata.name,
        isSource: true,
        isTarget: true,
        label: entity.metadata.name,
        header: 'current',
      },
    },
  ];

  const initialEdges: Edge[] = [];

  for (const node of stats.incoming.filter(t => t.type === 'deployment')) {
    initialNodes.push({
      id: node.name,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: 'input',
      data: {
        name: node.name,
        header: 'upstream',
        label: node.name,
        isSource: true,
      },
      position: { x: 0, y: 0 },
    });
    initialEdges.push({
      id: `${node.name}-to-current`,
      type: 'smoothstep',
      source: node.name,
      target: 'current',
      animated: true,
    });
  }

  for (const node of stats.outgoing.filter(t => t.type === 'deployment')) {
    initialNodes.push({
      id: node.name,
      data: {
        name: node.name,
        header: 'downstream',
        label: node.name,
        isTarget: true,
      },
      sourcePosition: Position.Left,
      targetPosition: Position.Right,
      type: 'output',
      position: { x: 0, y: 0 },
    });
    initialEdges.push({
      id: `current-to-${node.name}`,
      type: 'smoothstep',
      source: 'current',
      target: node.name,
      animated: true,
    });
  }

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges,
  );

  const [nodes, _, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges(eds =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds,
        ),
      ),
    [setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      panOnDrag={false}
      zoomOnScroll={false}
      nodesDraggable={false}
      zoomOnDoubleClick={false}
      attributionPosition="bottom-left"
    />
  );
};
