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
import * as React from 'react';
import { serverConfig } from '../../../config';
import { DurationInSeconds } from '../../../types/Common';
import { IstiodResourceThresholds } from '../../../types/IstioStatus';
import { ControlPlaneMetricsMap, Metric } from '../../../types/Metrics';
import { DirectionType } from '../OverviewToolbar';
import {
  isRemoteCluster,
  OverviewCardControlPlaneNamespace,
} from './OverviewCardControlPlaneNamespace';
import { OverviewCardDataPlaneNamespace } from './OverviewCardDataPlaneNamespace';

type Props = {
  name: string;
  annotations?: { [key: string]: string };
  duration: DurationInSeconds;
  direction: DirectionType;
  metrics?: Metric[];
  istioAPIEnabled: boolean;
  errorMetrics?: Metric[];
  controlPlaneMetrics?: ControlPlaneMetricsMap;
  istiodResourceThresholds?: IstiodResourceThresholds;
};

export const OverviewCardSparklineCharts = (props: Props) => {
  return (
    <>
      {props.name !== serverConfig.istioNamespace && (
        <OverviewCardDataPlaneNamespace
          metrics={props.metrics}
          errorMetrics={props.errorMetrics}
          duration={props.duration}
          direction={props.direction}
        />
      )}
      {props.name === serverConfig.istioNamespace &&
        props.istioAPIEnabled &&
        !isRemoteCluster(props.annotations) && (
          <OverviewCardControlPlaneNamespace
            pilotLatency={props.controlPlaneMetrics?.istiod_proxy_time}
            istiodContainerMemory={
              props.controlPlaneMetrics?.istiod_container_mem
            }
            istiodContainerCpu={props.controlPlaneMetrics?.istiod_container_cpu}
            istiodProcessMemory={props.controlPlaneMetrics?.istiod_process_mem}
            istiodProcessCpu={props.controlPlaneMetrics?.istiod_process_cpu}
            duration={props.duration}
            istiodResourceThresholds={props.istiodResourceThresholds}
          />
        )}
    </>
  );
};
