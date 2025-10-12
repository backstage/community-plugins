/*
 * Copyright 2025 The Backstage Authors
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
import { ComponentType, PropsWithChildren, ReactNode } from 'react';
import {
  MockFetchApi,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { ConfigReader } from '@backstage/core-app-api';
import {
  KubernetesApi,
  kubernetesApiRef,
  KubernetesAuthProvidersApi,
  kubernetesAuthProvidersApiRef,
} from '@backstage/plugin-kubernetes';
import { KubernetesRequestBody } from '@backstage/plugin-kubernetes-common';
import { FluxRuntimeCard } from './FluxRuntimeCard';
import {
  getDeploymentsPath,
  NAMESPACES_PATH,
} from '../../hooks/useGetDeployments';
import { FluxRelease, Namespace } from '../../objects';
import { waitFor } from '@testing-library/react';

const release = {
  name: 'v3.1.2',
} as FluxRelease;

const makeTestFluxController = (
  name: string,
  namespace: string,
  labels: { [name: string]: string },
) => {
  return {
    apiVersion: 'meta.k8s.io/v1',
    kind: 'PartialObjectMetadata',
    metadata: {
      name,
      namespace,
      uid: 'b062d329-538d-4bb3-b4df-b2ac4b06dba8',
      resourceVersion: '1001263',
      generation: 1,
      creationTimestamp: '2023-10-19T16:34:14Z',
      labels,
      annotations: {
        'deployment.kubernetes.io/revision': '1',
      },
    },
  };
};

class StubKubernetesClient implements KubernetesApi {
  getObjectsByEntity = jest.fn();

  getCluster = jest.fn();

  async getClusters(): Promise<{ name: string; authProvider: string }[]> {
    return [
      { name: 'mock-cluster-1', authProvider: 'serviceAccount1' },
      { name: 'mock-cluster-2', authProvider: 'serviceAccount2' },
    ];
  }

  getWorkloadsByEntity = jest.fn();

  getCustomObjectsByEntity = jest.fn();

  async proxy({
    clusterName,
    init,
    path,
  }: {
    clusterName?: string;
    path: string;
    init?: RequestInit | undefined;
  }): Promise<any> {
    if (!init?.method && path === NAMESPACES_PATH) {
      if (clusterName === 'mock-cluster-1') {
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              kind: 'NamespacesList',
              apiVersion: 'meta.k8s.io/v1',
              items: [
                {
                  metadata: {
                    name: 'flux-system',
                    labels: {
                      'app.kubernetes.io/instance': 'flux-system',
                      'app.kubernetes.io/part-of': 'flux',
                      'app.kubernetes.io/version': 'v2.0.0',
                      'kubernetes.io/metadata.name': 'flux-system',
                      'kustomize.toolkit.fluxcd.io/name': 'flux-system',
                      'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
                      'pod-security.kubernetes.io/warn': 'restricted',
                      'pod-security.kubernetes.io/warn-version': 'latest',
                    },
                    uid: '1dcca7cb-c651-4a86-93b4-ecf440df2353',
                    resourceVersion: '1583',
                    creationTimestamp: '2023-10-19T16:34:12Z',
                  },
                } as Namespace,
              ],
            }),
        } as Response;
      }
      if (clusterName === 'mock-cluster-2') {
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              kind: 'NamespacesList',
              apiVersion: 'meta.k8s.io/v1',
              items: [
                {
                  metadata: {
                    name: 'default',
                    uid: '1dcca7cb-c651-4a86-93b4-ecf440df2353',
                    resourceVersion: '1583',
                    creationTimestamp: '2023-10-19T16:34:12Z',
                    labels: {
                      'app.kubernetes.io/instance': 'default',
                      'app.kubernetes.io/part-of': 'flux',
                      'app.kubernetes.io/version': 'v2.0.0',
                      'kubernetes.io/metadata.name': 'default',
                      'kustomize.toolkit.fluxcd.io/name': 'default',
                      'kustomize.toolkit.fluxcd.io/namespace': 'default',
                      'pod-security.kubernetes.io/warn': 'restricted',
                      'pod-security.kubernetes.io/warn-version': 'latest',
                    },
                  },
                } as Namespace,
              ],
            }),
        } as Response;
      }
    }

    if (!init?.method && path === getDeploymentsPath('flux-system')) {
      return {
        ok: true,
        json: () =>
          Promise.resolve({
            kind: 'DeploymentList',
            apiVersion: 'apps/v1',
            items: [
              makeTestFluxController('helm-controller', 'flux-system', {
                'app.kubernetes.io/component': 'helm-controller',
                'app.kubernetes.io/instance': 'flux-system',
                'app.kubernetes.io/part-of': 'flux',
                'app.kubernetes.io/version': 'v2.1.0',
                'control-plane': 'controller',
                'kustomize.toolkit.fluxcd.io/name': 'flux-system',
                'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
              }),
              makeTestFluxController(
                'image-automation-controller',
                'flux-system',
                {
                  'app.kubernetes.io/component': 'image-automation-controller',
                  'app.kubernetes.io/instance': 'flux-system',
                  'app.kubernetes.io/part-of': 'flux',
                  'app.kubernetes.io/version': 'v2.1.2',
                  'control-plane': 'controller',
                  'kustomize.toolkit.fluxcd.io/name': 'flux-system',
                  'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
                },
              ),
            ],
          }),
      } as Response;
    }

    if (!init?.method && path === getDeploymentsPath('default')) {
      return {
        ok: true,
        json: () =>
          Promise.resolve({
            kind: 'DeploymentList',
            apiVersion: 'apps/v1',
            items: [
              makeTestFluxController('image-automation-controller', 'default', {
                'app.kubernetes.io/component': 'image-automation-controller',
                'app.kubernetes.io/instance': 'default',
                'app.kubernetes.io/part-of': 'flux',
                'app.kubernetes.io/version': 'v2.1.2',
                'control-plane': 'controller',
                'kustomize.toolkit.fluxcd.io/name': 'default',
                'kustomize.toolkit.fluxcd.io/namespace': 'default',
              }),
            ],
          }),
      } as Response;
    }

    return null;
  }
}

class StubKubernetesAuthProvidersApi implements KubernetesAuthProvidersApi {
  decorateRequestBodyForAuth(
    _: string,
    requestBody: KubernetesRequestBody,
  ): Promise<KubernetesRequestBody> {
    return Promise.resolve(requestBody);
  }
  getCredentials(_: string): Promise<{
    token?: string;
  }> {
    return Promise.resolve({ token: 'mock-token' });
  }
}

describe('<FluxRuntimeCard />', () => {
  let Wrapper: ComponentType<PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('listing Flux Controllers per Cluster', () => {
    it('shows for each cluster what flux controllers are running', async () => {
      const result = await renderInTestApp(
        <Wrapper>
          <TestApiProvider
            apis={[
              [
                configApiRef,
                new ConfigReader({
                  flux: {
                    gitops: {
                      baseUrl: 'https://example.com/wego',
                    },
                  },
                }),
              ],
              [kubernetesApiRef, new StubKubernetesClient()],
              [
                kubernetesAuthProvidersApiRef,
                new StubKubernetesAuthProvidersApi(),
              ],
              [
                fetchApiRef,
                new MockFetchApi({
                  baseImplementation: async () => {
                    return {
                      json: async () => release,
                    } as Response;
                  },
                }),
              ],
            ]}
          >
            <FluxRuntimeCard />
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      const testCases = [
        {
          cluster: 'mock-cluster-1',
          namespace: 'flux-system',
          version: 'v2.1.0',
          availableComponents: [
            'helm-controller',
            'image-automation-controller',
          ],
          link: 'Update available',
        },
        {
          cluster: 'mock-cluster-2',
          namespace: 'default',
          version: 'v2.1.2',
          availableComponents: ['image-automation-controller'],
          link: 'Update available',
        },
      ];

      for (const testCase of testCases) {
        const cell = getByText(testCase.cluster);
        expect(cell).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.namespace);
        expect(tr).toHaveTextContent(testCase.version);
        expect(tr).toHaveTextContent(testCase.availableComponents.join(', '));
        await waitFor(() => {
          expect(tr).toHaveTextContent(testCase.link);
        });
      }
    });
  });
});
