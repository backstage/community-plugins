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
import { StatefulFilters } from '../../components/Filters/StatefulFilters';
import { serverConfig } from '../../config';
import { isGateway, isWaypoint } from '../../helpers/LabelFilterHelper';
import { AppListItem } from '../../types/AppList';
import { Health } from '../../types/Health';
import { IstioConfigItem } from '../../types/IstioConfigList';
import { NamespaceInfo } from '../../types/NamespaceInfo';
import { ServiceListItem } from '../../types/ServiceList';
import { WorkloadListItem } from '../../types/Workload';
import { PFBadges, PFBadgeType } from '../Pf/PfBadges';
import * as Renderers from './Renderers';

export type SortResource = WorkloadListItem | ServiceListItem | AppListItem;
export type TResource = SortResource | IstioConfigItem;
export type RenderResource = TResource | NamespaceInfo;
export type Renderer<R extends RenderResource> = (
  item: R,
  config: Resource,
  badge: PFBadgeType,
  health?: Health,
  statefulFilter?: React.RefObject<StatefulFilters>,
  view?: string,
  linkColor?: string,
) => JSX.Element | undefined;

export type ResourceType<R extends RenderResource> = {
  name: string;
  param?: string;
  renderer?: Renderer<R>;
  sortable: boolean;
  textCenter?: boolean;
  title: string;
  width?: 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 60 | 70 | 80 | 90 | 100;
};

export type Resource = {
  badge?: PFBadgeType;
  caption?: string;
  columns: ResourceType<any>[];
  name: string;
};

type IstioConfigType = {
  badge: PFBadgeType;
  name: string;
  url: string;
};

