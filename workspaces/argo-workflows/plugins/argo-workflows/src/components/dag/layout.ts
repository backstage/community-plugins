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

import dagre from 'dagre';
import type { DAGGraph } from '@backstage-community/plugin-argo-workflows-react';
import type {
  DAGLayoutConfig,
  LayoutEdge,
  LayoutNode,
  LayoutResult,
  Point,
} from './types';

const DEFAULT_NODE_SEPARATION = 40;
const DEFAULT_RANK_SEPARATION = 60;

/**
 * Positions a graph left-to-right using dagre.
 *
 * The returned `width`/`height` include `config.padding` on all sides, so
 * fit-to-view can scale against the drawing's full visual bounds.
 */
export function computeLayout(
  graph: DAGGraph,
  config: DAGLayoutConfig,
): LayoutResult {
  const dagreGraph = new dagre.graphlib.Graph();

  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: config.nodesep ?? DEFAULT_NODE_SEPARATION,
    ranksep: config.ranksep ?? DEFAULT_RANK_SEPARATION,
  });
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  for (const node of graph.nodes) {
    dagreGraph.setNode(node.id, {
      width: config.nodeWidth,
      height: config.nodeHeight,
    });
  }
  for (const edge of graph.edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  dagre.layout(dagreGraph);

  const nodes: LayoutNode[] = graph.nodes.map(node => {
    const { x, y } = dagreGraph.node(node.id);
    return { ...node, x, y };
  });

  const edges: LayoutEdge[] = graph.edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    points: dagreGraph.edge(edge.source, edge.target).points as Point[],
  }));

  const { width = 0, height = 0 } = dagreGraph.graph();

  return {
    nodes,
    edges,
    width: width + config.padding * 2,
    height: height + config.padding * 2,
  };
}

/**
 * Tension divisor for the Catmull-Rom to cubic Bezier conversion. The canonical
 * value of 6 reproduces a standard (uniform) Catmull-Rom spline.
 */
const CATMULL_ROM_TENSION = 6;

/**
 * A single cubic with horizontal control handles.
 *
 * Used for direct connections, since dagre lays ranks out left-to-right and a
 * horizontal departure and arrival reads as a natural flow between columns.
 */
function horizontalCubic(start: Point, end: Point): string {
  const midX = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
}

/**
 * A uniform Catmull-Rom spline through every waypoint, emitted as cubics.
 *
 * Each interior waypoint shares a tangent between its incoming and outgoing
 * segment, so the curve passes through all waypoints without the visible kinks
 * that independently-curved segments produce.
 */
function catmullRomSpline(points: Point[]): string {
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    // Endpoints are clamped (duplicated) so the spline starts and ends exactly
    // on the first and last point rather than overshooting.
    const previous = points[i - 1] ?? points[i];
    const from = points[i];
    const to = points[i + 1];
    const next = points[i + 2] ?? points[i + 1];

    const control1 = {
      x: from.x + (to.x - previous.x) / CATMULL_ROM_TENSION,
      y: from.y + (to.y - previous.y) / CATMULL_ROM_TENSION,
    };
    const control2 = {
      x: to.x - (next.x - from.x) / CATMULL_ROM_TENSION,
      y: to.y - (next.y - from.y) / CATMULL_ROM_TENSION,
    };

    path += ` C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${to.x} ${to.y}`;
  }

  return path;
}

/**
 * Builds the SVG path for an edge from its layout waypoints.
 *
 * Empty input yields an empty path and a single point yields a bare move, so
 * callers can render degenerate edges without special-casing them.
 */
export function buildEdgePath(points: Point[]): string {
  switch (points.length) {
    case 0:
      return '';
    case 1:
      return `M ${points[0].x} ${points[0].y}`;
    case 2:
      return horizontalCubic(points[0], points[1]);
    default:
      return catmullRomSpline(points);
  }
}

/** Shortens a label to `maxChars`, marking the cut with an ellipsis. */
export function truncateLabel(label: string, maxChars: number): string {
  return label.length > maxChars
    ? `${label.substring(0, maxChars - 2)}…`
    : label;
}

/**
 * Converts a node's centre point, which is what the layout engine reports, into
 * the top-left origin that SVG rectangles are drawn from.
 */
export function nodeOrigin(node: Point, config: DAGLayoutConfig): Point {
  return {
    x: node.x - config.nodeWidth / 2,
    y: node.y - config.nodeHeight / 2,
  };
}
