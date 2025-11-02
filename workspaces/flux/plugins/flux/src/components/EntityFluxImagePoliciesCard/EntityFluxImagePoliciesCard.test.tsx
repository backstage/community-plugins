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
import { EntityFluxImagePoliciesCard } from './EntityFluxImagePoliciesCard';

const makeTestImagePolicy = (
  name: string,
  policy: { [name: string]: { [name: string]: string } },
  imageRepositoryRef: string,
  latestImage?: string,
) => {
  return {
    apiVersion: 'image.toolkit.fluxcd.io/v1beta1',
    kind: 'ImagePolicy',
    metadata: {
      creationTimestamp: '2023-06-29T08:06:59Z',
      finalizers: ['finalizers.fluxcd.io'],
      generation: 2,
      labels: {
        'kustomize.toolkit.fluxcd.io/name': 'flux-system',
        'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
      },
      name,
      namespace: 'flux-system',
      resourceVersion: '13621',
      uid: '5009e51d-0fee-4f8e-9df1-7684c8aac4bd',
    },
    spec: {
      imageRepositoryRef: {
        name: imageRepositoryRef,
      },
      policy,
    },
    status: {
      conditions: [
        {
          lastTransitionTime: '2023-07-03T16:18:04Z',
          message:
            'Applied revision: main@sha1:c933408394a3af8fa7208af8c9abf7fe430f99d4',
          observedGeneration: 1,
          reason: 'ReconciliationSucceeded',
          status: 'True',
          type: 'Ready',
        },
      ],
      latestImage,
      observedGeneration: 2,
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
                makeTestImagePolicy(
                  'podinfo',
                  { semver: { range: '5.0.x' } },
                  'podinfo',
                  'ghcr.io/stefanprodan/podinfo:5.0.3',
                ),
                makeTestImagePolicy(
                  'test',
                  { numerical: { order: 'asc' } },
                  'test',
                  'ghcr.io/user/test:1.0.0',
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

describe('<FluxImagePoliciesCard />', () => {
  let Wrapper: ComponentType<PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('listing Image Policies', () => {
    it('shows the details of an image policy', async () => {
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
              <EntityFluxImagePoliciesCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      const testCases = [
        {
          name: 'podinfo',
          imagePolicy: 'semver / 5.0.x',
          imageRepositoryRef: 'podinfo',
          latestImage: 'ghcr.io/stefanprodan/podinfo:5.0.3',
        },
        {
          name: 'test',
          imagePolicy: 'numerical / asc',
          imageRepositoryRef: 'test',
          latestImage: 'ghcr.io/user/test:1.0.0',
        },
      ];

      for (const testCase of testCases) {
        const cell = getByText(testCase.name);
        expect(cell).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.imagePolicy);
        expect(tr).toHaveTextContent(testCase.imageRepositoryRef);
        expect(tr).toHaveTextContent(testCase.latestImage);
      }
    });
  });
});
