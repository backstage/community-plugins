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
  AllFilterTypes,
  FILTER_ACTION_APPEND,
  FilterType,
  IstioConfigItem,
  SortField,
  ToggleType,
} from '@backstage-community/plugin-kiali-common/types';
import { serverConfig } from '../../config';
import { compareValidations } from '../ServiceList/FiltersAndSorts';

export const sortFields: SortField<IstioConfigItem>[] = [
  {
    id: 'namespace',
    title: 'Namespace',
    isNumeric: false,
    param: 'ns',
    compare: (a: IstioConfigItem, b: IstioConfigItem): number => {
      return (
        a.namespace.localeCompare(b.namespace) || a.name.localeCompare(b.name)
      );
    },
  },
  {
    id: 'type',
    title: 'Type',
    isNumeric: false,
    param: 'it',
    compare: (a: IstioConfigItem, b: IstioConfigItem): number => {
      return a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name);
    },
  },
  {
    id: 'istioname',
    title: 'Istio Name',
    isNumeric: false,
    param: 'in',
    compare: (a: IstioConfigItem, b: IstioConfigItem): number => {
      // On same name order is not well defined, we need some fallback methods
      // This happens specially on adapters/templates where Istio 1.0.x calls them "handler"
      // So, we have a lot of objects with same namespace+name
      return (
        a.name.localeCompare(b.name) ||
        a.namespace.localeCompare(b.namespace) ||
        a.kind.localeCompare(b.kind)
      );
    },
  },
  {
    id: 'configvalidation',
    title: 'Config',
    isNumeric: false,
    param: 'cv',
    compare: (a: IstioConfigItem, b: IstioConfigItem) =>
      compareValidations(a, b),
  },
  {
    id: 'cluster',
    title: 'Cluster',
    isNumeric: false,
    param: 'cl',
    compare: (a: IstioConfigItem, b: IstioConfigItem): number => {
      if (a.cluster && b.cluster) {
        let sortValue = a.cluster.localeCompare(b.cluster);
        if (sortValue === 0) {
          sortValue = a.name.localeCompare(b.name);
        }
        return sortValue;
      }
      return 0;
    },
  },
];

export const istioNameFilter: FilterType = {
  category: 'Istio Name',
  placeholder: 'Filter by Istio Name',
  filterType: AllFilterTypes.text,
  action: FILTER_ACTION_APPEND,
  filterValues: [],
};

// Used when Istio Config is implied
export const istioTypeFilter: FilterType = {
  category: 'Type',
  placeholder: 'Filter by Type',
  filterType: AllFilterTypes.typeAhead,
  action: FILTER_ACTION_APPEND,
  filterValues: [
    {
      id: 'AuthorizationPolicy',
      title: 'AuthorizationPolicy',
    },
    {
      id: 'DestinationRule',
      title: 'DestinationRule',
    },
    {
      id: 'EnvoyFilter',
      title: 'EnvoyFilter',
    },
    {
      id: 'Gateway',
      title: 'Gateway',
    },
    {
      id: 'K8sGateway',
      title: 'K8sGateway',
    },
    {
      id: 'K8sGRPCRoute',
      title: 'K8sGRPCRoute',
    },
    {
      id: 'K8sHTTPRoute',
      title: 'K8sHTTPRoute',
    },
    {
      id: 'K8sReferenceGrant',
      title: 'K8sReferenceGrant',
    },
    {
      id: 'K8sTCPRoute',
      title: 'K8sTCPRoute',
    },
    {
      id: 'K8sTLSRoute',
      title: 'K8sTLSRoute',
    },
    {
      id: 'PeerAuthentication',
      title: 'PeerAuthentication',
    },
    {
      id: 'RequestAuthentication',
      title: 'RequestAuthentication',
    },
    {
      id: 'ServiceEntry',
      title: 'ServiceEntry',
    },
    {
      id: 'Sidecar',
      title: 'Sidecar',
    },
    {
      id: 'Telemetry',
      title: 'Telemetry',
    },
    {
      id: 'VirtualService',
      title: 'VirtualService',
    },
    {
      id: 'WasmPlugin',
      title: 'WasmPlugin',
    },
    {
      id: 'WorkloadEntry',
      title: 'WorkloadEntry',
    },
    {
      id: 'WorkloadGroup',
      title: 'WorkloadGroup',
    },
  ],
};

// Used when Istio Config should be explicit
export const istioConfigTypeFilter = {
  ...istioTypeFilter,
  category: 'Istio Config Type',
  placeholder: 'Filter by Istio Config Type',
};

export const configValidationFilter: FilterType = {
  category: 'Config',
  placeholder: 'Filter by Config Validation',
  filterType: AllFilterTypes.select,
  action: FILTER_ACTION_APPEND,
  filterValues: [
    {
      id: 'valid',
      title: 'Valid',
    },
    {
      id: 'warning',
      title: 'Warning',
    },
    {
      id: 'notvalid',
      title: 'Not Valid',
    },
    {
      id: 'notvalidated',
      title: 'Not Validated',
    },
  ],
};

export const availableFilters: FilterType[] = [
  istioTypeFilter,
  istioNameFilter,
  configValidationFilter,
];

const configurationToggle: ToggleType = {
  label: 'Configuration Validation',
  name: 'configuration',
  isChecked: true,
};

export const getAvailableToggles = (): ToggleType[] => {
  configurationToggle.isChecked =
    serverConfig.kialiFeatureFlags.uiDefaults.list.includeValidations;
  return [configurationToggle];
};

export const sortIstioItems = (
  unsorted: IstioConfigItem[],
  sortField: SortField<IstioConfigItem>,
  isAscending: boolean,
): IstioConfigItem[] => {
  return unsorted.sort(
    isAscending ? sortField.compare : (a, b) => sortField.compare(b, a),
  );
};