export const IstioTypes: { [type: string]: IstioConfigType } = {
  adapter: { name: 'Adapter', url: 'adapters', badge: PFBadges.Adapter },
  attributemanifest: {
    name: 'AttributeManifest',
    url: 'attributemanifests',
    badge: PFBadges.AttributeManifest,
  },
  authorizationpolicy: {
    name: 'AuthorizationPolicy',
    url: 'authorizationpolicies',
    badge: PFBadges.AuthorizationPolicy,
  },
  clusterrbacconfig: {
    name: 'ClusterRbacConfig',
    url: 'clusterrbacconfigs',
    badge: PFBadges.ClusterRBACConfig,
  },
  destinationrule: {
    name: 'DestinationRule',
    url: 'destinationrules',
    badge: PFBadges.DestinationRule,
  },
  envoyfilter: {
    name: 'EnvoyFilter',
    url: 'envoyfilters',
    badge: PFBadges.EnvoyFilter,
  },
  gateway: { name: 'Gateway', url: 'gateways', badge: PFBadges.Gateway },
  grpcroute: {
    name: 'GRPCRoute',
    url: 'k8sgrpcroutes',
    badge: PFBadges.GRPCRoute,
  },
  handler: { name: 'Handler', url: 'handlers', badge: PFBadges.Handler },
  httproute: {
    name: 'HTTPRoute',
    url: 'k8shttproutes',
    badge: PFBadges.HTTPRoute,
  },
  instance: { name: 'Instance', url: 'instances', badge: PFBadges.Instance },
  k8sgateway: {
    name: 'Gateway (K8s)',
    url: 'k8sgateways',
    badge: PFBadges.K8sGateway,
  },
  k8sgrpcroute: {
    name: 'GRPCRoute (K8s)',
    url: 'k8sgrpcroutes',
    badge: PFBadges.K8sGRPCRoute,
  },
  k8shttproute: {
    name: 'HTTPRoute (K8s)',
    url: 'k8shttproutes',
    badge: PFBadges.K8sHTTPRoute,
  },
  k8sreferencegrant: {
    name: 'ReferenceGrant (K8s)',
    url: 'k8sreferencegrants',
    badge: PFBadges.K8sReferenceGrant,
  },
  k8stcproute: {
    name: 'TCPRoute (K8s)',
    url: 'k8stcproutes',
    badge: PFBadges.K8sTCPRoute,
  },
  k8stlsroute: {
    name: 'TLSRoute (K8s)',
    url: 'k8stlsroutes',
    badge: PFBadges.K8sTLSRoute,
  },
  meshpolicy: {
    name: 'MeshPolicy',
    url: 'meshpolicies',
    badge: PFBadges.MeshPolicy,
  },
  peerauthentication: {
    name: 'PeerAuthentication',
    url: 'peerauthentications',
    badge: PFBadges.PeerAuthentication,
  },
  policy: { name: 'Policy', url: 'policies', badge: PFBadges.Policy },
  rbacconfig: {
    name: 'RbacConfig',
    url: 'rbacconfigs',
    badge: PFBadges.RBACConfig,
  },
  requestauthentication: {
    name: 'RequestAuthentication',
    url: 'requestauthentications',
    badge: PFBadges.RequestAuthentication,
  },
  // TODO should be merged with k8sreferencegrant
  referencegrant: {
    name: 'ReferenceGrant (K8s)',
    url: 'k8sreferencegrants',
    badge: PFBadges.K8sReferenceGrant,
  },
  tcproute: {
    name: 'TCPRoute (K8s)',
    url: 'k8stcproutes',
    badge: PFBadges.K8sTCPRoute,
  },
  tlsroute: {
    name: 'TLSRoute (K8s)',
    url: 'k8stlsroutes',
    badge: PFBadges.K8sTLSRoute,
  },
  rule: { name: 'Rule', url: 'rules', badge: PFBadges.Rule },
  serviceentry: {
    name: 'ServiceEntry',
    url: 'serviceentries',
    badge: PFBadges.ServiceEntry,
  },
  servicerole: {
    name: 'ServiceRole',
    url: 'serviceroles',
    badge: PFBadges.ServiceRole,
  },
  servicerolebinding: {
    name: 'ServiceRoleBinding',
    url: 'servicerolebindings',
    badge: PFBadges.ServiceRoleBinding,
  },
  sidecar: { name: 'Sidecar', url: 'sidecars', badge: PFBadges.Sidecar },
  telemetry: {
    name: 'Telemetry',
    url: 'telemetries',
    badge: PFBadges.Telemetry,
  },
  template: { name: 'Template', url: 'templates', badge: PFBadges.Template },
  virtualservice: {
    name: 'VirtualService',
    url: 'virtualservices',
    badge: PFBadges.VirtualService,
  },
  wasmplugin: {
    name: 'WasmPlugin',
    url: 'wasmplugins',
    badge: PFBadges.WasmPlugin,
  },
  workloadentry: {
    name: 'WorkloadEntry',
    url: 'workloadentries',
    badge: PFBadges.WorkloadEntry,
  },
  workloadgroup: {
    name: 'WorkloadGroup',
    url: 'workloadgroups',
    badge: PFBadges.WorkloadGroup,
  },
};

// General
const item: ResourceType<TResource> = {
  name: 'Item',
  param: 'wn',
  title: 'Name',
  sortable: true,
  width: 30,
  renderer: Renderers.item,
};

const serviceItem: ResourceType<ServiceListItem> = {
  name: 'Item',
  param: 'sn',
  title: 'Name',
  sortable: true,
  width: 30,
  renderer: Renderers.item,
};

const istioItem: ResourceType<IstioConfigItem> = {
  name: 'Item',
  param: 'in',
  title: 'Name',
  sortable: true,
  renderer: Renderers.item,
};

const cluster: ResourceType<TResource> = {
  name: 'Cluster',
  param: 'cl',
  title: 'Cluster',
  sortable: true,
  width: 15,
  renderer: Renderers.cluster,
};

const namespace: ResourceType<TResource> = {
  name: 'Namespace',
  param: 'ns',
  title: 'Namespace',
  sortable: true,
  width: 20,
  renderer: Renderers.namespace,
};

