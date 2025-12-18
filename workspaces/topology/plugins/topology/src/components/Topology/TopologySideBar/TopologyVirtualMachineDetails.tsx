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
import { useContext } from 'react';

import { Status } from '../../common/Status';
import { ResourceIcon } from '../../common/ResourceName';
import { LABEL_USED_TEMPLATE_NAME } from '../../../const';
import { K8sResourcesContext } from '../../../hooks/K8sResourcesContext';
import { VMIKind, VMKind } from '../../../types/vm';
import { getStatus } from '../../../utils/vm-status-utils';
import {
  findPodFromVMI,
  findVMI,
  getDescription,
  getGPUDevices,
  getHostDevices,
  getLabel,
  getLabeledDevices,
  getNodeName,
  getOperatingSystem,
  getOperatingSystemName,
  getVmiIpAddresses,
  getVMINodeName,
  getWorkloadProfile,
  isV1Pod,
  isVMIKind,
} from '../../../utils/vm-utils';
import { BootOrderSummary } from '../boot-order/boot-order-summary';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';

type TopologyVirtualMachineDetailsProps = {
  vm: VMKind;
};

const TopologyVirtualMachineDetails = ({
  vm,
}: TopologyVirtualMachineDetailsProps) => {
  const resources = useContext(K8sResourcesContext);
  const allPods = resources?.watchResourcesData?.pods?.data?.filter(isV1Pod);
  const allVMIs =
    resources?.watchResourcesData?.virtualmachineinstances?.data?.filter(
      isVMIKind,
    );
  const vmi = findVMI(vm, allVMIs);
  const pods = findPodFromVMI(vmi, allPods);
  const devices = getLabeledDevices(vm) || [];
  const ipAddrs = getVmiIpAddresses(vmi);
  const description = getDescription(vm);
  const templateName = getLabel(vm, LABEL_USED_TEMPLATE_NAME);
  const nodeName = getVMINodeName(vmi) || getNodeName(pods);
  const os = getOperatingSystemName(vm) || getOperatingSystem(vm);
  const workloadProfile = getWorkloadProfile(vm);
  const vmStatus = getStatus(vm, vmi as VMIKind, pods?.[0]);
  return (
    <>
      <div className="topology-workload-details">
        <TopologyWorkloadDetails resource={vm}>
          <TopologySideBarDetailsItem label="Status">
            <Status
              status={vmStatus}
              displayStatusText={vm?.status?.printableStatus}
            />
          </TopologySideBarDetailsItem>
        </TopologyWorkloadDetails>
      </div>
      <div
        className="topology-workload-details"
        data-testid="virtualmachine-details"
      >
        <TopologySideBarDetailsItem
          label="Description"
          emptyText="Not available"
        >
          {description}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem
          label="Operating System"
          emptyText="Not available"
        >
          {os}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Template">
          <ResourceIcon kind="Template" />
          {templateName}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Pod">
          {pods?.map(pod => (
            <label key={pod?.metadata?.uid}>{pod?.metadata?.name}</label>
          ))}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Boot order">
          <BootOrderSummary devices={devices} />
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="IP address">
          {ipAddrs}
        </TopologySideBarDetailsItem>
        {/* <TopologySideBarDetailsItem label="Hostname">
          {vm.spec?.strategy?.type}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Time zone">
          {vm.spec?.strategy?.type}
        </TopologySideBarDetailsItem> */}
        <TopologySideBarDetailsItem label="Node" emptyText="Not available">
          {nodeName}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem
          label="Workload profile"
          emptyText="Not available"
        >
          {workloadProfile}
        </TopologySideBarDetailsItem>
        {/* <TopologySideBarDetailsItem label="User credentials">
          {vm.spec?.strategy?.type}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="SSH access">
          <span data-test="details-item-ssh-access-port">
          {vmiReady ?
            sshServicesRunning ?  `Port: ${sshServicePort}`
             : 'SSH service disabled'

          :
            'Virtual machine not running')
          }
        </span>
        </TopologySideBarDetailsItem> */}
        <TopologySideBarDetailsItem label="Hardware devices">
          <div>GPU devices: {getGPUDevices(vm).length}</div>
          <div>Host devices: {getHostDevices(vm).length}</div>
        </TopologySideBarDetailsItem>
      </div>
    </>
  );
};

export default TopologyVirtualMachineDetails;
