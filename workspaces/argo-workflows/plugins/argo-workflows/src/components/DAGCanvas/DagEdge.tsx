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

import { buildEdgePath, DAG_THEME, type LayoutEdge } from '../dag';

const EDGE_COLOR = 'var(--bui-fg-info)';

export interface ArrowMarkerProps {
  /** Document-unique id, since SVG marker references are global. */
  id: string;
}

/** The arrowhead shared by every edge, registered once in the SVG `<defs>`. */
export function ArrowMarker({ id }: ArrowMarkerProps) {
  const { width, height, refX, refY, points } = DAG_THEME.arrow;

  return (
    <marker
      id={id}
      markerWidth={width}
      markerHeight={height}
      refX={refX}
      refY={refY}
      orient="auto"
    >
      <polygon points={points} fill={EDGE_COLOR} />
    </marker>
  );
}

export interface DagEdgeProps {
  edge: LayoutEdge;
  /** Id of the `ArrowMarker` to terminate the line with. */
  markerId: string;
}

/** A dashed connector from one node to another, with a dot at its origin. */
export function DagEdge({ edge, markerId }: DagEdgeProps) {
  const { edge: theme } = DAG_THEME;
  const [origin] = edge.points;

  return (
    <g>
      <path
        d={buildEdgePath(edge.points)}
        fill="none"
        stroke={EDGE_COLOR}
        strokeWidth={theme.strokeWidth}
        strokeDasharray={theme.dashArray}
        markerEnd={`url(#${markerId})`}
      />
      {origin && (
        <circle
          cx={origin.x}
          cy={origin.y}
          r={theme.sourceDotRadius}
          fill="var(--bui-bg-neutral-1)"
          stroke={EDGE_COLOR}
          strokeWidth={theme.sourceDotStrokeWidth}
        />
      )}
    </g>
  );
}
