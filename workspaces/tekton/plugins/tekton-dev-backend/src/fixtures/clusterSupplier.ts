/*
 * Copyright 2026 The Backstage Authors
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

import { ANNOTATION_KUBERNETES_AUTH_PROVIDER } from '@backstage/plugin-kubernetes-common';
import type {
  ClusterDetails,
  KubernetesClustersSupplier,
} from '@backstage/plugin-kubernetes-node';

import { FIXTURE_CLUSTER_NAME } from './fixtureData';

const fixtureCluster: ClusterDetails = {
  name: FIXTURE_CLUSTER_NAME,
  // Dummy URL — objects/proxy are served from fixtures, never contacted.
  url: 'http://127.0.0.1:1',
  authMetadata: {
    [ANNOTATION_KUBERNETES_AUTH_PROVIDER]: 'serviceAccount',
    serviceAccountToken: 'tekton-e2e-fixture-token',
  },
  skipTLSVerify: true,
  skipMetricsLookup: true,
};

export const fixtureKubernetesClusterSupplier: KubernetesClustersSupplier = {
  async getClusters(): Promise<ClusterDetails[]> {
    return [fixtureCluster];
  },
};
