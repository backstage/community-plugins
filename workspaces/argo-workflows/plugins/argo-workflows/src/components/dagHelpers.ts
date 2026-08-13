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

import { useCallback, useRef, useState } from 'react';
import type { WheelEvent, MouseEvent, KeyboardEvent, RefObject } from 'react';
import type {
  DAGNode,
  DAGGraph,
} from '@backstage-community/plugin-argo-workflows-react';
import dagre from 'dagre';

/** Node with computed x/y position from dagre layout. */
export interface LayoutNode extends DAGNode {
  x: number;
  y: number;
}

/** Edge with computed path points from dagre layout. */
export interface LayoutEdge {
  source: string;
  target: string;
  points: Array<{ x: number; y: number }>;
}

/** Complete layout result from dagre computation. */
export interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

/** Tooltip positioning and content state. */
export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  node: DAGNode | null;
}

/** Pan/zoom transform state. */
export interface TransformState {
  x: number;
  y: number;
  scale: number;
}

/** Configuration for node dimensions and layout spacing. */
export interface DAGLayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  nodeRx: number;
  padding: number;
  nodesep?: number;
  ranksep?: number;
  /** Maximum characters before truncating the node label. */
  labelMaxChars: number;
  /** Font size for node labels. */
  fontSize: number;
  /** Minimum zoom scale. */
  minScale: number;
  /** Maximum zoom scale. */
  maxScale: number;
}

/** X offset where a node's label text starts, clearing the accent bar and status icon. */
export const NODE_LABEL_X = 26;

/** X offset of the status icon inside a node. */
export const NODE_ICON_X = 10;

/** Rendered size of the status icon inside a node, in pixels. */
export const NODE_ICON_SIZE = 12;

/**
 * Trailing padding reserved to the right of a node label.
 *
 * `labelMaxChars` in the configs below is budgeted against
 * `nodeWidth - NODE_LABEL_X - NODE_LABEL_PADDING_RIGHT` so wide, all-caps
 * labels do not spill past the node's right edge.
 */
export const NODE_LABEL_PADDING_RIGHT = 8;

/** Layout config for the full-page DAG view. */
export const DAG_VIEW_CONFIG: DAGLayoutConfig = {
  nodeWidth: 180,
  nodeHeight: 40,
  nodeRx: 8,
  padding: 40,
  nodesep: 50,
  ranksep: 80,
  // (180 - 34) / 12px font at ~0.6em average glyph width
  labelMaxChars: 17,
  fontSize: 12,
  minScale: 0.1,
  maxScale: 5,
};

/** Layout config for the inline (table-row) DAG view. */
export const DAG_INLINE_CONFIG: DAGLayoutConfig = {
  nodeWidth: 160,
  nodeHeight: 36,
  nodeRx: 6,
  padding: 30,
  nodesep: 40,
  ranksep: 60,
  // (160 - 34) / 11px font at ~0.6em average glyph width
  labelMaxChars: 15,
  fontSize: 11,
  minScale: 0.3,
  maxScale: 3,
};

/**
 * Computes the dagre layout for a DAG graph using the given config.
 */
export function computeLayout(
  graph: DAGGraph,
  config: DAGLayoutConfig,
): LayoutResult {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',
    nodesep: config.nodesep ?? 40,
    ranksep: config.ranksep ?? 60,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of graph.nodes) {
    g.setNode(node.id, {
      width: config.nodeWidth,
      height: config.nodeHeight,
    });
  }
  for (const edge of graph.edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const nodes: LayoutNode[] = graph.nodes.map(node => {
    const pos = g.node(node.id);
    return { ...node, x: pos.x, y: pos.y };
  });

  const edges: LayoutEdge[] = graph.edges.map(edge => {
    const dagreEdge = g.edge(edge.source, edge.target);
    return {
      source: edge.source,
      target: edge.target,
      points: dagreEdge.points as Array<{ x: number; y: number }>,
    };
  });

  const dagreGraph = g.graph();
  const width = (dagreGraph.width ?? 0) + config.padding * 2;
  const height = (dagreGraph.height ?? 0) + config.padding * 2;

  return { nodes, edges, width, height };
}

/**
 * Tension divisor for the Catmull-Rom to cubic Bezier conversion. The
 * canonical value of 6 reproduces a standard (uniform) Catmull-Rom spline.
 */
const CATMULL_ROM_TENSION = 6;

/**
 * Builds an SVG path string from an array of points.
 *
 * - 0 points yields an empty path, 1 point yields a bare move.
 * - 2 points yield a single cubic with horizontal control handles, which suits
 *   the left-to-right rank direction dagre lays out.
 * - 3 or more points are joined with a uniform Catmull-Rom spline converted to
 *   cubic Bezier segments. Each interior waypoint shares a tangent between its
 *   incoming and outgoing segment, so the curve passes through every waypoint
 *   without the visible kinks that per-segment S-curves produce.
 */
export function buildEdgePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    const [start, end] = points;
    const midX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    // Endpoints are clamped (duplicated) so the spline starts and ends exactly
    // on the first and last point.
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / CATMULL_ROM_TENSION;
    const cp1y = p1.y + (p2.y - p0.y) / CATMULL_ROM_TENSION;
    const cp2x = p2.x - (p3.x - p1.x) / CATMULL_ROM_TENSION;
    const cp2y = p2.y - (p3.y - p1.y) / CATMULL_ROM_TENSION;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Truncates a label to the configured max length with an ellipsis. */
