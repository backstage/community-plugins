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

import { ButtonIcon, Flex, Text } from '@backstage/ui';
import { RiAddLine, RiSubtractLine, RiFullscreenLine } from '@remixicon/react';
import { NodeDetailPanel } from './NodeDetailPanel';
import { formatDurationSeconds, statusColor } from './utils';
import {
  buildEdgePath,
  truncateLabel,
  type DAGInteraction,
  type DAGLayoutConfig,
  type LayoutResult,
} from './dagHelpers';

/**
 * Props for the DAGCanvas component.
 */
export interface DAGCanvasProps {
  layout: LayoutResult;
  config: DAGLayoutConfig;
  interaction: DAGInteraction;
  ariaLabel: string;
  markerId: string;
  /** CSS module styles — must provide: container, svg, panning, controls, tooltip, tooltipTitle, tooltipLabel, tooltipStatus, node */
  styles: Record<string, string>;
  /** Called when fit-to-view is triggered. */
  onFit: () => void;
}

/**
 * Shared SVG canvas for rendering a DAG with pan/zoom, tooltips, and node selection.
 * Used by both WorkflowDAGView and WorkflowDAGInline to avoid duplicating rendering logic.
 */
export function DAGCanvas({
  layout,
  config,
  interaction,
  ariaLabel,
  markerId,
  styles: s,
  onFit,
}: DAGCanvasProps) {
  const { nodes, edges } = layout;
  const {
    svgRef,
    transform,
    isPanning,
    tooltip,
    selectedNode,
    handlers,
    nodeHandlers,
  } = interaction;

  return (
    <Flex style={{ gap: 'var(--bui-space-4)' }}>
      <div className={s.container}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className={`${s.svg} ${isPanning ? s.panning : ''}`}
          onWheel={handlers.onWheel}
          onMouseDown={handlers.onMouseDown}
          onMouseMove={handlers.onMouseMove}
          onMouseUp={handlers.onMouseUp}
          onMouseLeave={handlers.onMouseLeave}
          role="img"
          aria-label={ariaLabel}
        >
          <defs>
            <marker
              id={markerId}
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="var(--bui-fg-secondary)"
              />
            </marker>
          </defs>

          <g
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
          >
            {edges.map(edge => (
              <path
                key={`${edge.source}-${edge.target}`}
                d={buildEdgePath(edge.points)}
                fill="none"
                stroke="var(--bui-fg-secondary)"
                strokeWidth={1.5}
                markerEnd={`url(#${markerId})`}
              />
            ))}

            {nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x - config.nodeWidth / 2}, ${
                    node.y - config.nodeHeight / 2
                  })`}
                  onMouseEnter={e => nodeHandlers.onMouseEnter(e, node)}
                  onMouseLeave={nodeHandlers.onMouseLeave}
                  onFocus={() => nodeHandlers.onFocus(node)}
                  onBlur={nodeHandlers.onBlur}
                  onClick={() => nodeHandlers.onClick(node)}
                  onKeyDown={e => nodeHandlers.onKeyDown(e, node)}
                  className={s.node}
                  role="button"
                  aria-label={`${node.label}: ${node.status}`}
                  aria-pressed={isSelected}
                  tabIndex={0}
                >
                  <rect
                    width={config.nodeWidth}
                    height={config.nodeHeight}
                    rx={config.nodeRx}
                    ry={config.nodeRx}
                    fill={statusColor(node.status)}
                    stroke={isSelected ? '#ffffff' : 'none'}
                    strokeWidth={isSelected ? 3 : 0}
                  />
                  <text
                    x={config.nodeWidth / 2}
                    y={config.nodeHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={config.fontSize}
                    fontFamily="sans-serif"
                  >
                    {truncateLabel(node.label, config.labelMaxChars)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        <div className={s.controls}>
          <ButtonIcon
            variant="secondary"
            icon={<RiAddLine size={16} />}
            onPress={interaction.zoomIn}
            aria-label="Zoom in"
          />
          <ButtonIcon
            variant="secondary"
            icon={<RiSubtractLine size={16} />}
            onPress={interaction.zoomOut}
            aria-label="Zoom out"
          />
          <ButtonIcon
            variant="secondary"
            icon={<RiFullscreenLine size={16} />}
            onPress={onFit}
            aria-label="Fit to view"
          />
        </div>

        {tooltip.visible && tooltip.node && (
          <div
            data-testid="workflow-dag-tooltip"
            role="tooltip"
            className={s.tooltip}
            style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
          >
            <div className={s.tooltipTitle}>{tooltip.node.label}</div>
            <div>
              <Text variant="body-x-small" className={s.tooltipLabel}>
                Status:
              </Text>{' '}
              <Text
                variant="body-x-small"
                className={s.tooltipStatus}
                style={{ color: statusColor(tooltip.node.status) }}
              >
                {tooltip.node.status}
              </Text>
            </div>
            <div>
              <Text variant="body-x-small" className={s.tooltipLabel}>
                Duration:
              </Text>{' '}
              {formatDurationSeconds(tooltip.node.duration)}
            </div>
          </div>
        )}
      </div>

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => interaction.setSelectedNode(null)}
        />
      )}
    </Flex>
  );
}
