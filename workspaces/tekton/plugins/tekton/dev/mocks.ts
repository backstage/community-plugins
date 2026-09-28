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
import {
  KubernetesApi,
  KubernetesProxyApi,
} from '@backstage/plugin-kubernetes-react';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import type { PermissionApi } from '@backstage/plugin-permission-react';
import { mockApis } from '@backstage/test-utils';

import { mockKubernetesPlrResponse } from '../src/__fixtures__/1-pipelinesData';
import {
  acsDeploymentCheck,
  acsImageCheckResults,
  acsImageScanResult,
} from '../src/__fixtures__/advancedClusterSecurityData';
import { enterpriseContractResult } from '../src/__fixtures__/enterpriseContractData';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-id': 'backstage',
      'tekton.dev/cicd': 'true',
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
    description: 'Entity for testing Tekton permissions',
    annotations: {
      'backstage.io/kubernetes-id': 'backstage',
      'tekton.dev/cicd': 'true',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

export const mockPermissionApi = mockApis.permission({});

export class MockKubernetesProxyApi implements KubernetesProxyApi {
  async getPodLogs(_request: any): Promise<any> {
    const delayedResponse = (data: string, ms: number) =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            text: data,
          });
        }, ms);
      });

    if (_request.podName.includes('ec-task')) {
      return delayedResponse(JSON.stringify(enterpriseContractResult), 100);
    }

    if (_request.podName.includes('image-scan-task')) {
      return delayedResponse(JSON.stringify(acsImageScanResult), 200);
    }

    if (_request.podName.includes('image-check-task')) {
      return delayedResponse(JSON.stringify(acsImageCheckResults), 300);
    }

    if (_request.podName.includes('deployment-check-task')) {
      return delayedResponse(JSON.stringify(acsDeploymentCheck), 400);
    }

    const response = `\nstreaming logs from container: ${_request.containerName} \n...`;
    return delayedResponse(response, 500);
  }

  async deletePod(): Promise<any> {
    return {};
  }

  async getEventsByInvolvedObjectName(): Promise<any> {
    return {};
  }
}

export class MockKubernetesClient implements KubernetesApi {
  readonly resources;

  constructor(fixtureData: { [resourceType: string]: any[] }) {
    this.resources = Object.entries(fixtureData).flatMap(
      ([type, resources]) => {
        if (type === 'pipelineruns' && resources[0]?.kind === 'PipelineRun') {
          return {
            type: 'customresources',
            resources,
          };
        } else if (type === 'taskruns' && resources[0]?.kind === 'TaskRun') {
          return {
            type: 'customresources',
            resources,
          };
        }
        return {
          type: type.toLocaleLowerCase('en-US'),
          resources,
        };
      },
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

  async proxy(_options: { clusterName: String; path: String }): Promise<any> {
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
  mockKubernetesPlrResponse,
);
export const mockKubernetesProxyApi = new MockKubernetesProxyApi();

export const mockCatalogApi = new InMemoryCatalogClient({
  entities: [mockEntity, permissionDeniedMockEntity],
});

const MOCK_K8S_FINALIZED_MODE_KEY = 'tekton-mock-k8s-finalized-mode';

const kubernetesReadPermissionNames = new Set([
  'kubernetes.clusters.read',
  'kubernetes.resources.read',
]);

type MockKubernetesPermissionsMode = 'allow' | 'deny';

function isPermissionDeniedEntityPath(pathname: string): boolean {
  return /\/component\/permission-denied(?:\/|$)/.test(pathname);
}

function getDesiredMockKubernetesPermissionsModeFromPathname(
  pathname: string,
): MockKubernetesPermissionsMode | undefined {
  if (isPermissionDeniedEntityPath(pathname)) {
    return 'deny';
  }

  if (/\/component\/backstage(?:\/|$)/.test(pathname)) {
    return 'allow';
  }

  return undefined;
}

/**
 * NFS extension `if` predicates are session-scoped. Reload when navigating
 * between the mock `backstage` and `permission-denied` catalog entities so
 * permission checks run again and the Tekton tab is shown or hidden correctly.
 */
export function installMockKubernetesPermissionsPathSync(): void {
  const sync = () => {
    const desiredMode = getDesiredMockKubernetesPermissionsModeFromPathname(
      window.location.pathname,
    );

    if (!desiredMode) {
      return;
    }

    const lastFinalizedMode = sessionStorage.getItem(
      MOCK_K8S_FINALIZED_MODE_KEY,
    );

    if (lastFinalizedMode === desiredMode) {
      return;
    }

    sessionStorage.setItem(MOCK_K8S_FINALIZED_MODE_KEY, desiredMode);
    window.location.reload();
  };

  sync();

  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args) => {
    originalPushState(...args);
    sync();
  };

  history.replaceState = (...args) => {
    originalReplaceState(...args);
    sync();
  };

  window.addEventListener('popstate', sync);
}

/**
 * Mock PermissionApi used by the NFS dev app. The mocked catalog includes
 * `backstage` (allowed) and `permission-denied` (denied) entities; kubernetes
 * read permissions are denied when viewing the permission-denied entity.
 */
export function createMockPermissionApi(): PermissionApi {
  return {
    authorize: async request => {
      if (
        kubernetesReadPermissionNames.has(request.permission.name) &&
        isPermissionDeniedEntityPath(window.location.pathname)
      ) {
        return { result: AuthorizeResult.DENY };
      }

      return { result: AuthorizeResult.ALLOW };
    },
  };
}
