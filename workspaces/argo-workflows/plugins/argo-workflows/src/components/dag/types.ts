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

import type { WheelEvent, MouseEvent, KeyboardEvent, RefObject } from 'react';
import type { DAGNode } from '@backstage-community/plugin-argo-workflows-react';

/** A point in the DAG's own (pre-transform) coordinate space. */
export interface Point {
  x: number;
  y: number;
}

/** A DAG node with its position resolved by the layout engine. */
export interface LayoutNode extends DAGNode {
  x: number;
  y: number;
}

/** A DAG edge with its waypoints resolved by the layout engine. */
export interface LayoutEdge {
  source: string;
  target: string;
  points: Point[];
}

/** A fully positioned graph, including the total bounds of the drawing. */
export interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

/** Which node the tooltip describes, and where to draw it. */
export interface TooltipState {
  visible: boolean;
  /** Offset from the canvas's top-left corner, in pixels. */
  x: number;
  y: number;
  node: DAGNode | null;
}

/** The current pan offset and zoom level of the canvas. */
export interface TransformState {
  x: number;
  y: number;
  scale: number;
}

/**
 * Node dimensions, spacing and zoom limits for a DAG rendering.
 *
 * Two presets exist — see `DAG_VIEW_CONFIG` and `DAG_INLINE_CONFIG` — because
 * the full-page and panel-embedded views need different node sizes.
 */
export interface DAGLayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  /** Corner radius of a node's background rectangle. */
  nodeRx: number;
  /** Margin added around the drawing, and the initial pan offset. */
  padding: number;
  /** Separation between nodes within a rank. Defaults to 40. */
  nodesep?: number;
  /** Separation between ranks. Defaults to 60. */
  ranksep?: number;
  /** Maximum characters before truncating the node label. */
  labelMaxChars: number;
  /** Font size for node labels. */
  fontSize: number;
  minScale: number;
  maxScale: number;
}

/** Pan/zoom handlers bound to the canvas element itself. */
export interface CanvasHandlers {
  onWheel: (e: WheelEvent<SVGSVGElement>) => void;
  onMouseDown: (e: MouseEvent<SVGSVGElement>) => void;
  onMouseMove: (e: MouseEvent<SVGSVGElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

/** Hover, focus and activation handlers bound to each node. */
export interface NodeHandlers {
  onMouseEnter: (e: MouseEvent, node: DAGNode) => void;
  onMouseLeave: () => void;
  onClick: (node: DAGNode) => void;
  onKeyDown: (e: KeyboardEvent, node: DAGNode) => void;
  onFocus: (node: DAGNode) => void;
  onBlur: () => void;
}

/** Everything `useDagInteraction` exposes to a canvas. */
export interface DAGInteraction {
  svgRef: RefObject<SVGSVGElement>;
  transform: TransformState;
  isPanning: boolean;
  tooltip: TooltipState;
  selectedNode: DAGNode | null;
  setSelectedNode: (node: DAGNode | null) => void;
  handlers: CanvasHandlers;
  nodeHandlers: NodeHandlers;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: (layout: LayoutResult) => void;
}
