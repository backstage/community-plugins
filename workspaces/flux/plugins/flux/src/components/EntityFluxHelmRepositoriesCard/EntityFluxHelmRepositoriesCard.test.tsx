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
import * as helmRepository from '../../__fixtures__/helm_repository.json';
import { EntityFluxHelmRepositoriesCard } from './EntityFluxHelmRepositoriesCard';

const makeTestHelmRepository = (name: string, url: string) => {
  const repo = JSON.parse(JSON.stringify(helmRepository));

  repo.metadata.name = name;
  repo.spec.url = url;

  return repo;
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
                makeTestHelmRepository(
                  'podinfo',
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

describe('<EntityFluxHelmRepositoriesCard />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when the config contains a link to Weave GitOps', () => {
    it('shows the state of a HelmRepository', async () => {
      const result = await renderInTestApp(
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
            <EntityFluxHelmRepositoriesCard />
          </EntityProvider>
        </TestApiProvider>,
      );

      const { getByText } = result;

      const testCases = [
        {
          name: 'podinfo',
          url: 'https://stefanprodan.github.io/podinfo',
          cluster: 'demo-cluster',
        },
        {
          name: 'bitnami',
          url: 'https://repo.vmware.com/bitnami-files/index.yaml',
          cluster: 'demo-cluster',
        },
      ];

      for (const testCase of testCases) {
        const cell = getByText(`default/${testCase.name}`);
        expect(cell).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.url);
        expect(tr).toHaveTextContent(testCase.cluster);
      }
    });
  });

  describe('when the config is not configured with a link to Weave GitOps', () => {
    it('does not include a link to Weave GitOps', async () => {
      const rendered = await renderInTestApp(
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
            <EntityFluxHelmRepositoriesCard />
          </EntityProvider>
        </TestApiProvider>,
      );

      const { getByText } = rendered;

      const cell = getByText('default/podinfo');
      expect(cell).toBeInTheDocument();
      const td = cell.closest('td');
      expect(td).toBeInTheDocument();
      expect(td!.querySelector('a')).toBeNull();
    });
  });
});
