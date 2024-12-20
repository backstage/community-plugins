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
import { IstioConfigList } from './IstioConfigList';
import { ValidationStatus } from './IstioObjects';
import { ControlPlaneMetricsMap, Metric } from './Metrics';
import { TLSStatus } from './TLSStatus';

export type NamespaceInfo = {
  annotations?: { [key: string]: string };
  controlPlaneMetrics?: ControlPlaneMetricsMap;
  cluster?: string;
  errorMetrics?: Metric[];
  isAmbient?: boolean;
  istioConfig?: IstioConfigList;
  labels?: { [key: string]: string };
  metrics?: Metric[];
  name: string;
  outboundPolicyMode?: string;
  status?: NamespaceStatus;
  tlsStatus?: TLSStatus;
  validations?: ValidationStatus;
};

export type NamespaceStatus = {
  inError: string[];
  inNotReady: string[];
  inSuccess: string[];
  inWarning: string[];
  notAvailable: string[];
};
