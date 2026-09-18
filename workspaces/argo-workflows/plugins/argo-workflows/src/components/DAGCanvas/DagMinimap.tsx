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

import { statusColor } from '../utils';
import {
  buildEdgePath,
  DAG_THEME,
  nodeOrigin,
  type DAGLayoutConfig,
  type LayoutResult,
  type TransformState,
} from '../dag';

export interface DagMinimapProps {
  layout: LayoutResult;
  config: DAGLayoutConfig;
  transform: TransformState;
  /**
   * Rendered size of the canvas being summarised. Omitted until the canvas has
   * been measured, which hides the viewport outline.
   */
  canvasSize: { width: number; height: number } | null;
  className?: string;
}

/**
 * A scaled-down overview of the whole graph with an outline showing which part
 * is currently on screen.
 *
 * Presentational only — hidden from assistive technology, since everything it
 * conveys is already available from the graph itself.
 */
export function DagMinimap({
  layout,
  config,
  transform,
  canvasSize,
  className,
}: DagMinimapProps) {
  const { minimap: theme } = DAG_THEME;

  return (
    <div className={className} aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {layout.edges.map(edge => (
          <path
            key={`${edge.source}-${edge.target}`}
            d={buildEdgePath(edge.points)}
            fill="none"
            stroke="var(--bui-fg-info)"
            strokeWidth={theme.edgeStrokeWidth}
            strokeDasharray={theme.edgeDashArray}
            opacity={theme.edgeOpacity}
          />
        ))}

        {layout.nodes.map(node => {
          const { x, y } = nodeOrigin(node, config);
          return (
            <rect
              key={node.id}
              x={x}
              y={y}
              width={config.nodeWidth}
              height={config.nodeHeight}
              rx={config.nodeRx}
              fill="var(--bui-bg-neutral-1, #fff)"
              stroke={statusColor(node.status)}
              strokeWidth={theme.nodeStrokeWidth}
            />
          );
        })}

        {/*
         * The visible region in graph coordinates: undo the canvas pan and
         * divide its pixel size by the zoom level.
         */}
        {canvasSize && (
          <rect
            x={-transform.x / transform.scale}
            y={-transform.y / transform.scale}
            width={canvasSize.width / transform.scale}
            height={canvasSize.height / transform.scale}
            fill="none"
            stroke="var(--bui-fg-primary)"
            strokeWidth={theme.viewportStrokeWidth}
            strokeDasharray={theme.viewportDashArray}
            opacity={theme.viewportOpacity}
          />
        )}
      </svg>
    </div>
  );
}
