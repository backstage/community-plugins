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

import { Flex } from '@backstage/ui';
import { NodeDetailPanel } from '../NodeDetailPanel';
import type { DAGInteraction, DAGLayoutConfig, LayoutResult } from '../dag';
import { ArrowMarker, DagEdge } from './DagEdge';
import { DagMinimap } from './DagMinimap';
import { DagNode } from './DagNode';
import { DagTooltip } from './DagTooltip';
import { useElementRect } from '../hooks/useElementRect';
import { ZoomControls } from './ZoomControls';
import type { DAGCanvasStyles } from './styles';

export interface DAGCanvasProps {
  layout: LayoutResult;
  config: DAGLayoutConfig;
  interaction: DAGInteraction;
  /** Describes the graph to assistive technology. */
  ariaLabel: string;
  /** Document-unique id for this canvas's arrowhead marker. */
  markerId: string;
  styles: DAGCanvasStyles;
  onFit: () => void;
  /** Set when the view renders zoom controls itself, outside the canvas. */
  hideControls?: boolean;
}

/**
 * Renders a positioned graph as pannable, zoomable SVG.
 *
 * Shared by the full-page and inline DAG views. Layout and interaction state are
 * supplied by the caller (`computeLayout` and `useDAGInteraction`), leaving this
 * component responsible only for drawing.
 */
export function DAGCanvas({
  layout,
  config,
  interaction,
  ariaLabel,
  markerId,
  styles,
  onFit,
  hideControls,
}: DAGCanvasProps) {
  const {
    svgRef,
    transform,
    isPanning,
    tooltip,
    selectedNode,
    handlers,
    nodeHandlers,
    setSelectedNode,
  } = interaction;

  const canvasSize = useElementRect(svgRef);
  const hasDrawableArea = layout.width > 0 && layout.height > 0;

  return (
    <Flex
      style={{
        gap: 'var(--bui-space-4)',
        flex: 1,
        height: '100%',
        minHeight: 0,
      }}
    >
      <div className={styles.container}>
        {!hideControls && (
          <ZoomControls
            onZoomIn={interaction.zoomIn}
            onZoomOut={interaction.zoomOut}
            onFit={onFit}
            className={styles.controls}
          />
        )}

        <div className={styles.canvasArea}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className={[styles.svg, isPanning && styles.panning]
              .filter(Boolean)
              .join(' ')}
            role="img"
            aria-label={ariaLabel}
            onWheel={handlers.onWheel}
            onMouseDown={handlers.onMouseDown}
            onMouseMove={handlers.onMouseMove}
            onMouseUp={handlers.onMouseUp}
            onMouseLeave={handlers.onMouseLeave}
          >
            <defs>
              <ArrowMarker id={markerId} />
            </defs>

            {/* Pan and zoom are applied once, to the whole drawing. */}
            <g
              transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
            >
              {/* Edges first, so nodes paint over the lines. */}
              {layout.edges.map(edge => (
                <DagEdge
                  key={`${edge.source}-${edge.target}`}
                  edge={edge}
                  markerId={markerId}
                />
              ))}

              {layout.nodes.map(node => (
                <DagNode
                  key={node.id}
                  node={node}
                  config={config}
                  isSelected={selectedNode?.id === node.id}
                  handlers={nodeHandlers}
                  className={styles.node}
                />
              ))}
            </g>
          </svg>

          {hasDrawableArea && (
            <DagMinimap
              layout={layout}
              config={config}
              transform={transform}
              canvasSize={canvasSize}
              className={styles.minimap}
            />
          )}

          {tooltip.visible && tooltip.node && (
            <DagTooltip
              node={tooltip.node}
              x={tooltip.x}
              y={tooltip.y}
              styles={styles}
            />
          )}
        </div>
      </div>

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </Flex>
  );
}
