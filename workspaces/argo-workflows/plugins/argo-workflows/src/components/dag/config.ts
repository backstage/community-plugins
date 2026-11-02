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

import type { DAGLayoutConfig } from './types';

/** X offset where a node's label starts, clearing the accent bar and status icon. */
export const NODE_LABEL_X = 26;

/** X offset of the status icon inside a node. */
export const NODE_ICON_X = 10;

/** Rendered size of the status icon inside a node, in pixels. */
export const NODE_ICON_SIZE = 12;

/**
 * Trailing padding reserved to the right of a node label.
 *
 * `labelMaxChars` in the presets below is budgeted against
 * `nodeWidth - NODE_LABEL_X - NODE_LABEL_PADDING_RIGHT`, so wide all-caps
 * labels do not spill past the node's right edge.
 */
export const NODE_LABEL_PADDING_RIGHT = 8;

/**
 * Layout preset for the full-page DAG view.
 *
 * `labelMaxChars` is set conservatively rather than derived from the width, to
 * leave headroom for wide all-caps glyphs. `layout.test.ts` asserts it
 * still fits the available width if these numbers are ever adjusted.
 */
export const DAG_VIEW_CONFIG: DAGLayoutConfig = {
  nodeWidth: 180,
  nodeHeight: 40,
  nodeRx: 8,
  padding: 40,
  nodesep: 50,
  ranksep: 80,
  labelMaxChars: 17,
  fontSize: 12,
  minScale: 0.1,
  maxScale: 5,
};

/** Layout preset for the DAG embedded in the runs-table panel. */
export const DAG_INLINE_CONFIG: DAGLayoutConfig = {
  nodeWidth: 160,
  nodeHeight: 36,
  nodeRx: 6,
  padding: 30,
  nodesep: 40,
  ranksep: 60,
  labelMaxChars: 15,
  fontSize: 11,
  minScale: 0.3,
  maxScale: 3,
};

/**
 * Fixed visual measurements for the DAG drawing.
 *
 * These are deliberately kept out of `DAGLayoutConfig`: they do not vary
 * between the full-page and inline presets, and gathering them here keeps the
 * rendering components free of unexplained numeric literals.
 */
export const DAG_THEME = {
  /** Dashed connector lines between nodes. */
  edge: {
    strokeWidth: 1.5,
    dashArray: '6 4',
    /** Dot marking where an edge leaves its source node. */
    sourceDotRadius: 4,
    sourceDotStrokeWidth: 1.5,
  },

  /** Arrowhead marker drawn at each edge's target end. */
  arrow: {
    width: 8,
    height: 6,
    /** Placed at the tip so the arrow stops at the node border. */
    refX: 8,
    refY: 3,
    points: '0 0, 8 3, 0 6',
  },

  node: {
    borderWidth: 1,
    selectedBorderWidth: 2,
    /** Status-coloured bar down the leading edge of a node. */
    accentBarWidth: 4,
    /** Gap above and below the accent bar. */
    accentBarInset: 4,
    accentBarRx: 2,
  },

  /**
   * The minimap renders the same geometry at a much smaller scale, so strokes
   * are widened and dashes lengthened to stay legible once shrunk.
   */
  minimap: {
    edgeStrokeWidth: 3,
    edgeDashArray: '8 6',
    edgeOpacity: 0.5,
    nodeStrokeWidth: 3,
    viewportStrokeWidth: 4,
    viewportDashArray: '8 4',
    viewportOpacity: 0.6,
  },

  /** Offset of the tooltip from the cursor, so it never sits under the pointer. */
  tooltip: {
    offsetX: 12,
    offsetY: -10,
  },
} as const;
