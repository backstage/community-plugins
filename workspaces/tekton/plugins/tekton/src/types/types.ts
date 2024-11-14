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
import { createApiRef } from '@backstage/core-plugin-api';
import {
  KubernetesApi,
  KubernetesAuthProvidersApi,
  KubernetesProxyApi,
} from '@backstage/plugin-kubernetes-react';

import { ComputedStatus } from '@janus-idp/shared-react';

export const tektonGroupColor = '#38812f';

export type GroupVersionKind = {
  kind: string;
  apiVersion: string;
  apiGroup?: string;
};

export type TektonResponseData = {
  [key: string]: { data: any[] };
};

export type ClusterError = {
  errorType?: string;
  message?: string;
  resourcePath?: string;
  statusCode?: number;
};

export type ClusterErrors = ClusterError[];

export type TektonResourcesContextData = {
  watchResourcesData?: TektonResponseData;
  loaded?: boolean;
  responseError?: string;
  selectedClusterErrors?: ClusterErrors;
  clusters: string[];
  selectedCluster?: number;
  setSelectedCluster: React.Dispatch<React.SetStateAction<number>>;
  selectedStatus: ComputedStatus;
  setSelectedStatus: React.Dispatch<React.SetStateAction<ComputedStatus>>;
  isExpanded?: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

export type Order = 'asc' | 'desc';

export type OpenRowStatus = {
  [x: string]: boolean;
};

export type PipelineRunScanResults = {
  vulnerabilities?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
};

export const kubernetesAuthProvidersApiRef =
  createApiRef<KubernetesAuthProvidersApi>({
    id: 'plugin.tekton-kubernetes-auth-providers.service',
  });

export const kubernetesApiRef = createApiRef<KubernetesApi>({
  id: 'plugin.tekton-kubernetes.service',
});

export const kubernetesProxyApiRef = createApiRef<KubernetesProxyApi>({
  id: 'plugin.tekton-kubernetes.proxy-service',
});
