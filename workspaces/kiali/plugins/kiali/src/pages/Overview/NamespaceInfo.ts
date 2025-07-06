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
  ControlPlaneMetricsMap,
  IstioConfigList,
  Metric,
  TLSStatus,
  ValidationStatus,
} from '@backstage-community/plugin-kiali-common/types';

export type NamespaceInfoStatus = {
  inNotReady: string[];
  inError: string[];
  inWarning: string[];
  inSuccess: string[];
  notAvailable: string[];
};

export type NamespaceInfo = {
  name: string;
  cluster?: string;
  outboundPolicyMode?: string;
  status?: NamespaceInfoStatus;
  tlsStatus?: TLSStatus;
  istioConfig?: IstioConfigList;
  validations?: ValidationStatus;
  metrics?: Metric[];
  errorMetrics?: Metric[];
  labels?: { [key: string]: string };
  annotations?: { [key: string]: string };
  controlPlaneMetrics?: ControlPlaneMetricsMap;
  isAmbient?: boolean;
};