export function truncateLabel(label: string, maxChars: number): string {
  return label.length > maxChars
    ? `${label.substring(0, maxChars - 2)}…`
    : label;
}

/** Return type of the `useDAGInteraction` hook. */
export interface DAGInteraction {
  svgRef: RefObject<SVGSVGElement>;
  transform: TransformState;
  isPanning: boolean;
  tooltip: TooltipState;
  selectedNode: DAGNode | null;
  setSelectedNode: (node: DAGNode | null) => void;
  handlers: {
    onWheel: (e: WheelEvent<SVGSVGElement>) => void;
    onMouseDown: (e: MouseEvent<SVGSVGElement>) => void;
    onMouseMove: (e: MouseEvent<SVGSVGElement>) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
  nodeHandlers: {
    onMouseEnter: (e: MouseEvent, node: DAGNode) => void;
    onMouseLeave: () => void;
    onClick: (node: DAGNode) => void;
    onKeyDown: (e: KeyboardEvent, node: DAGNode) => void;
    onFocus: (node: DAGNode) => void;
    onBlur: () => void;
  };
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: (layout: LayoutResult) => void;
}

const ZOOM_FACTOR = 1.25;
const FIT_SCALE_MARGIN = 0.9;

/**
 * Hook that encapsulates all DAG pan/zoom, tooltip, and node selection logic.
 * Used by both `WorkflowDAGView` and `WorkflowDAGInline`.
 */
export function useDAGInteraction(config: DAGLayoutConfig): DAGInteraction {
  const svgRef = useRef<SVGSVGElement>(null) as RefObject<SVGSVGElement>;
  const [transform, setTransform] = useState<TransformState>({
    x: config.padding,
    y: config.padding,
    scale: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });
  const [selectedNode, setSelectedNode] = useState<DAGNode | null>(null);

  const onWheel = useCallback(
    (e: WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const scaleFactor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      setTransform(prev => {
        const newScale = Math.min(
          Math.max(prev.scale * scaleFactor, config.minScale),
          config.maxScale,
        );
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect) return { ...prev, scale: newScale };
        const mouseX = e.clientX - svgRect.left;
        const mouseY = e.clientY - svgRect.top;
        const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
        const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
        return { x: newX, y: newY, scale: newScale };
      });
    },
    [config.minScale, config.maxScale],
  );

  const onMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (e.button === 0) {
        setIsPanning(true);
        setPanStart({
          x: e.clientX - transform.x,
          y: e.clientY - transform.y,
        });
      }
    },
    [transform.x, transform.y],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (isPanning) {
        setTransform(prev => ({
          ...prev,
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        }));
      }
    },
    [isPanning, panStart.x, panStart.y],
  );

  const onMouseUp = useCallback(() => setIsPanning(false), []);

  const onMouseLeave = useCallback(() => {
    setIsPanning(false);
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const onNodeMouseEnter = useCallback((e: MouseEvent, node: DAGNode) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    setTooltip({
      visible: true,
      x: e.clientX - svgRect.left,
      y: e.clientY - svgRect.top,
      node,
    });
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const onNodeClick = useCallback((node: DAGNode) => {
    setSelectedNode(prev => (prev?.id === node.id ? null : node));
  }, []);

  const onNodeKeyDown = useCallback(
    (e: KeyboardEvent, node: DAGNode) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onNodeClick(node);
      }
    },
    [onNodeClick],
  );

  const onNodeFocus = useCallback((node: DAGNode) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;
    setTooltip({
      visible: true,
      x: svgRect.width / 2,
      y: svgRect.height / 2,
      node,
    });
  }, []);

  const onNodeBlur = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const zoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale * ZOOM_FACTOR, config.maxScale),
    }));
  }, [config.maxScale]);

  const zoomOut = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale / ZOOM_FACTOR, config.minScale),
    }));
  }, [config.minScale]);

  const fitToView = useCallback(
    (layout: LayoutResult) => {
      if (!svgRef.current) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const scaleX = svgRect.width / layout.width;
      const scaleY = svgRect.height / layout.height;
      const unclampedScale = Math.min(scaleX, scaleY, 1) * FIT_SCALE_MARGIN;
      const newScale = Math.min(
        Math.max(unclampedScale, config.minScale),
        config.maxScale,
      );
      const newX = (svgRect.width - layout.width * newScale) / 2;
      const newY = (svgRect.height - layout.height * newScale) / 2;
      setTransform({ x: newX, y: newY, scale: newScale });
    },
    [config.minScale, config.maxScale],
  );

  return {
    svgRef,
    transform,
    isPanning,
    tooltip,
    selectedNode,
    setSelectedNode,
    handlers: { onWheel, onMouseDown, onMouseMove, onMouseUp, onMouseLeave },
    nodeHandlers: {
      onMouseEnter: onNodeMouseEnter,
      onMouseLeave: onNodeMouseLeave,
      onClick: onNodeClick,
      onKeyDown: onNodeKeyDown,
      onFocus: onNodeFocus,
      onBlur: onNodeBlur,
    },
    zoomIn,
    zoomOut,
    fitToView,
  };
}
