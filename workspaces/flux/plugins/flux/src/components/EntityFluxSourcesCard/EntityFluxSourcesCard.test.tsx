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
import { EntityFluxSourcesCard } from './EntityFluxSourcesCard';
import {
  makeTestGitRepository,
  makeTestHelmRepository,
  makeTestOCIRepository,
} from '../utils-test';
import { shortenSha } from '../helpers';

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
                makeTestGitRepository(
                  'sockshop',
                  'https://github.com/weaveworks/backstage-sockshop',
                  'main',
                ),
                makeTestGitRepository(
                  'backstage',
                  'https://github.com/weaveworks/weaveworks-backstage',
                  'main',
                ),
                makeTestOCIRepository(
                  'podinfoOCI',
                  'oci://ghcr.io/stefanprodan/manifests/podinfo',
                ),
                makeTestHelmRepository(
                  'podinfoHelm',
                  'https://stefanprodan.github.io/podinfo',
                ),
                makeTestHelmRepository(
                  'bitnami',
                  'https://repo.vmware.com/bitnami-files/index.yaml',
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

describe('<EntityFluxSourcesCard />', () => {
  let Wrapper: ComponentType<PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('listing Sources', () => {
    it('shows the details of a Source', async () => {
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
              <EntityFluxSourcesCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      const testCases = [
        {
          name: 'sockshop',
          url: 'https://github.com/weaveworks/backstage-sockshop',
          artifact: 'main',
          cluster: 'demo-cluster',
        },
        {
          name: 'backstage',
          url: 'https://github.com/weaveworks/weaveworks-backstage',
          artifact: 'main',
          cluster: 'demo-cluster',
        },
        {
          name: 'podinfoOCI',
          url: 'oci://ghcr.io/stefanprodan/manifests/podinfo',
          cluster: 'demo-cluster',
          artifact: 'latest',
        },
        {
          name: 'podinfoHelm',
          url: 'https://stefanprodan.github.io/podinfo',
          cluster: 'demo-cluster',
          artifact:
            'sha256:80b091a3a69b9ecfebde40ce2a5f19e95f8f8ea956bd5635a31701f7fad1616e',
        },
        {
          name: 'bitnami',
          url: 'https://repo.vmware.com/bitnami-files/index.yaml',
          cluster: 'demo-cluster',
          artifact:
            'sha256:80b091a3a69b9ecfebde40ce2a5f19e95f8f8ea956bd5635a31701f7fad1616e ',
        },
      ];

      for (const testCase of testCases) {
        const cell = getByText(`default/${testCase.name}`);
        expect(cell).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.url);
        const sha = shortenSha(testCase.artifact) as string;
        expect(tr).toHaveTextContent(sha);
        expect(tr).toHaveTextContent(testCase.cluster);
      }
    });
  });
});
