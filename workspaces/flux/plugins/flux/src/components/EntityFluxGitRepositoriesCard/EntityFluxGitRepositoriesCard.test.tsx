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
import { EntityFluxGitRepositoriesCard } from './EntityFluxGitRepositoriesCard';
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

const makeTestGitRepository = (name: string, url: string, branch: string) => {
  return {
    apiVersion: 'source.toolkit.fluxcd.io/v1',
    kind: 'GitRepository',
    metadata: {
      creationTimestamp: '2023-06-22T17:58:23Z',
      finalizers: ['finalizers.fluxcd.io'],
      generation: 1,
      name: name,
      namespace: 'default',
      resourceVersion: '132764',
      uid: '068ec137-b2a0-4b35-90ea-4e9a8a2fe5f6',
    },
    spec: {
      interval: '1m',
      ref: {
        branch: branch,
      },
      timeout: '60s',
      url: url,
    },
    status: {
      artifact: {
        digest:
          'sha256:f1e2d4a8244772c47d5e10b38768acec57dc404d6409464c15d2eb8c84b28b51',
        lastUpdateTime: '2023-06-22T17:58:24Z',
        path: 'gitrepository/default/podinfo/e06a5517daf5ac8c5ba74a97135499e40624885a.tar.gz',
        revision: `${branch}@sha1:e06a5517daf5ac8c5ba74a97135499e40624885a`,
        size: 80053,
        url: 'http://source-controller.flux-system.svc.cluster.local./gitrepository/default/podinfo/e06a5517daf5ac8c5ba74a97135499e40624885a.tar.gz',
      },
      conditions: [
        {
          lastTransitionTime: '2023-06-22T17:58:24Z',
          message:
            "stored artifact for revision 'master@sha1:e06a5517daf5ac8c5ba74a97135499e40624885a'",
          observedGeneration: 1,
          reason: 'Succeeded',
          status: 'True',
          type: 'Ready',
        },
        {
          lastTransitionTime: '2023-06-22T17:58:24Z',
          message:
            "stored artifact for revision 'master@sha1:e06a5517daf5ac8c5ba74a97135499e40624885a'",
          observedGeneration: 1,
          reason: 'Succeeded',
          status: 'True',
          type: 'ArtifactInStorage',
        },
      ],
      observedGeneration: 1,
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
                makeTestGitRepository(
                  'backstage',
                  'https://github.com/weaveworks/weaveworks-backstage',
                  'main',
                ),
                makeTestGitRepository(
                  'sockshop',
                  'https://github.com/weaveworks/backstage-sockshop',
                  'main',
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

describe('<EntityFluxGitRepositoriesCard />', () => {
  let Wrapper: ComponentType<PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the config contains a link to Weave GitOps', () => {
    it('shows the state of a GitRepository', async () => {
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
              <EntityFluxGitRepositoriesCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      const testCases = [
        {
          name: 'sockshop',
          url: 'https://github.com/weaveworks/backstage-sockshop',
          branch: 'main',
          cluster: 'demo-cluster',
        },
        {
          name: 'backstage',
          url: 'https://github.com/weaveworks/weaveworks-backstage',
          branch: 'main',
          cluster: 'demo-cluster',
        },
      ];

      for (const testCase of testCases) {
        const cell = getByText(`default/${testCase.name}`);
        expect(cell).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.url);
        expect(tr).toHaveTextContent(testCase.branch);
        expect(tr).toHaveTextContent(testCase.cluster);
      }
    });
  });

  describe('when the config is not configured with a link to Weave GitOps', () => {
    it('does not include a link to Weave GitOps', async () => {
      const rendered = await renderInTestApp(
        <Wrapper>
          <TestApiProvider
            apis={[
              [configApiRef, new ConfigReader({})],
              [kubernetesApiRef, new StubKubernetesClient()],
              [
                kubernetesAuthProvidersApiRef,
                new StubKubernetesAuthProvidersApi(),
              ],
            ]}
          >
            <EntityProvider entity={entity}>
              <EntityFluxGitRepositoriesCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = rendered;

      const cell = getByText('default/backstage');
      expect(cell).toBeInTheDocument();
      const td = cell.closest('td');
      expect(td).toBeInTheDocument();
      expect(td!.querySelector('a')).toBeNull();
    });
  });
});
