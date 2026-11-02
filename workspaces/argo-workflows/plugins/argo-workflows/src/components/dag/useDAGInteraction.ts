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

import { useCallback, useMemo, useRef, useState } from 'react';
import type { WheelEvent, MouseEvent, KeyboardEvent, RefObject } from 'react';
import type { DAGNode } from '@backstage-community/plugin-argo-workflows-react';
import type {
  DAGInteraction,
  DAGLayoutConfig,
  LayoutResult,
  TooltipState,
  TransformState,
} from './types';

/** Multiplier applied per zoom step, in or out. */
const ZOOM_FACTOR = 1.25;

/** Fraction of the canvas that fit-to-view fills, leaving a visible margin. */
const FIT_SCALE_MARGIN = 0.9;

/** The primary (usually left) mouse button. */
const PRIMARY_BUTTON = 0;

const HIDDEN_TOOLTIP: TooltipState = {
  visible: false,
  x: 0,
  y: 0,
  node: null,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Owns the canvas's pan/zoom transform, hover tooltip and node selection.
 *
 * Shared by the full-page and inline DAG views so both behave identically; the
 * views differ only in the `config` preset they pass in.
 */
export function useDAGInteraction(config: DAGLayoutConfig): DAGInteraction {
  const { minScale, maxScale, padding } = config;

  const svgRef = useRef<SVGSVGElement>(null) as RefObject<SVGSVGElement>;

  const [transform, setTransform] = useState<TransformState>({
    x: padding,
    y: padding,
    scale: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<TooltipState>(HIDDEN_TOOLTIP);
  const [selectedNode, setSelectedNode] = useState<DAGNode | null>(null);

  const hideTooltip = useCallback(() => {
    setTooltip(prev => (prev.visible ? { ...prev, visible: false } : prev));
  }, []);

  /**
   * Zooms about a fixed point on the canvas, keeping whatever sits under that
   * point stationary. Used for wheel zoom, anchored at the cursor.
   */
  const zoomAround = useCallback(
    (anchorX: number, anchorY: number, factor: number) => {
      setTransform(prev => {
        const scale = clamp(prev.scale * factor, minScale, maxScale);
        const ratio = scale / prev.scale;
        return {
          x: anchorX - (anchorX - prev.x) * ratio,
          y: anchorY - (anchorY - prev.y) * ratio,
          scale,
        };
      });
    },
    [minScale, maxScale],
  );

  /** Zooms about the canvas centre. Used by the toolbar buttons. */
  const zoomBy = useCallback(
    (factor: number) => {
      setTransform(prev => ({
        ...prev,
        scale: clamp(prev.scale * factor, minScale, maxScale),
      }));
    },
    [minScale, maxScale],
  );

  const onWheel = useCallback(
    (e: WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const bounds = svgRef.current?.getBoundingClientRect();
      const factor = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;

      if (!bounds) {
        zoomBy(factor);
        return;
      }
      zoomAround(e.clientX - bounds.left, e.clientY - bounds.top, factor);
    },
    [zoomAround, zoomBy],
  );

  const onMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (e.button !== PRIMARY_BUTTON) return;
      setIsPanning(true);
      setPanOrigin({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    },
    [transform.x, transform.y],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (!isPanning) return;
      setTransform(prev => ({
        ...prev,
        x: e.clientX - panOrigin.x,
        y: e.clientY - panOrigin.y,
      }));
    },
    [isPanning, panOrigin.x, panOrigin.y],
  );

  const onMouseUp = useCallback(() => setIsPanning(false), []);

  const onMouseLeave = useCallback(() => {
    setIsPanning(false);
    hideTooltip();
  }, [hideTooltip]);

  /** Shows the tooltip at a position relative to the canvas. */
  const showTooltipAt = useCallback((x: number, y: number, node: DAGNode) => {
    setTooltip({ visible: true, x, y, node });
  }, []);

  const onNodeMouseEnter = useCallback(
    (e: MouseEvent, node: DAGNode) => {
      const bounds = svgRef.current?.getBoundingClientRect();
      if (!bounds) return;
      showTooltipAt(e.clientX - bounds.left, e.clientY - bounds.top, node);
    },
    [showTooltipAt],
  );

  /**
   * Keyboard focus has no pointer position, so the tooltip is centred on the
   * canvas instead of tracking a cursor.
   */
  const onNodeFocus = useCallback(
    (node: DAGNode) => {
      const bounds = svgRef.current?.getBoundingClientRect();
      if (!bounds) return;
      showTooltipAt(bounds.width / 2, bounds.height / 2, node);
    },
    [showTooltipAt],
  );

  /** Selecting an already-selected node clears the selection. */
  const onNodeClick = useCallback((node: DAGNode) => {
    setSelectedNode(prev => (prev?.id === node.id ? null : node));
  }, []);

  const onNodeKeyDown = useCallback(
    (e: KeyboardEvent, node: DAGNode) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      onNodeClick(node);
    },
    [onNodeClick],
  );

  const zoomIn = useCallback(() => zoomBy(ZOOM_FACTOR), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(1 / ZOOM_FACTOR), [zoomBy]);

  /** Scales the whole drawing to fit the canvas and centres it. */
  const fitToView = useCallback(
    (layout: LayoutResult) => {
      const bounds = svgRef.current?.getBoundingClientRect();
      if (!bounds) return;

      // Never scale above 1, so small graphs stay at their natural size rather
      // than being blown up to fill the canvas.
      const fitScale =
        Math.min(
          bounds.width / layout.width,
          bounds.height / layout.height,
          1,
        ) * FIT_SCALE_MARGIN;
      const scale = clamp(fitScale, minScale, maxScale);

      setTransform({
        x: (bounds.width - layout.width * scale) / 2,
        y: (bounds.height - layout.height * scale) / 2,
        scale,
      });
    },
    [minScale, maxScale],
  );

  const handlers = useMemo(
    () => ({ onWheel, onMouseDown, onMouseMove, onMouseUp, onMouseLeave }),
    [onWheel, onMouseDown, onMouseMove, onMouseUp, onMouseLeave],
  );

  const nodeHandlers = useMemo(
    () => ({
      onMouseEnter: onNodeMouseEnter,
      onMouseLeave: hideTooltip,
      onClick: onNodeClick,
      onKeyDown: onNodeKeyDown,
      onFocus: onNodeFocus,
      onBlur: hideTooltip,
    }),
    [onNodeMouseEnter, hideTooltip, onNodeClick, onNodeKeyDown, onNodeFocus],
  );

  return {
    svgRef,
    transform,
    isPanning,
    tooltip,
    selectedNode,
    setSelectedNode,
    handlers,
    nodeHandlers,
    zoomIn,
    zoomOut,
    fitToView,
  };
}
