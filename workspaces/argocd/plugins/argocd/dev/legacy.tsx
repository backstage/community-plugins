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
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';
import { ConfigReader } from '@backstage/config';
import { configApiRef } from '@backstage/core-plugin-api';
import { Page, Header, TabbedLayout } from '@backstage/core-components';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  kubernetesApiRef,
  kubernetesAuthProvidersApiRef,
} from '@backstage/plugin-kubernetes-react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { mockApis, TestApiProvider } from '@backstage/test-utils';

import Box from '@mui/material/Box';

import {
  argoCDApiRef,
  ArgoCDInstanceApiClient,
  argoCDInstanceApiRef,
} from '../src/api';
import {
  ArgocdDeploymentLifecycle,
  ArgocdDeploymentSummary,
  argocdPlugin,
  argocdTranslations,
} from '../src/legacy';
import {
  mockArgocdConfig,
  mockArgocdMultiInstanceConfig,
  mockArgoMultiInstanceAppNameEntity,
  mockArgoMultiInstanceSelectorEntity,
  mockEntity,
  mockArgoOneAppEntity,
} from './__data__';
import { mockArgoResources } from './__data__/argoRolloutsObjects';
import {
  MockArgoCDApiClient,
  MockKubernetesClient,
  mockKubernetesAuthProviderApi,
} from './__fixtures__/mockClients';
import { getArgocdInstances } from '../src/hooks/useArgocdConfig';
import { DeploymentLifecycle } from '../src/components/DeploymentLifeCycle';
import { DeploymentSummary } from '../src/components/DeploymentSummary';

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
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApi],
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
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApi],
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
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApi],
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
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApi],
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
          [kubernetesAuthProvidersApiRef, mockKubernetesAuthProviderApi],
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
