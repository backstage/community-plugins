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
import { ServiceHealth } from '../func';
import {
  DestinationRule,
  K8sGRPCRoute,
  K8sHTTPRoute,
  ServiceEntry,
  Validations,
  VirtualService,
} from './IstioObjects';
import { ResourcePermissions } from './Permissions';
import { ServiceOverview } from './ServiceList';
import { TLSStatus } from './TLSStatus';
import { AdditionalItem, WorkloadInfo } from './Workload';

export interface ServicePort {
  name: string;
  port: number;
  protocol: string;
  appProtocol?: string;
  istioProtocol: string;
  tlsMode: string;
}

export interface Endpoints {
  addresses?: EndpointAddress[];
  ports?: ServicePort[];
}

interface EndpointAddress {
  ip: string;
  kind?: string;
  name?: string;
  istioProtocol?: string;
  tlsMode?: string;
}

// Renamed from WorkloadOverview due conflict in Workload
export interface WorkloadOverviewServiceView {
  name: string;
  type: string;
  istioSidecar: boolean;
  istioAmbient: boolean;
  labels?: { [key: string]: string };
  resourceVersion: string;
  createdAt: string;
  serviceAccountNames: string[];
}

export interface Service {
  additionalDetails: AdditionalItem[];
  type: string;
  name: string;
  createdAt: string;
  resourceVersion: string;
  ip: string;
  ports?: ServicePort[];
  annotations: { [key: string]: string };
  externalName: string;
  labels?: { [key: string]: string };
  selectors?: { [key: string]: string };
  cluster?: string;
}

export interface ServiceDetailsInfo {
  destinationRules: DestinationRule[];
  endpoints?: Endpoints[];
  health?: ServiceHealth;
  isAmbient: boolean;
  istioPermissions: ResourcePermissions;
  istioSidecar: boolean;
  k8sGRPCRoutes: K8sGRPCRoute[];
  k8sHTTPRoutes: K8sHTTPRoute[];
  namespaceMTLS?: TLSStatus;
  service: Service;
  serviceEntries: ServiceEntry[];
  subServices?: ServiceOverview[];
  validations: Validations;
  virtualServices: VirtualService[];
  waypointWorkloads?: WorkloadInfo[];
  workloads?: WorkloadOverviewServiceView[];
}

export interface ServiceDetailsQuery {
  rateInterval?: string;
  validate?: boolean;
}