const labels: ResourceType<RenderResource> = {
  name: 'Labels',
  param: 'lb',
  title: 'Labels',
  sortable: false,
  width: 20,
  renderer: Renderers.labels,
};

const health: ResourceType<TResource> = {
  name: 'Health',
  param: 'he',
  title: 'Health',
  sortable: true,
  width: 15,
  renderer: Renderers.health,
};

const details: ResourceType<WorkloadListItem | ServiceListItem> = {
  name: 'Details',
  param: 'is',
  title: 'Details',
  sortable: true,
  width: 15,
  renderer: Renderers.details,
};

const serviceConfiguration: ResourceType<ServiceListItem> = {
  name: 'Configuration',
  param: 'cv',
  title: 'Configuration',
  sortable: true,
  width: 20,
  renderer: Renderers.serviceConfiguration,
};

const istioObjectConfiguration: ResourceType<IstioConfigItem> = {
  name: 'Configuration',
  param: 'cv',
  title: 'Configuration',
  sortable: true,
  width: 20,
  renderer: Renderers.istioConfiguration,
};

const workloadType: ResourceType<WorkloadListItem> = {
  name: 'WorkloadType',
  param: 'wt',
  title: 'Type',
  sortable: true,
  renderer: Renderers.workloadType,
};

const istioType: ResourceType<IstioConfigItem> = {
  name: 'IstioType',
  param: 'it',
  title: 'Type',
  sortable: true,
  renderer: Renderers.istioType,
};

// NamespaceInfo
const tlsStatus: ResourceType<NamespaceInfo> = {
  name: 'TLS',
  param: 'tls',
  title: 'TLS',
  sortable: true,
  width: 10,
  renderer: Renderers.tls,
};

const nsItem: ResourceType<NamespaceInfo> = {
  name: 'Namespace',
  param: 'ns',
  title: 'Namespace',
  sortable: true,
  renderer: Renderers.nsItem,
};

const istioConfiguration: ResourceType<NamespaceInfo> = {
  name: 'IstioConfiguration',
  param: 'ic',
  title: 'Config',
  sortable: true,
  width: 10,
  renderer: Renderers.istioConfig,
};

const status: ResourceType<NamespaceInfo> = {
  name: 'Status',
  param: 'h',
  title: 'Status',
  sortable: true,
  width: 50,
  textCenter: true,
  renderer: Renderers.status,
};

const namespaces: Resource = {
  name: 'namespaces',
  columns: [tlsStatus, nsItem, cluster, istioConfiguration, labels, status],
  badge: PFBadges.Namespace,
};

const workloads: Resource = {
  name: 'workloads',
  columns: [health, item, namespace, cluster, workloadType, labels, details],
  badge: PFBadges.Workload,
};

const applications: Resource = {
  name: 'applications',
  columns: [health, item, namespace, cluster, labels, details],
  badge: PFBadges.App,
};

const services: Resource = {
  name: 'services',
  columns: [
    health,
    serviceItem,
    namespace,
    cluster,
    labels,
    serviceConfiguration,
    details,
  ],
  badge: PFBadges.Service,
};

const istio: Resource = {
  name: 'istio',
  columns: [istioItem, namespace, cluster, istioType, istioObjectConfiguration],
  badge: PFBadges.App,
};

type Config = {
  applications: Resource;
  istio: Resource;
  overview: Resource;
  services: Resource;
  workloads: Resource;
};

const conf: Config = {
  applications: applications,
  istio: istio,
  overview: namespaces,
  services: services,
  workloads: workloads,
};

export const isIstioNamespace = (ns: string): boolean => {
  if (ns === serverConfig.istioNamespace) {
    return true;
  }
  return false;
};

export const hasMissingSidecar = (r: SortResource): boolean => {
  return (
    !isIstioNamespace(r.namespace) &&
    !r.istioSidecar &&
    !isGateway(r.labels) &&
    !isWaypoint(r.labels)
  );
};

export const config: Config = conf;
