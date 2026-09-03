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
  DAG_THEME,
  NODE_ICON_SIZE,
  NODE_ICON_X,
  NODE_LABEL_X,
  nodeOrigin,
  truncateLabel,
  type DAGLayoutConfig,
  type LayoutNode,
  type NodeHandlers,
} from '../dag';
import { StatusIcon } from './StatusIcon';

export interface DagNodeProps {
  node: LayoutNode;
  config: DAGLayoutConfig;
  isSelected: boolean;
  handlers: NodeHandlers;
  /** Class applied to the group, providing cursor and focus styling. */
  className?: string;
}

/**
 * A single task in the graph: a card with a status-coloured leading bar, a
 * status glyph and a truncated label.
 *
 * Rendered as a focusable button so the graph is reachable by keyboard.
 */
export function DagNode({
  node,
  config,
  isSelected,
  handlers,
  className,
}: DagNodeProps) {
  const { node: theme } = DAG_THEME;
  const { x, y } = nodeOrigin(node, config);
  const color = statusColor(node.status);
  const centerY = config.nodeHeight / 2;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className={className}
      role="button"
      aria-label={`${node.label}: ${node.status}`}
      aria-pressed={isSelected}
      tabIndex={0}
      onMouseEnter={event => handlers.onMouseEnter(event, node)}
      onMouseLeave={handlers.onMouseLeave}
      onFocus={() => handlers.onFocus(node)}
      onBlur={handlers.onBlur}
      onClick={() => handlers.onClick(node)}
      onKeyDown={event => handlers.onKeyDown(event, node)}
    >
      {/*
       * Must stay the first child: the CSS modules target `rect:first-child`
       * to draw the focus ring on the card outline.
       */}
      <rect
        width={config.nodeWidth}
        height={config.nodeHeight}
        rx={config.nodeRx}
        ry={config.nodeRx}
        fill="var(--bui-bg-neutral-1, #fff)"
        stroke={isSelected ? color : 'var(--bui-border-1)'}
        strokeWidth={isSelected ? theme.selectedBorderWidth : theme.borderWidth}
      />

      <rect
        x={0}
        y={theme.accentBarInset}
        width={theme.accentBarWidth}
        height={config.nodeHeight - theme.accentBarInset * 2}
        rx={theme.accentBarRx}
        ry={theme.accentBarRx}
        fill={color}
      />

      <foreignObject
        x={NODE_ICON_X}
        y={centerY - NODE_ICON_SIZE / 2}
        width={NODE_ICON_SIZE}
        height={NODE_ICON_SIZE}
      >
        <StatusIcon status={node.status} size={NODE_ICON_SIZE} />
      </foreignObject>

      <text
        x={NODE_LABEL_X}
        y={centerY}
        textAnchor="start"
        dominantBaseline="central"
        fill="var(--bui-fg-primary, #1a1a1a)"
        fontSize={config.fontSize}
        fontFamily="var(--bui-font-regular, sans-serif)"
      >
        {truncateLabel(node.label, config.labelMaxChars)}
      </text>
    </g>
  );
}
