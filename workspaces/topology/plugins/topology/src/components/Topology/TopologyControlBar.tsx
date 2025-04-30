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
import {
  action,
  Controller,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  TopologyControlBar as PfTopologyControlBar,
} from '@patternfly/react-topology';

type TopologyControlBarProps = {
  controller: Controller;
};

export const TopologyControlBar = ({ controller }: TopologyControlBarProps) => (
  <PfTopologyControlBar
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
