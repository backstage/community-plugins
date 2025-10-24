/*
 * Copyright 2024 The Backstage Authors
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
import '@backstage/ui/css/styles.css';
import { Entity } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import { configApiRef } from '@backstage/core-plugin-api';
import { Page, Header, TabbedLayout } from '@backstage/core-components';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  KubernetesApi,
  kubernetesApiRef,
  kubernetesAuthProvidersApiRef,
} from '@backstage/plugin-kubernetes-react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { mockApis, TestApiProvider } from '@backstage/test-utils';

import { Box } from '@material-ui/core';

import {
  ArgoCDApi,
  argoCDApiRef,
  GetApplicationOptions,
  listAppsOptions,
  RevisionDetailsListOptions,
  RevisionDetailsOptions,
} from '../src/api';
import {
  ArgocdDeploymentLifecycle,
  ArgocdDeploymentSummary,
  argocdPlugin,
} from '../src/plugin';
import { Application } from '@backstage-community/plugin-redhat-argocd-common';
import { customResourceTypes } from '../src/types/resources';
import {
  mockApplication,
  mockArgocdConfig,
  mockQuarkusApplication,
  mockRevision,
  mockRevisions,
  preProdApplication,
  prodApplication,
} from './__data__';
import { mockArgoResources } from './__data__/argoRolloutsObjects';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage-argocd',
    description: 'rhtap argocd plugin',
    annotations: {
      'argocd/app-selector': 'rht.gitops.com/quarks-app-bootstrap',
      'backstage.io/kubernetes-id': 'quarkus-app',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

export class MockArgoCDApiClient implements ArgoCDApi {
  async listApps(_options: listAppsOptions): Promise<any> {
    return {
      items: [
        mockApplication,
        preProdApplication,
        prodApplication,
        mockQuarkusApplication,
      ],
    };
  }

  async getRevisionDetails(_options: RevisionDetailsOptions): Promise<any> {
    return mockRevision;
  }
  async getRevisionDetailsList(
    _options: RevisionDetailsListOptions,
  ): Promise<any> {
    return mockRevisions;
  }
  async getApplication(_options: GetApplicationOptions): Promise<Application> {
    return mockApplication;
  }
}

const mockKubernetesAuthProviderApiRef = {
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

class MockKubernetesClient implements KubernetesApi {
  readonly resources;

  constructor(fixtureData: { [resourceType: string]: any[] }) {
    this.resources = Object.entries(fixtureData).flatMap(
      ([type, resources]) => {
        if (
          customResourceTypes.map(t => t.toLocaleLowerCase()).includes(type)
        ) {
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

createDevApp()
  .registerPlugin(argocdPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [kubernetesApiRef, new MockKubernetesClient(mockArgoResources)],
          [configApiRef, new ConfigReader(mockArgocdConfig)],
          [argoCDApiRef, new MockArgoCDApiClient()],
          [permissionApiRef, mockApis.permission()],
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApiRef],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <Box margin={2}>
            <ArgocdDeploymentLifecycle />
          </Box>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Lifecycle',
    path: '/argocd/deployment-lifecycle',
  })

  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [configApiRef, new ConfigReader(mockArgocdConfig)],
          [argoCDApiRef, new MockArgoCDApiClient()],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <Page themeId="service">
            <Header type="component — service" title="quarkus-app" />
            <TabbedLayout>
              <TabbedLayout.Route path="/" title="CI/CD">
                <ArgocdDeploymentSummary />
              </TabbedLayout.Route>
            </TabbedLayout>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Summary',
    path: 'argocd/deployment-summary',
  })
  .render();
