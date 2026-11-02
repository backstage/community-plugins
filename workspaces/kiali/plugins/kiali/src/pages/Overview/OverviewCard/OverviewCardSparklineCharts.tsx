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
  ControlPlaneMetricsMap,
  DurationInSeconds,
  IstiodResourceThresholds,
  Metric,
} from '@backstage-community/plugin-kiali-common/types';
import { serverConfig } from '../../../config';
import { DirectionType } from '../OverviewToolbar';
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
  // Don't render if serverConfig is not available
  if (!serverConfig || !serverConfig.istioNamespace) {
    return <div>Loading...</div>;
  }

  // Control plane cards no longer render sparkline charts; keep parity with data plane card size.
  if (props.name === serverConfig.istioNamespace) {
    return null;
  }

  return (
    <OverviewCardDataPlaneNamespace
      metrics={props.metrics}
      errorMetrics={props.errorMetrics}
      duration={props.duration}
      direction={props.direction}
    />
  );
};
