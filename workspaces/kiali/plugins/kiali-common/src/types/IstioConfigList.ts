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
  GroupVersionKind,
  K8sResource,
  ObjectValidation,
  Validations,
} from './IstioObjects';
import { TypeMeta } from './Kubernetes';
import { ResourcePermissions } from './Permissions';

export interface IstioConfigItem extends TypeMeta {
  cluster?: string;
  creationTimestamp?: string;
  name: string;
  namespace: string;
  resource: K8sResource;
  resourceVersion?: string;
  validation?: ObjectValidation;
}

export declare type IstioConfigsMap = { [key: string]: IstioConfigList };

export interface IstioConfigList {
  permissions: { [key: string]: ResourcePermissions };
  resources: { [key: string]: any[] }; // map of gvk to resource array
  validations: Validations;
}

export interface IstioConfigListQuery {
  labelSelector?: string;
  objects?: string;
  validate?: boolean;
  workloadSelector?: string;
}

export enum gvkType {
  AuthorizationPolicy = 'AuthorizationPolicy',
  PeerAuthentication = 'PeerAuthentication',
  RequestAuthentication = 'RequestAuthentication',

  DestinationRule = 'DestinationRule',
  Gateway = 'Gateway',
  EnvoyFilter = 'EnvoyFilter',
  Sidecar = 'Sidecar',
  ServiceEntry = 'ServiceEntry',
  VirtualService = 'VirtualService',
  WorkloadEntry = 'WorkloadEntry',
  WorkloadGroup = 'WorkloadGroup',

  WasmPlugin = 'WasmPlugin',
  Telemetry = 'Telemetry',

  K8sGateway = 'K8sGateway',
  K8sGatewayClass = 'K8sGatewayClass',
  K8sGRPCRoute = 'K8sGRPCRoute',
  K8sHTTPRoute = 'K8sHTTPRoute',
  K8sReferenceGrant = 'K8sReferenceGrant',
  K8sTCPRoute = 'K8sTCPRoute',
  K8sTLSRoute = 'K8sTLSRoute',

  CronJob = 'CronJob',
  DaemonSet = 'DaemonSet',
  Deployment = 'Deployment',
  DeploymentConfig = 'DeploymentConfig',
  Job = 'Job',
  Pod = 'Pod',
  ReplicaSet = 'ReplicaSet',
  ReplicationController = 'ReplicationController',
  StatefulSet = 'StatefulSet',
}

export const dicTypeToGVK: { [key in gvkType]: GroupVersionKind } = {
  [gvkType.AuthorizationPolicy]: {
    Group: 'security.istio.io',
    Version: 'v1',
    Kind: gvkType.AuthorizationPolicy,
  },
  [gvkType.PeerAuthentication]: {
    Group: 'security.istio.io',
    Version: 'v1',
    Kind: gvkType.PeerAuthentication,
  },
  [gvkType.RequestAuthentication]: {
    Group: 'security.istio.io',
    Version: 'v1',
    Kind: gvkType.RequestAuthentication,
  },

  [gvkType.DestinationRule]: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: gvkType.DestinationRule,
  },
  [gvkType.Gateway]: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: gvkType.Gateway,
  },
  [gvkType.EnvoyFilter]: {
    Group: 'networking.istio.io',
    Version: 'v1alpha3',
    Kind: gvkType.EnvoyFilter,
  },
  [gvkType.Sidecar]: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: gvkType.Sidecar,
  },
  [gvkType.ServiceEntry]: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: gvkType.ServiceEntry,
  },
  [gvkType.VirtualService]: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: gvkType.VirtualService,
  },
  [gvkType.WorkloadEntry]: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: gvkType.WorkloadEntry,
  },
  [gvkType.WorkloadGroup]: {
    Group: 'networking.istio.io',
    Version: 'v1',
    Kind: gvkType.WorkloadGroup,
  },

  [gvkType.WasmPlugin]: {
    Group: 'extensions.istio.io',
    Version: 'v1alpha1',
    Kind: gvkType.WasmPlugin,
  },
  [gvkType.Telemetry]: {
    Group: 'telemetry.istio.io',
    Version: 'v1',
    Kind: gvkType.Telemetry,
  },

  [gvkType.K8sGateway]: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1',
    Kind: 'Gateway',
  },
  [gvkType.K8sGatewayClass]: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1',
    Kind: 'GatewayClass',
  },
  [gvkType.K8sGRPCRoute]: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1',
    Kind: 'GRPCRoute',
  },
  [gvkType.K8sHTTPRoute]: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1',
    Kind: 'HTTPRoute',
  },
  [gvkType.K8sReferenceGrant]: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1beta1',
    Kind: 'ReferenceGrant',
  },
  [gvkType.K8sTCPRoute]: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1alpha2',
    Kind: 'TCPRoute',
  },
  [gvkType.K8sTLSRoute]: {
    Group: 'gateway.networking.k8s.io',
    Version: 'v1alpha2',
    Kind: 'TLSRoute',
  },

  [gvkType.CronJob]: { Group: 'batch', Version: 'v1', Kind: 'CronJob' },
  [gvkType.DaemonSet]: { Group: 'apps', Version: 'v1', Kind: 'DaemonSet' },
  [gvkType.Deployment]: { Group: 'apps', Version: 'v1', Kind: 'Deployment' },
  [gvkType.DeploymentConfig]: {
    Group: 'apps.openshift.io',
    Version: 'v1',
    Kind: 'DeploymentConfig',
  },
  [gvkType.Job]: { Group: 'batch', Version: 'v1', Kind: 'Job' },
  [gvkType.Pod]: { Group: '', Version: 'v1', Kind: 'Pod' },
  [gvkType.ReplicaSet]: { Group: 'apps', Version: 'v1', Kind: 'ReplicaSet' },
  [gvkType.ReplicationController]: {
    Group: '',
    Version: 'v1',
    Kind: 'ReplicationController',
  },
  [gvkType.StatefulSet]: { Group: 'apps', Version: 'v1', Kind: 'StatefulSet' },
};

export interface IstioConfigsMapQuery extends IstioConfigListQuery {
  namespaces?: string;
}
