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
import { EntityFluxKustomizationsCard } from './EntityFluxKustomizationsCard';

const makeTestKustomization = (name: string, path: string) => {
  return {
    apiVersion: 'kustomize.toolkit.fluxcd.io/v1',
    kind: 'Kustomization',
    metadata: {
      annotations: {
        'reconcile.fluxcd.io/requestedAt': '2023-07-03T17:18:03.990333+01:00',
      },
      creationTimestamp: '2023-06-29T08:06:59Z',
      finalizers: ['finalizers.fluxcd.io'],
      generation: 1,
      labels: {
        'kustomize.toolkit.fluxcd.io/name': 'flux-system',
        'kustomize.toolkit.fluxcd.io/namespace': 'flux-system',
      },
      name,
      namespace: 'flux-system',
      resourceVersion: '1181625',
      uid: 'ab33ae5b-a282-40b1-9fdc-d87f05401628',
    },
    spec: {
      force: false,
      interval: '10m0s',
      path,
      prune: true,
      sourceRef: {
        kind: 'GitRepository',
        name: 'flux-system',
      },
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
      inventory: {
        entries: [
          {
            id: '_alerts.notification.toolkit.fluxcd.io_apiextensions.k8s.io_CustomResourceDefinition',
            v: 'v1',
          },
          {
            id: '_buckets.source.toolkit.fluxcd.io_apiextensions.k8s.io_CustomResourceDefinition',
            v: 'v1',
          },
          {
            id: '_gitrepositories.source.toolkit.fluxcd.io_apiextensions.k8s.io_CustomResourceDefinition',
            v: 'v1',
          },
          {
            id: '_helmcharts.source.toolkit.fluxcd.io_apiextensions.k8s.io_CustomResourceDefinition',
            v: 'v1',
          },
          {
            id: '_helmreleases.helm.toolkit.fluxcd.io_apiextensions.k8s.io_CustomResourceDefinition',
            v: 'v1',
          },
          {
            id: '_helmrepositories.source.toolkit.fluxcd.io_apiextensions.k8s.io_CustomResourceDefinition',
            v: 'v1',
          },
          {
            id: '_kustomizations.kustomize.toolkit.fluxcd.io_apiextensions.k8s.io_CustomResourceDefinition',
            v: 'v1',
          },
          {
            id: '_ocirepositories.source.toolkit.fluxcd.io_apiextensions.k8s.io_CustomResourceDefinition',
            v: 'v1',
          },
          {
            id: '_providers.notification.toolkit.fluxcd.io_apiextensions.k8s.io_CustomResourceDefinition',
            v: 'v1',
          },
          {
            id: '_receivers.notification.toolkit.fluxcd.io_apiextensions.k8s.io_CustomResourceDefinition',
            v: 'v1',
          },
          {
            id: '_flux-system__Namespace',
            v: 'v1',
          },
          {
            id: 'flux-system_critical-pods-flux-system__ResourceQuota',
            v: 'v1',
          },
          {
            id: 'flux-system_helm-controller__ServiceAccount',
            v: 'v1',
          },
          {
            id: 'flux-system_kustomize-controller__ServiceAccount',
            v: 'v1',
          },
          {
            id: 'flux-system_notification-controller__ServiceAccount',
            v: 'v1',
          },
          {
            id: 'flux-system_source-controller__ServiceAccount',
            v: 'v1',
          },
          {
            id: '_crd-controller-flux-system_rbac.authorization.k8s.io_ClusterRole',
            v: 'v1',
          },
          {
            id: '_flux-edit-flux-system_rbac.authorization.k8s.io_ClusterRole',
            v: 'v1',
          },
          {
            id: '_flux-view-flux-system_rbac.authorization.k8s.io_ClusterRole',
            v: 'v1',
          },
          {
            id: '_cluster-reconciler-flux-system_rbac.authorization.k8s.io_ClusterRoleBinding',
            v: 'v1',
          },
          {
            id: '_crd-controller-flux-system_rbac.authorization.k8s.io_ClusterRoleBinding',
            v: 'v1',
          },
          {
            id: 'flux-system_notification-controller__Service',
            v: 'v1',
          },
          {
            id: 'flux-system_source-controller__Service',
            v: 'v1',
          },
          {
            id: 'flux-system_webhook-receiver__Service',
            v: 'v1',
          },
          {
            id: 'flux-system_helm-controller_apps_Deployment',
            v: 'v1',
          },
          {
            id: 'flux-system_kustomize-controller_apps_Deployment',
            v: 'v1',
          },
          {
            id: 'flux-system_notification-controller_apps_Deployment',
            v: 'v1',
          },
          {
            id: 'flux-system_source-controller_apps_Deployment',
            v: 'v1',
          },
          {
            id: 'flux-system_flux-system_kustomize.toolkit.fluxcd.io_Kustomization',
            v: 'v1',
          },
          {
            id: 'flux-system_allow-egress_networking.k8s.io_NetworkPolicy',
            v: 'v1',
          },
          {
            id: 'flux-system_allow-scraping_networking.k8s.io_NetworkPolicy',
            v: 'v1',
          },
          {
            id: 'flux-system_allow-webhooks_networking.k8s.io_NetworkPolicy',
            v: 'v1',
          },
          {
            id: 'default_podinfo_source.toolkit.fluxcd.io_GitRepository',
            v: 'v1',
          },
          {
            id: 'default_podinfo-shard1_source.toolkit.fluxcd.io_GitRepository',
            v: 'v1',
          },
          {
            id: 'default_podinfo-shard2_source.toolkit.fluxcd.io_GitRepository',
            v: 'v1',
          },
          {
            id: 'flux-system_flux-system_source.toolkit.fluxcd.io_GitRepository',
            v: 'v1',
          },
          {
            id: 'flux-system_source-controller-shardset_templates.weave.works_FluxShardSet',
            v: 'v1alpha1',
          },
        ],
      },
      lastAppliedRevision: 'main@sha1:c933408394a3af8fa7208af8c9abf7fe430f99d4',
      lastAttemptedRevision:
        'main@sha1:c933408394a3af8fa7208af8c9abf7fe430f99d4',
      lastHandledReconcileAt: '2023-07-03T17:18:03.990333+01:00',
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
                makeTestKustomization('flux-system', './clusters/my-cluster'),
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

describe('<FluxKustomizationsCard />', () => {
  let Wrapper: ComponentType<PropsWithChildren<{}>>;

  beforeEach(() => {
    Wrapper = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('listing Kustomizations', () => {
    it('shows the details of an Kustomization', async () => {
      const result = await renderInTestApp(
        <Wrapper>
          <TestApiProvider
            apis={[
              [
                configApiRef,
                new ConfigReader({
                  gitops: {
                    baseUrl: 'https://example.com/wego',
                    readOnly: false,
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
              <EntityFluxKustomizationsCard />
            </EntityProvider>
          </TestApiProvider>
        </Wrapper>,
      );

      const { getByText } = result;

      const testCases = [
        {
          name: 'flux-system',
          path: './clusters/my-cluster',
          repo: 'flux-system',
        },
      ];

      for (const testCase of testCases) {
        const cell = getByText(testCase.name);
        expect(cell).toBeInTheDocument();

        const tr = cell.closest('tr');
        expect(tr).toBeInTheDocument();
        expect(tr).toHaveTextContent(testCase.path);
        expect(tr).toHaveTextContent(testCase.repo);
      }
    });
  });
});
