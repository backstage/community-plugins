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
import { V1Pod } from '@kubernetes/client-node';
import * as _ from 'lodash';
import { flatMap, get, uniq } from 'lodash';

import {
  TEMPLATE_OS_LABEL,
  TEMPLATE_OS_NAME_ANNOTATION,
  TEMPLATE_WORKLOAD_LABEL,
} from '../const';
import { V1Disk, V1GPU, V1HostDevice } from '../types/api';
import { K8sResponseData, K8sWorkloadResource } from '../types/types';
import {
  BootableDeviceType,
  DeviceType,
  K8sResourceKind,
  V1NetworkInterface,
  VMIKind,
  VMIPhase,
  VMKind,
} from '../types/vm';
import {
  findKeySuffixValue,
  getAnnotations,
  getLabels,
  getValueByPrefix,
} from './selector';

// Type check
export const isVMIKind = (item: any): item is VMIKind => {
  return item.spec !== undefined && item.status !== undefined;
};

export const isV1Pod = (resource: K8sWorkloadResource): resource is V1Pod => {
  return (resource as V1Pod).spec !== undefined;
};

// Find VMI
export const findVMI = (vm?: VMKind, vmis?: Array<VMIKind>): VMIKind | null => {
  if (!vm || !vmis) return null;
  const vmUID = vm?.metadata?.uid;
  const vmi = vmis.filter(v => {
    const vmiOwnerReferences = v?.metadata?.ownerReferences;
    return (
      v?.metadata?.namespace === vm?.metadata?.namespace &&
      vmiOwnerReferences?.some(
        vmiOwnerReference => vmiOwnerReference.uid === vmUID,
      )
    );
  });
  return vmi?.[0];
};

// Find Pods from VMI
export const findPodFromVMI = (
  vmi?: VMIKind | null,
  pods?: Array<V1Pod> | null,
): Array<V1Pod> => {
  if (!pods || !vmi) {
    return [];
  }
  const vmUID = vmi?.metadata?.uid;
  return pods.filter(p => {
    const podOwnerReferences = p?.metadata?.ownerReferences;
    return (
      p?.metadata?.namespace === vmi?.metadata?.namespace &&
      podOwnerReferences?.some(
        podOwnerReference => podOwnerReference.uid === vmUID,
      )
    );
  });
};

// getPods
export const getPodsForVM = (vm: VMKind, resources: K8sResponseData) => {
  const allPods = resources?.pods?.data?.filter(isV1Pod);
  const allVMIs = resources?.virtualmachineinstances?.data?.filter(isVMIKind);
  const vmi = findVMI(vm, allVMIs);
  const pods = findPodFromVMI(vmi, allPods);
  return pods;
};

// Labeled Device

const transformDevices = (
  disks: V1Disk[] = [],
  nics: V1NetworkInterface[] = [],
): BootableDeviceType[] => {
  const transformedDisks = disks.map(disk => ({
    type: DeviceType.DISK,
    typeLabel: Object.keys(disk)
      .filter(key => typeof (disk as any)?.[key] === 'object')?.[0]
      ?.toLocaleUpperCase('en-US'),
    value: disk,
  }));
  const transformedNics = nics.map(nic => ({
    type: DeviceType.NIC,
    typeLabel: Object.keys(nic)
      .filter(key => typeof (nic as any)?.[key] === 'object')?.[0]
      ?.toLocaleUpperCase('en-US'),
    value: nic,
  }));

  return [...transformedDisks, ...transformedNics];
};
const getInterfaces = (vm: VMKind): V1NetworkInterface[] =>
  _.get(vm, 'spec.template.spec.domain.devices.interfaces') === null
    ? []
    : vm?.spec?.template?.spec?.domain?.devices?.interfaces;

const getDisks = (vm: VMKind): V1Disk[] =>
  _.get(vm, 'spec.template.spec.domain.devices.disks') === null
    ? []
    : vm?.spec?.template?.spec?.domain?.devices?.disks;
const getNetworkInterfaces = (vm: VMKind) => getInterfaces(vm);

export const getLabeledDevices = (vm: VMKind) =>
  transformDevices(getDisks(vm), getNetworkInterfaces(vm));

// Boot Order

export const deviceKey = (device: BootableDeviceType) => {
  return `${device?.type}-${device?.value?.name}`;
};

export const deviceLabel = (device: BootableDeviceType) => {
  const name = device?.value?.name || '';
  const regex = /^\$\{[A-Z_]+\}$/;
  const match = regex.exec(name);

  if (match) {
    return `${name} (${device?.typeLabel}), template parameter`;
  }

  return `${name} (${device?.typeLabel})`;
};

// IP Address

export const getVmiIpAddresses = (vmi: VMIKind | null) => {
  if (!vmi) return [];
  return uniq(
    flatMap(
      // get IPs only for named interfaces because Windows reports IPs for other devices like Loopback Pseudo-Interface 1 etc.
      get(vmi, 'status.interfaces', []).filter((i: { name: any }) => !!i.name),
      (i: { ipAddress: string; ipAddresses: string[] }) => {
        const arr = [];
        if (i.ipAddress) {
          // the "ipAddress" is deprecated but still can contain useful value
          arr.push(i.ipAddress.trim());
        }
        if (
          i.ipAddresses &&
          Array.isArray(i.ipAddresses) &&
          i.ipAddresses.length > 0
        ) {
          arr.push(...i.ipAddresses.map((ip: string) => ip.trim()));
        }
        return arr;
      },
    ).filter((ip: string | any[]) => ip && ip.length > 0),
  );
};

// Description
export const getDescription = (resource: K8sWorkloadResource): string =>
  resource?.metadata?.annotations?.description || '';

// Template Name

export const getLabel = (
  value: any,
  label: string,
  defaultValue?: string,
): string =>
  _.has(value, 'metadata.labels') ? value.metadata.labels[label] : defaultValue;

// Node
export const getVMINodeName = (vmi: VMIKind | null) => vmi?.status?.nodeName;

export const getNodeName = (pod: any) =>
  pod?.spec ? pod.spec.nodeName : undefined;

// Hardware GPU , Host Devices
export const getGPUDevices = (vm: VMKind): V1GPU[] =>
  vm?.spec?.template?.spec?.domain?.devices?.gpus || [];
export const getHostDevices = (vm: VMKind): V1HostDevice[] =>
  vm?.spec?.template?.spec?.domain?.devices?.hostDevices || [];

// SSH Keys
const getStatusPhase = <T = string>(entity: K8sResourceKind): T =>
  entity?.status?.phase;

export const isVMIReady = (vmi: VMIKind) =>
  getStatusPhase(vmi) === VMIPhase.Running;

// Operating System

export const getOperatingSystem = (vmLike: VMKind): string =>
  findKeySuffixValue(getLabels(vmLike), TEMPLATE_OS_LABEL);
export const getOperatingSystemName = (vm: VMKind) =>
  getValueByPrefix(
    `${TEMPLATE_OS_NAME_ANNOTATION}/${getOperatingSystem(vm)}`,
    getAnnotations(vm),
  );

// Workload Profile
export const getWorkloadProfile = (vm: VMKind) =>
  findKeySuffixValue(getLabels(vm), TEMPLATE_WORKLOAD_LABEL);
