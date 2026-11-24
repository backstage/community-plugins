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

import type { ObjectsByEntityResponse } from '@backstage/plugin-kubernetes-common';
import type { KubernetesObjectsProvider } from '@backstage/plugin-kubernetes-node';

import { FIXTURE_CLUSTER_NAME, mockKubernetesResponse } from './fixtureData';

/**
 * Same payload shape as the FE MockKubernetesClient base fixture
 * (`mockKubernetesResponse`), served through kubernetes-backend.
 */
function buildFixtureResources() {
  return Object.entries(mockKubernetesResponse).map(([type, resources]) => ({
    type: type.toLocaleLowerCase('en-US'),
    resources,
  }));
}

function buildFixtureResponse(): ObjectsByEntityResponse {
  return {
    items: [
      {
        cluster: { name: FIXTURE_CLUSTER_NAME },
        resources:
          buildFixtureResources() as ObjectsByEntityResponse['items'][number]['resources'],
        podMetrics: [],
        errors: [],
      },
    ],
  };
}

/**
 * Serves Topology e2e fixture workloads through kubernetes-backend so the
 * frontend talks to discovery → :7007 instead of in-browser mocks.
 */
export const fixtureKubernetesObjectsProvider: KubernetesObjectsProvider = {
  async getKubernetesObjectsByEntity() {
    return buildFixtureResponse();
  },
  async getCustomResourcesByEntity() {
    return buildFixtureResponse();
  },
};
