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
// eslint-disable-next-line
import '@backstage/ui/css/styles.css';
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
  ArgoCDAppDeployRevisionDetails,
  ArgoCDInstanceApiClient,
  argoCDInstanceApiRef,
  FindApplicationsOptions,
  GetApplicationOptions,
  ListAppsOptions,
  RevisionDetailsListOptions,
  RevisionDetailsOptions,
} from '../src/api';
import {
  ArgocdDeploymentLifecycle,
  ArgocdDeploymentSummary,
  argocdPlugin,
} from '../src/plugin';
import {
  Application,
  InstanceApplications,
} from '@backstage-community/plugin-argocd-common';
import { customResourceTypes } from '../src/types/resources';
import {
  mockArgocdConfig,
  mockArgocdMultiInstanceConfig,
  mockArgoMultiInstanceAppNameEntity,
  mockArgoMultiInstanceSelectorEntity,
  mockEntity,
  mockIdRevisions,
  DEV_INSTANCE_APPLICATIONS,
  mockArgoOneAppEntity,
} from './__data__';
import { mockArgoResources } from './__data__/argoRolloutsObjects';
import { argocdTranslations } from '../src/translations';
import { getArgocdInstances } from '../src/hooks/useArgocdConfig';
import { DeploymentLifecycle } from '../src/components/DeploymentLifeCycle';
import { DeploymentSummary } from '../src/components/DeploymentSummary';

const getInstanceNameFromUrl = (url: string): string => {
  return url.replace('/argoInstance/', '');
};

export class MockArgoCDApiClient implements ArgoCDApi {
  async listApps(options: ListAppsOptions): Promise<{ items: Application[] }> {
    const instanceName = getInstanceNameFromUrl(options.url);
    let apps = DEV_INSTANCE_APPLICATIONS[instanceName] ?? [];

    if (options.appSelector) {
      const decodedSelector = decodeURIComponent(options.appSelector);
      const [labelKey, labelValue] = decodedSelector.split('=', 2);
      apps = apps.filter(app => app.metadata.labels?.[labelKey] === labelValue);
    }

    return {
      items: apps,
    };
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
      return Promise.resolve([]);
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

      const multiSourceApp = options.apps.find(app => {
        return app?.status?.history?.find(h => {
          return h?.revisions?.includes(revisionID);
        });
      });

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
              revisionID: revisionID,
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

const configApi = new ConfigReader(mockArgocdConfig);
const multiInstanceConfigApi = new ConfigReader(mockArgocdMultiInstanceConfig);
const argoCDApi = new MockArgoCDApiClient();

createDevApp()
  .registerPlugin(argocdPlugin)
  .setAvailableLanguages(['en', 'de', 'es', 'fr', 'it', 'ja'])
  .addTranslationResource(argocdTranslations)
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [kubernetesApiRef, new MockKubernetesClient(mockArgoResources)],
          [configApiRef, configApi],
          [argoCDApiRef, argoCDApi],
          [
            argoCDInstanceApiRef,
            new ArgoCDInstanceApiClient({
              argoCDApi,
              instances: getArgocdInstances(configApi),
            }),
          ],
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
          [configApiRef, configApi],
          [argoCDApiRef, argoCDApi],
          [
            argoCDInstanceApiRef,
            new ArgoCDInstanceApiClient({
              argoCDApi,
              instances: getArgocdInstances(configApi),
            }),
          ],
          [permissionApiRef, mockApis.permission()],
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApiRef],
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
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [kubernetesApiRef, new MockKubernetesClient(mockArgoResources)],
          [configApiRef, multiInstanceConfigApi],
          [argoCDApiRef, argoCDApi],
          [
            argoCDInstanceApiRef,
            new ArgoCDInstanceApiClient({
              argoCDApi,
              instances: getArgocdInstances(multiInstanceConfigApi),
            }),
          ],
          [permissionApiRef, mockApis.permission()],
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApiRef],
        ]}
      >
        <EntityProvider
          key="multi-instance-selector"
          entity={mockArgoMultiInstanceSelectorEntity}
        >
          <Page themeId="service">
            <Header type="component — service" title="quarkus-app" />
            <TabbedLayout>
              <TabbedLayout.Route path="/" title="CI/CD">
                <>
                  <DeploymentLifecycle />
                  <DeploymentSummary />
                </>
              </TabbedLayout.Route>
            </TabbedLayout>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Multi Selector',
    path: 'argocd/multi-instance-selector',
  })
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [kubernetesApiRef, new MockKubernetesClient(mockArgoResources)],
          [configApiRef, multiInstanceConfigApi],
          [argoCDApiRef, argoCDApi],
          [
            argoCDInstanceApiRef,
            new ArgoCDInstanceApiClient({
              argoCDApi,
              instances: getArgocdInstances(multiInstanceConfigApi),
            }),
          ],
          [permissionApiRef, mockApis.permission()],
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApiRef],
        ]}
      >
        <EntityProvider
          key="multi-instance-app-name"
          entity={mockArgoMultiInstanceAppNameEntity}
        >
          <Page themeId="service">
            <Header type="component — service" title="quarkus-app" />
            <TabbedLayout>
              <TabbedLayout.Route path="/" title="CI/CD">
                <>
                  <DeploymentLifecycle />
                  <DeploymentSummary />
                </>
              </TabbedLayout.Route>
            </TabbedLayout>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Multi App Name',
    path: 'argocd/multi-instance-app-name',
  })
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [kubernetesApiRef, new MockKubernetesClient(mockArgoResources)],
          [configApiRef, multiInstanceConfigApi],
          [argoCDApiRef, argoCDApi],
          [
            argoCDInstanceApiRef,
            new ArgoCDInstanceApiClient({
              argoCDApi,
              instances: getArgocdInstances(multiInstanceConfigApi),
            }),
          ],
          [permissionApiRef, mockApis.permission()],
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApiRef],
        ]}
      >
        <EntityProvider
          key="multi-instance-one-app-name"
          entity={mockArgoOneAppEntity}
        >
          <Page themeId="service">
            <Header type="component — service" title="basic-app" />
            <TabbedLayout>
              <TabbedLayout.Route path="/" title="CI/CD">
                <>
                  <DeploymentLifecycle />
                  <DeploymentSummary />
                </>
              </TabbedLayout.Route>
            </TabbedLayout>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Multi One App Name',
    path: 'argocd/multi-instance-one-app-name',
  })
  .render();
