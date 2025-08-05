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
  V1IngressRule,
  V1Job,
  V1Pod,
  V1ReplicaSet,
  V1Service,
  V1StatefulSet,
} from '@kubernetes/client-node';

export type GroupVersionKind = {
  kind: string;
  apiVersion: string;
  apiGroup?: string;
};

export type Model = GroupVersionKind & {
  abbr: string;
  labelPlural: string;
  color?: string;
  plural?: string;
};

export type K8sWorkloadResource =
  | V1Deployment
  | V1Pod
  | V1Service
  | V1ReplicaSet
  | V1CronJob
  | V1DaemonSet
  | V1Job
  | V1StatefulSet;

export type K8sResponseData = {
  [key: string]: { data: K8sWorkloadResource[] };
};

export type IngressRule = {
  schema: string;
  rules: V1IngressRule[];
};

export type ClusterError = {
  errorType?: string;
  message?: string;
  resourcePath?: string;
  statusCode?: number;
};

export type ClusterErrors = ClusterError[];

export type K8sResourcesContextData = {
  watchResourcesData?: K8sResponseData;
  loading?: boolean;
  responseError?: string;
  selectedClusterErrors?: ClusterErrors;
  clusters: string[];
  setSelectedCluster: React.Dispatch<React.SetStateAction<number>>;
  selectedCluster?: number;
};

export type TektonResponseData = {
  [key: string]: { data: any[] };
};

export type TopologyDisplayOption = {
  value: string;
  content: string;
  isSelected?: boolean;
  isDisabled?: boolean;
};

export type DisplayFilters = TopologyDisplayOption[];
export type SetAppliedTopologyFilters = (
  filters: TopologyDisplayOption[],
) => void;

export type FilterContextType = {
  filters?: DisplayFilters;
  setAppliedTopologyFilters?: SetAppliedTopologyFilters;
};
