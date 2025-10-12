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
import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { configApiRef } from '@backstage/core-plugin-api';
import { ConfigReader } from '@backstage/core-app-api';
import {
  KubernetesApi,
  kubernetesApiRef,
  KubernetesAuthProvidersApi,
  kubernetesAuthProvidersApiRef,
} from '@backstage/plugin-kubernetes';
import {
  CustomObjectsByEntityRequest,
  KubernetesRequestBody,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';
import { EntityFluxOCIRepositoriesCard } from './EntityFluxOCIRepositoriesCard';

const makeTestOCIRepository = (name: string, url: string) => {
  return {
    apiVersion: 'source.toolkit.fluxcd.io/v1beta2',
    kind: 'OCIRepository',
    metadata: {
      creationTimestamp: '2023-06-23T07:50:47Z',
      finalizers: ['finalizers.fluxcd.io'],
      generation: 1,
      name: name,
      namespace: 'default',
      resourceVersion: '143955',
      uid: '1ec54278-ed2d-4f31-9bb0-39dc7163730e',
    },
    spec: {
      interval: '5m',
      provider: 'generic',
      timeout: '60s',
      url: url,
      verify: {
        provider: 'cosign',
      },
    },
    status: {
      artifact: {
        digest:
          'sha256:62df151eb3714d9dfa943c7d88192d72466bffa268b25595f85530b793f77524',
        lastUpdateTime: '2023-06-23T07:50:53Z',
        metadata: {
          'org.opencontainers.image.created': '2023-05-03T14:30:58Z',
          'org.opencontainers.image.revision':
            '6.3.6/073f1ec5aff930bd3411d33534e91cbe23302324',
          'org.opencontainers.image.source':
            'https://github.com/stefanprodan/podinfo',
        },
        path: 'ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz',
        revision:
          'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4',
        size: 1071,
        url: 'http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4.tar.gz',
      },
      conditions: [
        {
          lastTransitionTime: '2023-06-23T07:50:53Z',
          message:
            "stored artifact for digest 'latest@sha256: 2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'",
          observedGeneration: 1,
          reason: 'Succeeded',
          status: 'True',
          type: 'Ready',
        },
        {
          lastTransitionTime: '2023-06 - 23T07: 50: 53Z',
          message:
            "stored artifact for digest 'latest @sha256: 2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'",
          observedGeneration: 1,
          reason: 'Succeeded',
          status: 'True',
          type: 'ArtifactInStorage',
        },
        {
          lastTransitionTime: '2023-06-23T07:50:52Z',
          message:
            "verified signature of revision latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4'",
          observedGeneration: 1,
          reason: 'Succeeded',
          status: 'True',
          type: 'SourceVerified',
        },
      ],
      observedGeneration: 1,
      url: 'http://source-controller.flux-system.svc.cluster.local./ocirepository/default/podinfo/latest.tar.gz',
    },
  };
};

class StubKubernetesClient implements KubernetesApi {
  getObjectsByEntity = jest.fn();

  getCluster = jest.fn();

  async getClusters(): Promise<{ name: string; authProvider: string }[]> {
    return [{ name: 'mock-cluster', authProvider: 'serviceAccount' }];
  }

  getWorkloadsByEntity = jest.fn();

  getCustomObjectsByEntity(
    _: CustomObjectsByEntityRequest,
  ): Promise<ObjectsByEntityResponse> {
    return Promise.resolve({
      items: [
        {
          cluster: {
            name: 'demo-cluster',
          },
          podMetrics: [],
          errors: [],
          resources: [
            {
              type: 'customresources',
              resources: [
                makeTestOCIRepository(
                  'podinfo',
                  'oci://ghcr.io/stefanprodan/manifests/podinfo',
                ),
              ],
            },
          ],
        },
      ],
    });
  }

  proxy = jest.fn();
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

const entity: Entity = {
  apiVersion: 'v1',
  kind: 'Component',
  metadata: {
    name: 'my-name',
    annotations: {
      'backstage.io/kubernetes-id': 'testing-service',
    },
  },
};

describe('<FluxOCIRepositoriesCard />', () => {
  let Wrapper: ComponentType<PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('listing OCI Repositories', () => {
    it('shows the details of an OCI Repository', async () => {
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
                      readOnly: false,
                    },
                  },
                }),
              ],
              [kubernetesApiRef, new StubKubernetesClient()],
              [
                kubernetesAuthProvidersApiRef,
                new StubKubernetesAuthProvidersApi(),
              ],
            ]}
          >
            <EntityProvider entity={entity}>
              <EntityFluxOCIRepositoriesCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      const testCases = [
        {
          name: 'default/podinfo',
          url: 'oci://ghcr.io/stefanprodan/manifests/podinfo',
          cluster: 'demo-cluster',
          revision:
            'latest@sha256:2982c337af6ba98c0e9224a5d7149a19baa9cbedea09b16ae44253682050b6a4',
        },
      ];

      // TODO: test for presence of the Icon?

      for (const testCase of testCases) {
        const cell = getByText(testCase.name);
        expect(cell).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.url);
        expect(tr).toHaveTextContent(testCase.cluster);
      }
    });
  });
});
