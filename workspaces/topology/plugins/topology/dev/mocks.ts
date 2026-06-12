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

import { InMemoryCatalogClient } from '@backstage/catalog-client/testUtils';
import type { Entity } from '@backstage/catalog-model';
import type { KubernetesApi } from '@backstage/plugin-kubernetes-react';
import { mockKubernetesResponse } from '../src/__fixtures__/1-deployments';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-id': 'backstage',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

export const permissionDeniedMockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'permission-denied',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-id': 'backstage',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

export class MockKubernetesClient implements KubernetesApi {
  readonly resources;

  constructor(fixtureData: { [resourceType: string]: any[] }) {
    this.resources = Object.entries(fixtureData).flatMap(
      ([type, resources]) => ({
        type: type.toLocaleLowerCase('en-US'),
        resources,
      }),
    );
  }
  async getWorkloadsByEntity(_request: any): Promise<any> {
    return {
      items: [
        {
          cluster: { name: 'mock-cluster' },
          resources: this.resources,
          podMetrics: [],
          errors: [],
        },
      ],
    };
  }
  async getCustomObjectsByEntity(_request: any): Promise<any> {
    return {
      items: [
        {
          cluster: { name: 'mock-cluster' },
          resources: this.resources,
          podMetrics: [],
          errors: [],
        },
      ],
    };
  }

  async getObjectsByEntity(): Promise<any> {
    return {
      items: [
        {
          cluster: { name: 'mock-cluster' },
          resources: this.resources,
          podMetrics: [],
          errors: [],
        },
      ],
    };
  }

  async getClusters(): Promise<{ name: string; authProvider: string }[]> {
    return [{ name: 'mock-cluster', authProvider: 'serviceAccount' }];
  }
  async getCluster(_clusterName: string): Promise<
    | {
        name: string;
        authProvider: string;
        oidcTokenProvider?: string;
        dashboardUrl?: string;
      }
    | undefined
  > {
    return { name: 'mock-cluster', authProvider: 'serviceAccount' };
  }

  async proxy(_options: { clusterName: string; path: string }): Promise<any> {
    return {
      kind: 'Namespace',
      apiVersion: 'v1',
      metadata: {
        name: 'mock-ns',
      },
    };
  }
}

export const mockKubernetesAuthProviderApi = {
  decorateRequestBodyForAuth: async () => {
    return {
      entity: {
        apiVersion: 'v1',
        kind: 'xyz',
        metadata: { name: 'hey' },
      },
    };
  },
  getCredentials: async () => {
    return {};
  },
};

export const mockKubernetesClient = new MockKubernetesClient(
  mockKubernetesResponse,
);

export const mockCatalogApi = new InMemoryCatalogClient({
  entities: [mockEntity, permissionDeniedMockEntity],
});
