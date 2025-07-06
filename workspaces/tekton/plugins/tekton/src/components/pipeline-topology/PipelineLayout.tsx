/*
 * Copyright 2024 The Backstage Authors
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
import { useState, useRef, useCallback, useEffect } from 'react';

import {
  action,
  Controller,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  EdgeModel,
  GRAPH_LAYOUT_END_EVENT,
  GRAPH_POSITION_CHANGE_EVENT,
  GraphModel,
  Node,
  NodeModel,
  Rect,
  TopologyControlBar,
  TopologyView,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
} from '@patternfly/react-topology';

import {
  DROP_SHADOW_SPACING,
  GRAPH_MIN_WIDTH,
  NODE_HEIGHT,
  PipelineLayout as PipelineLayoutTypes,
  TOOLBAR_HEIGHT,
} from '../../consts/pipeline-topology-const';
import { PipelineMixedNodeModel } from '../../types/pipeline-topology-types';
import { getLayoutData } from '../../utils/pipeline-topology-utils';
import pipelineComponentFactory, {
  layoutFactory,
} from './pipelineComponentFactory';

type PipelineLayoutProps = {
  model: {
    graph: GraphModel;
    nodes: PipelineMixedNodeModel[];
    edges: EdgeModel[];
  };
};

export const PipelineLayout = ({ model }: PipelineLayoutProps) => {
  const [vis, setVis] = useState<Controller | null>(null);
  const [maxSize, setMaxSize] = useState<{
    height: number;
    width: number;
  }>({ height: 0, width: 0 });
  const storedGraphModel = useRef<GraphModel | null>(null);

  const layout: PipelineLayoutTypes = model.graph.layout as PipelineLayoutTypes;

  const onLayoutUpdate = useCallback(
    (nodes: Node[]) => {
      const nodeBounds = nodes.map((node: Node<NodeModel, any>) =>
        node.getBounds(),
      );
      const maxWidth = Math.floor(
        nodeBounds
          .map((bounds: Rect) => bounds.width)
          .reduce((w1: number, w2: number) => Math.max(w1, w2), 0),
      );
      const maxHeight = Math.floor(
        nodeBounds
          .map((bounds: Rect) => bounds.height)
          .reduce((h1: number, h2: number) => Math.max(h1, h2), 0),
      );
      const maxObject =
        nodeBounds.find((nb: Rect) => nb.height === maxHeight) ??
        ({ y: 0 } as Rect);

      const maxX = Math.floor(
        nodeBounds
          .map((bounds: Rect) => bounds.x)
          .reduce((x1: number, x2: number) => Math.max(x1, x2), 0),
      );
      const maxY = Math.floor(
        nodeBounds
          .map((bounds: Rect) => bounds.y)
          .reduce((y1: number, y2: number) => Math.max(y1, y2), 0),
      );

      let horizontalMargin = 0;
      let verticalMargin = 0;
      if (layout) {
        horizontalMargin = getLayoutData(layout)?.marginx || 0;
        verticalMargin = getLayoutData(layout)?.marginy || 0;
      }
      const finallyTaskHeight =
        maxObject.y + maxHeight + DROP_SHADOW_SPACING + verticalMargin * 2;
      const regularTaskHeight =
        maxY + NODE_HEIGHT + DROP_SHADOW_SPACING + verticalMargin * 2;

      setMaxSize({
        height: Math.max(finallyTaskHeight, regularTaskHeight) + TOOLBAR_HEIGHT,
        width: Math.max(
          maxX + maxWidth + DROP_SHADOW_SPACING + horizontalMargin * 2,
          GRAPH_MIN_WIDTH,
        ),
      });
    },
    [setMaxSize, layout],
  );

  useEffect(() => {
    if (model.graph.id !== storedGraphModel?.current?.id) {
      storedGraphModel.current = null;
      setVis(null);
    }
  }, [vis, model]);

  useEffect(() => {
    let mounted = true;
    if (vis === null) {
      const controller = new Visualization();
      controller.registerLayoutFactory(layoutFactory);
      controller.registerComponentFactory(pipelineComponentFactory);
      controller.fromModel(model);
      controller.addEventListener(GRAPH_POSITION_CHANGE_EVENT, () => {
        storedGraphModel.current = controller.getGraph().toModel();
      });
      controller.addEventListener(GRAPH_LAYOUT_END_EVENT, () => {
        onLayoutUpdate(controller.getGraph().getNodes());
      });
      if (mounted) {
        setVis(controller);
      }
    } else {
      const graph = storedGraphModel.current;
      if (graph) {
        model.graph = graph;
      }
      vis.fromModel(model);
      vis.getGraph().layout();
    }
    return () => {
      mounted = false;
    };
  }, [vis, model, onLayoutUpdate]);

  useEffect(() => {
    if (model && vis) {
      const graph = storedGraphModel.current;
      if (graph) {
        model.graph = graph;
      }
      vis.fromModel(model);
    }
  }, [model, vis]);

  if (!vis) return null;

  const controlBar = (controller: Controller) => (
    <TopologyControlBar
      controlButtons={createTopologyControlButtons({
        ...defaultControlButtonsOptions,
        zoomInCallback: action(() => {
          controller.getGraph().scaleBy(4 / 3);
        }),
        zoomOutCallback: action(() => {
          controller.getGraph().scaleBy(0.75);
        }),
        fitToScreenCallback: action(() => {
          controller.getGraph().fit(80);
        }),
        resetViewCallback: action(() => {
          controller.getGraph().reset();
          controller.getGraph().layout();
        }),
        legend: false,
      })}
    />
  );

  return (
    <div
      style={{
        height: Math.min(window.innerHeight, maxSize?.height),
      }}
    >
      <VisualizationProvider controller={vis}>
        <TopologyView controlBar={controlBar(vis)}>
          <VisualizationSurface />
        </TopologyView>
      </VisualizationProvider>
    </div>
  );
};
