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
  V1CronJob,
  V1DaemonSet,
  V1Deployment,
  V1Job,
} from '@kubernetes/client-node';
import { Split, SplitItem } from '@patternfly/react-core';
import { BaseNode } from '@patternfly/react-topology';

import {
  CronJobModel,
  DaemonSetModel,
  DeploymentModel,
  JobModel,
  PodModel,
  StatefulSetModel,
} from '../../../models';
import { VMKind } from '../../../types/vm';
import { VirtualMachineModel } from '../../../vm-models';
import PodSet from '../../Pods/PodSet';
import TopologyCronJobDetails from './TopologyCronJobDetails';
import TopologyDaemonSetDetails from './TopologyDaemonSetDetails';
import TopologyDeploymentDetails from './TopologyDeploymentDetails';
import TopologyJobDetails from './TopologyJobDetails';
import TopologyVirtualMachineDetails from './TopologyVirtualMachineDetails';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';

import './TopologyDetailsTabPanel.css';

type TopologyDetailsTabPanelProps = { node: BaseNode };

const TopologyDetailsTabPanel = ({ node }: TopologyDetailsTabPanelProps) => {
  const { width, height } = node.getDimensions();
  const data = node.getData();
  const resource = data.resource;
  const resourceKind = resource.kind;
  const size = Math.min(width, height);
  const donutStatus = data.data?.podsData;
  const cx = width / 2;
  const cy = height / 2;
  const getWorkloadDetails = () => {
    switch (resourceKind) {
      case VirtualMachineModel.kind:
        return <TopologyVirtualMachineDetails vm={resource as VMKind} />;
      case DeploymentModel.kind:
        return (
          <TopologyDeploymentDetails resource={resource as V1Deployment} />
        );
      case DaemonSetModel.kind:
        return <TopologyDaemonSetDetails resource={resource as V1DaemonSet} />;
      case CronJobModel.kind:
        return <TopologyCronJobDetails resource={resource as V1CronJob} />;
      case JobModel.kind:
        return <TopologyJobDetails resource={resource as V1Job} />;
      case StatefulSetModel.kind:
      case PodModel.kind:
      default:
        return <TopologyWorkloadDetails resource={resource} />;
    }
  };

  return (
    <div className="topology-details-tab" data-testid="details-tab">
      {donutStatus && resourceKind !== VirtualMachineModel.kind && (
        <Split className="topology-side-bar-pod-ring">
          <SplitItem>
            <PodSet
              size={size}
              x={cx}
              y={cy}
              data={donutStatus}
              showPodCount
              standalone
            />
          </SplitItem>
          <SplitItem isFilled />
        </Split>
      )}
      {getWorkloadDetails()}
    </div>
  );
};

export default TopologyDetailsTabPanel;
