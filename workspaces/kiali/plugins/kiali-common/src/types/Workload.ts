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
import { WorkloadHealth } from '../func/Health';
import type { WorkloadHealthResponse } from './Health';
import type {
  ObjectReference,
  Pod,
  ServiceViewIstio,
  Validations,
} from './IstioObjects';
import type { Namespace } from './Namespace';

export interface WorkloadId {
  namespace: string;
  workload: string;
}

export type WorkloadInfo = {
  cluster: string;
  labelType?: string;
  name: string;
  namespace: string;
  type?: string;
};

export interface Workload {
  name: string;
  cluster?: string;
  type: string;
  createdAt: string;
  resourceVersion: string;
  istioInjectionAnnotation?: boolean;
  istioSidecar: boolean;
  istioAmbient: boolean;
  labels: { [key: string]: string };
  appLabel: boolean;
  versionLabel: boolean;
  replicas: Number;
  availableReplicas: Number;
  pods: Pod[];
  annotations: { [key: string]: string };
  health?: WorkloadHealthResponse;
  services: ServiceViewIstio[];
  runtimes: Runtime[];
  additionalDetails: AdditionalItem[];
  validations?: Validations;
  waypointWorkloads: Workload[];
}

export interface WorkloadListQuery {
  health: 'true' | 'false';
  istioResources: 'true' | 'false';
  rateInterval: string;
}

export interface ClusterWorkloadsResponse {
  cluster?: string;
  validations: Validations;
  workloads: WorkloadListItem[];
}

export const emptyWorkload: Workload = {
  name: '',
  type: '',
  createdAt: '',
  resourceVersion: '',
  istioSidecar: true, // true until proven otherwise
  istioAmbient: false,
  labels: {},
  appLabel: false,
  versionLabel: false,
  replicas: 0,
  availableReplicas: 0,
  pods: [],
  annotations: {},
  services: [],
  runtimes: [],
  additionalDetails: [],
  waypointWorkloads: [],
};

export const WorkloadType = {
  CronJob: 'CronJob',
  DaemonSet: 'DaemonSet',
  Deployment: 'Deployment',
  DeploymentConfig: 'DeploymentConfig',
  Job: 'Job',
  Pod: 'Pod',
  ReplicaSet: 'ReplicaSet',
  ReplicationController: 'ReplicationController',
  StatefulSet: 'StatefulSet',
};

export interface WorkloadOverview {
  name: string;
  cluster?: string;
  type: string;
  istioSidecar: boolean;
  istioAmbient: boolean;
  additionalDetailSample?: AdditionalItem;
  appLabel: boolean;
  versionLabel: boolean;
  labels: { [key: string]: string };
  istioReferences: ObjectReference[];
  notCoveredAuthPolicy: boolean;
  health: WorkloadHealth;
}

export interface WorkloadListItem extends WorkloadOverview {
  namespace: string;
}

export interface WorkloadNamespaceResponse {
  namespace: Namespace;
  workloads: WorkloadOverview[];
  validations: Validations;
}

export interface Runtime {
  name: string;
  dashboardRefs: DashboardRef[];
}

export interface DashboardRef {
  template: string;
  title: string;
}

export interface AdditionalItem {
  title: string;
  value: string;
  icon?: string;
}

export interface WorkloadQuery {
  health: 'true' | 'false';
  rateInterval: string;
  validate: 'true' | 'false';
}
