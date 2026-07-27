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
import ReactDOM from 'react-dom/client';

// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import { createApp } from '@backstage/frontend-defaults';
import {
  ApiBlueprint,
  createFrontendModule,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';

import {
  KubernetesApi,
  kubernetesApiRef,
  kubernetesAuthProvidersApiRef,
} from '@backstage/plugin-kubernetes-react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { mockArgoResources } from './__data__/argoRolloutsObjects';
import { customResourceTypes } from '../src/types/resources';

import {
  ArgoCDApi,
  argoCDApiRef,
  ArgoCDAppDeployRevisionDetails,
  ArgoCDInstanceApiClient,
  argoCDInstanceApiRef,
  FindApplicationsOptions,
  GetApplicationOptions,
  ListAppsOptions,
  RevisionDetailsListOptions,
  RevisionDetailsOptions,
} from '../src/api';
import argocdPlugin from '../src/plugin';
import {
  Application,
  InstanceApplications,
} from '@backstage-community/plugin-argocd-common';
import {
  mockArgocdConfig,
  mockEntity,
  mockIdRevisions,
  DEV_INSTANCE_APPLICATIONS,
  mockArgoMultiInstanceSelectorEntity,
  mockArgoMultiInstanceAppNameEntity,
  mockArgoOneAppEntity,
} from './__data__';
import { getArgocdInstances } from '../src/hooks/useArgocdConfig';
import { ConfigReader } from '@backstage/config';

const getInstanceNameFromUrl = (url: string): string => {
  return url.replace('/argoInstance/', '');
};

class MockArgoCDApiClient implements ArgoCDApi {
  async listApps(options: ListAppsOptions): Promise<{ items: Application[] }> {
    const instanceName = getInstanceNameFromUrl(options.url);
    let apps = DEV_INSTANCE_APPLICATIONS[instanceName] ?? [];

    if (options.appSelector) {
      const decodedSelector = decodeURIComponent(options.appSelector);
      const [labelKey, labelValue] = decodedSelector.split('=', 2);
      apps = apps.filter(app => app.metadata.labels?.[labelKey] === labelValue);
    }

    return { items: apps };
  }

  async getRevisionDetails(
    options: RevisionDetailsOptions,
  ): Promise<ArgoCDAppDeployRevisionDetails> {
    return mockIdRevisions[options.revisionID];
  }

  async getRevisionDetailsList(
    options: RevisionDetailsListOptions,
  ): Promise<ArgoCDAppDeployRevisionDetails[]> {
    if (!options.revisionIDs || options.revisionIDs.length < 1) {
      return [];
    }
    const promises: Promise<ArgoCDAppDeployRevisionDetails>[] = [];

    options.revisionIDs.forEach((revisionID: string) => {
      const application = options.apps.find(app =>
        app?.status?.history?.find(h => h.revision === revisionID),
      );

      if (application) {
        promises.push(
          this.getRevisionDetails({
            app: application.metadata.name as string,
            appNamespace: options.appNamespace,
            instanceName: application.metadata.instance.name,
            revisionID,
          }),
        );
      }

      const multiSourceApp = options.apps.find(app =>
        app?.status?.history?.find(h => h?.revisions?.includes(revisionID)),
      );

      if (multiSourceApp) {
        const history = multiSourceApp.status?.history ?? [];
        const relevantHistories = history.filter(h =>
          h?.revisions?.includes(revisionID),
        );

        relevantHistories.forEach(h => {
          const revisionSourceIndex = h.revisions?.indexOf(revisionID);
          promises.push(
            this.getRevisionDetails({
              app: multiSourceApp.metadata.name as string,
              appNamespace: options.appNamespace,
              instanceName: multiSourceApp.metadata.instance.name,
              revisionID,
              sourceIndex: revisionSourceIndex,
            }),
          );
        });
      }
    });
    return Promise.all(promises);
  }

  async getApplication(options: GetApplicationOptions): Promise<Application> {
    const instanceName = getInstanceNameFromUrl(options.url);

    if (!DEV_INSTANCE_APPLICATIONS[instanceName]) {
      throw new Error(
        `Failed to fetch Application from Instance ${instanceName} : ArgoCD Instance ${instanceName} not found`,
      );
    }

    const result = DEV_INSTANCE_APPLICATIONS[instanceName].filter(
      app => app.metadata.name === options.appName,
    )[0];
    if (!result) {
      throw new Error(
        `Failed to fetch data, status 403: Insufficient permissions for ArgoCD server`,
      );
    }

    return result;
  }

  async findApplications(
    options: FindApplicationsOptions,
  ): Promise<InstanceApplications[]> {
    const result: InstanceApplications[] = [];
    for (const [instanceName, apps] of Object.entries(
      DEV_INSTANCE_APPLICATIONS,
    )) {
      const matchingApps = apps.filter(
        app =>
          app.metadata.name === options.appName &&
          app.metadata.name !== undefined,
      );

      if (matchingApps.length !== 0) {
        result.push({
          name: instanceName,
          url: matchingApps[0].metadata.instance.url,
          appName: [options.appName],
          applications: matchingApps,
        });
      }
    }
    return result;
  }
}

const configApi = new ConfigReader(mockArgocdConfig);
const mockArgoCDApi = new MockArgoCDApiClient();

const argocdDevModule = createFrontendModule({
  pluginId: 'backstage-community-argocd',
  extensions: [
    ApiBlueprint.make({
      name: 'argocd-mock',
      params: defineParams =>
        defineParams({
          api: argoCDApiRef,
          deps: {},
          factory: () => mockArgoCDApi,
        }),
    }),
    ApiBlueprint.make({
      name: 'argocd-instance-mock',
      params: defineParams =>
        defineParams({
          api: argoCDInstanceApiRef,
          deps: {},
          factory: () =>
            new ArgoCDInstanceApiClient({
              argoCDApi: mockArgoCDApi,
              instances: getArgocdInstances(configApi),
            }),
        }),
    }),
  ],
});

const mockKubernetesResources = Object.entries(mockArgoResources).flatMap(
  ([type, resources]) => {
    if (customResourceTypes.map(t => t.toLocaleLowerCase()).includes(type)) {
      return { type: 'customresources', resources };
    }
    return { type: type.toLocaleLowerCase('en-US'), resources };
  },
);

const mockClusterResponse = {
  items: [
    {
      cluster: { name: 'mock-cluster' },
      resources: mockKubernetesResources,
      podMetrics: [],
      errors: [],
    },
  ],
};

const mockKubernetesClient = {
  getWorkloadsByEntity: async () => mockClusterResponse,
  getCustomObjectsByEntity: async () => mockClusterResponse,
  getObjectsByEntity: async () => mockClusterResponse,
  getClusters: async () => [
    { name: 'mock-cluster', authProvider: 'serviceAccount' },
  ],
  getCluster: async () => ({
    name: 'mock-cluster',
    authProvider: 'serviceAccount',
  }),
  proxy: async () =>
    new Response(
      JSON.stringify({
        kind: 'Namespace',
        apiVersion: 'v1',
        metadata: { name: 'mock-ns' },
      }),
    ),
} as unknown as KubernetesApi;

const kubernetesStubPlugin = createFrontendPlugin({
  pluginId: 'kubernetes',
  extensions: [],
});

const kubernetesDevModule = createFrontendModule({
  pluginId: 'kubernetes',
  extensions: [
    ApiBlueprint.make({
      name: 'kubernetes-mock',
      params: defineParams =>
        defineParams({
          api: kubernetesApiRef,
          deps: {},
          factory: () => mockKubernetesClient,
        }),
    }),
  ],
});

const kubernetesAuthStubPlugin = createFrontendPlugin({
  pluginId: 'kubernetes-auth-providers',
  extensions: [],
});

const kubernetesAuthDevModule = createFrontendModule({
  pluginId: 'kubernetes-auth-providers',
  extensions: [
    ApiBlueprint.make({
      name: 'kubernetes-auth-mock',
      params: defineParams =>
        defineParams({
          api: kubernetesAuthProvidersApiRef,
          deps: {},
          factory: () => ({
            decorateRequestBodyForAuth: async () => ({
              entity: {
                apiVersion: 'v1',
                kind: 'xyz',
                metadata: { name: 'hey' },
              },
            }),
            getCredentials: async () => ({}),
          }),
        }),
    }),
  ],
});

const permissionDevModule = createFrontendModule({
  pluginId: 'permission',
  extensions: [
    ApiBlueprint.make({
      name: 'permission-mock',
      params: defineParams =>
        defineParams({
          api: permissionApiRef,
          deps: {},
          factory: () => ({
            authorize: async () => ({ result: AuthorizeResult.ALLOW }),
          }),
        }),
    }),
  ],
});

const catalogDevModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      name: 'catalog-mock',
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () =>
            catalogApiMock({
              entities: [
                mockEntity,
                mockArgoMultiInstanceSelectorEntity,
                mockArgoMultiInstanceAppNameEntity,
                mockArgoOneAppEntity,
              ],
            }),
        }),
    }),
  ],
});

const app = createApp({
  features: [
    catalogPlugin,
    userSettingsPlugin,
    argocdPlugin,
    argocdDevModule,
    catalogDevModule,
    kubernetesStubPlugin,
    kubernetesDevModule,
    kubernetesAuthStubPlugin,
    kubernetesAuthDevModule,
    permissionDevModule,
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(app.createRoot());
