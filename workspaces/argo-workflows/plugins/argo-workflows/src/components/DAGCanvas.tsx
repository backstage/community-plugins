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

import { useEffect, useState } from 'react';
import { ButtonIcon, Flex, Text } from '@backstage/ui';
import {
  RiAddLine,
  RiSubtractLine,
  RiFullscreenLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiLoader4Line,
  RiTimeLine,
  RiErrorWarningLine,
} from '@remixicon/react';
import { NodeDetailPanel } from './NodeDetailPanel';
import { formatDurationSeconds, statusColor } from './utils';
import type { WorkflowStatus } from '@backstage-community/plugin-argo-workflows-common';
import {
  buildEdgePath,
  truncateLabel,
  NODE_LABEL_X,
  NODE_ICON_X,
  NODE_ICON_SIZE,
  type DAGInteraction,
  type DAGLayoutConfig,
  type LayoutResult,
} from './dagHelpers';

/** Returns the Remix Icon element for a given workflow status. */
function StatusIcon({
  status,
  size = 12,
}: {
  status: WorkflowStatus;
  size?: number;
}) {
  const color = statusColor(status);
  const props = { size, color, style: { display: 'block' } };
  switch (status) {
    case 'Succeeded':
      return <RiCheckboxCircleLine {...props} />;
    case 'Failed':
      return <RiCloseCircleLine {...props} />;
    case 'Running':
      return <RiLoader4Line {...props} />;
    case 'Error':
      return <RiErrorWarningLine {...props} />;
    case 'Pending':
    default:
      return <RiTimeLine {...props} />;
  }
}

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
  /** When true, zoom controls are hidden (rendered externally). */
  hideControls?: boolean;
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
  hideControls,
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

  // Tracked in state rather than read from `svgRef` during render, so the
  // minimap viewport indicator paints on first commit and stays correct when
  // the canvas is resized.
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;

    const measure = () =>
      setCanvasSize({ width: el.clientWidth, height: el.clientHeight });

    measure();

    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [svgRef]);

  return (
    <Flex
      style={{
        gap: 'var(--bui-space-4)',
        flex: 1,
        height: '100%',
        minHeight: 0,
      }}
    >
      <div className={s.container}>
        {/* Zoom controls — placed above the canvas, never overlapping */}
        {!hideControls && (
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
        )}

        {/* DAG canvas area */}
        <div className={s.canvasArea}>
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
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="var(--bui-fg-info)" />
              </marker>
            </defs>

            <g
              transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
            >
              {edges.map(edge => {
                return (
                  <g key={`${edge.source}-${edge.target}`}>
                    <path
                      d={buildEdgePath(edge.points)}
                      fill="none"
                      stroke="var(--bui-fg-info)"
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      markerEnd={`url(#${markerId})`}
                    />
                    {/* Connection dot at source */}
                    {edge.points.length > 0 && (
                      <circle
                        cx={edge.points[0].x}
                        cy={edge.points[0].y}
                        r={4}
                        fill="var(--bui-bg-neutral-1)"
                        stroke="var(--bui-fg-info)"
                        strokeWidth={1.5}
                      />
                    )}
                  </g>
                );
              })}

              {nodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const nodeColor = statusColor(node.status);
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
                    {/* Node background */}
                    <rect
                      width={config.nodeWidth}
                      height={config.nodeHeight}
                      rx={config.nodeRx}
                      ry={config.nodeRx}
                      fill="var(--bui-bg-neutral-1, #fff)"
                      stroke={isSelected ? nodeColor : 'var(--bui-border-1)'}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    {/* Colored left accent bar */}
                    <rect
                      x={0}
                      y={4}
                      width={4}
                      height={config.nodeHeight - 8}
                      rx={2}
                      ry={2}
                      fill={nodeColor}
                    />
                    {/* Status icon */}
                    <foreignObject
                      x={NODE_ICON_X}
                      y={config.nodeHeight / 2 - NODE_ICON_SIZE / 2}
                      width={NODE_ICON_SIZE}
                      height={NODE_ICON_SIZE}
                    >
                      <StatusIcon status={node.status} size={NODE_ICON_SIZE} />
                    </foreignObject>
                    {/* Node label */}
                    <text
                      x={NODE_LABEL_X}
                      y={config.nodeHeight / 2}
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
              })}
            </g>
          </svg>

          {/* Minimap */}
          {layout.width > 0 && layout.height > 0 && (
            <div className={s.minimap} aria-hidden="true">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {edges.map(edge => (
                  <path
                    key={`mini-${edge.source}-${edge.target}`}
                    d={buildEdgePath(edge.points)}
                    fill="none"
                    stroke="var(--bui-fg-info)"
                    strokeWidth={3}
                    strokeDasharray="8 6"
                    opacity={0.5}
                  />
                ))}
                {nodes.map(node => (
                  <rect
                    key={`mini-${node.id}`}
                    x={node.x - config.nodeWidth / 2}
                    y={node.y - config.nodeHeight / 2}
                    width={config.nodeWidth}
                    height={config.nodeHeight}
                    rx={config.nodeRx}
                    fill="var(--bui-bg-neutral-1, #fff)"
                    stroke={statusColor(node.status)}
                    strokeWidth={3}
                  />
                ))}
                {/* Viewport indicator */}
                {canvasSize && (
                  <rect
                    x={-transform.x / transform.scale}
                    y={-transform.y / transform.scale}
                    width={canvasSize.width / transform.scale}
                    height={canvasSize.height / transform.scale}
                    fill="none"
                    stroke="var(--bui-fg-primary)"
                    strokeWidth={4}
                    strokeDasharray="8 4"
                    opacity={0.6}
                  />
                )}
              </svg>
            </div>
          )}

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
