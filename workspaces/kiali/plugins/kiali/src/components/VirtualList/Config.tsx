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
import { Health } from '@backstage-community/plugin-kiali-common/func';
import {
  dicTypeToGVK,
  IstioConfigItem,
  NamespaceInfo,
  ServiceListItem,
  WorkloadListItem,
} from '@backstage-community/plugin-kiali-common/types';
import type { AppListItem } from '@backstage-community/plugin-kiali-common/types';
import { default as React } from 'react';
import { StatefulFilters } from '../../components/Filters/StatefulFilters';
import { serverConfig } from '../../config';
import { isGateway, isWaypoint } from '../../helpers/LabelFilterHelper';
import {
  getGVKTypeString,
  kindToStringIncludeK8s,
} from '../../utils/IstioConfigUtils';
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

export const GVKToBadge: { [gvk: string]: PFBadgeType } = {};

Object.values(dicTypeToGVK).forEach(value => {
  GVKToBadge[getGVKTypeString(value)] =
    PFBadges[kindToStringIncludeK8s(value.Group, value.Kind)];
});

export type Resource = {
  badge?: PFBadgeType;
  caption?: string;
  columns: ResourceType<any>[];
  name: string;
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
