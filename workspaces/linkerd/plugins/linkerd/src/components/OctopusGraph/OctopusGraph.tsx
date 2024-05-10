import { DeploymentResponse } from '../../api/types';
import { Entity } from '@backstage/catalog-model';
import 'reactflow/dist/style.css';
import React, { useCallback } from 'react';
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
      type: 'node',
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

  for (const [key, data] of Object.entries(stats.incoming?.deployment ?? {})) {
    initialNodes.push({
      id: key,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: 'node',
      data: {
        name: key,
        header: 'upstream',
        label: key,
        l5d: data,
        isSource: true,
      },
      position: { x: 0, y: 0 },
    });
    initialEdges.push({
      id: `${key}-to-current`,
      type: 'smoothstep',
      source: key,
      target: 'current',
      animated: true,
    });
  }

  for (const [key, data] of Object.entries(stats.outgoing?.deployment ?? {})) {
    initialNodes.push({
      id: key,
      data: {
        name: key,
        header: 'downstream',
        l5d: data,
        label: key,
        isTarget: true,
      },
      sourcePosition: Position.Left,
      targetPosition: Position.Right,
      type: 'node',
      position: { x: 0, y: 0 },
    });
    initialEdges.push({
      id: `current-to-${key}`,
      type: 'smoothstep',
      source: 'current',
      target: key,
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
      // This isn't ready yet, but it will display RPS and other metrics in the cards
      // nodeTypes={nodeTypes}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      panOnDrag
      zoomOnScroll
      attributionPosition="bottom-left"
    />
  );
};
