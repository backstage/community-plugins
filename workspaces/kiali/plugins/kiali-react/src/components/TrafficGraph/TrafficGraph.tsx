/*
 * Copyright 2025 The Backstage Authors
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
import {
  action,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  Model,
  TopologyControlBar,
  TopologyView,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
} from '@patternfly/react-topology';
import { useEffect, useState, useRef } from 'react';
import { KialiComponentFactory } from './factories/KialiComponentFactory';
import { KialiLayoutFactory } from './factories/KialiLayoutFactory';

const getVisualization = (): Visualization => {
  const vis = new Visualization();

  vis.registerLayoutFactory(KialiLayoutFactory);
  vis.registerComponentFactory(KialiComponentFactory);
  vis.setFitToScreenOnLayout(true);

  return vis;
};

/**
 * TrafficGraph component for visualizing traffic topology.
 *
 * @public
 */
export const TrafficGraph = (props: { model: Model }) => {
  const [controller] = useState(getVisualization());
  const prevModelRef = useRef<Model | null>(null);

  useEffect(() => {
    // Only update if model actually changed
    if (prevModelRef.current === props.model) {
      return;
    }

    const hasData =
      (props.model.nodes?.length ?? 0) > 0 ||
      (props.model.edges?.length ?? 0) > 0;

    if (hasData) {
      controller.fromModel(props.model, true);
      setTimeout(() => {
        controller.getGraph()?.fit(80);
      }, 50);
    }

    prevModelRef.current = props.model;
  }, [props.model, controller]);

  return (
    <TopologyView
      controlBar={
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
            zoomInAriaLabel: '',
            zoomOutAriaLabel: '',
            fitToScreenAriaLabel: '',
            resetViewAriaLabel: '',
            zoomInTip: '',
            zoomOutTip: '',
            fitToScreenTip: '',
            resetViewTip: '',
          })}
        />
      }
    >
      <VisualizationProvider controller={controller}>
        <VisualizationSurface state={props.model} />
      </VisualizationProvider>
    </TopologyView>
  );
};
