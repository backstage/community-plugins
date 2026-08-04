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
import '@patternfly/react-core/dist/styles/base-no-reset.css';

import {
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
  FrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

import { argoCDApiRef, argoCDInstanceApiRef } from './api';
import { ArgoCDApiClient } from './api/ArgoCDApiClient';
import { ArgoCDInstanceApiClient } from './api/ArgoCDInstanceApiClient';
import { getArgocdInstances } from './hooks/useArgocdConfig';
import { rootRouteRef } from './routes';
import { isArgocdConfigured } from './utils/isArgocdConfigured';

const argoCDApi = ApiBlueprint.make({
  name: 'argocd',
  params: defineParams =>
    defineParams({
      api: argoCDApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, fetchApi, configApi }) =>
        new ArgoCDApiClient({
          discoveryApi,
          fetchApi,
          useNamespacedApps: Boolean(
            configApi.getOptionalBoolean('argocd.namespacedApps'),
          ),
        }),
    }),
});

const argoCDInstanceApi = ApiBlueprint.make({
  name: 'argocd-instance',
  params: defineParams =>
    defineParams({
      api: argoCDInstanceApiRef,
      deps: {
        configApi: configApiRef,
        argoCDApi: argoCDApiRef,
      },
      factory: ({ configApi, argoCDApi: argoCDApiDep }) =>
        new ArgoCDInstanceApiClient({
          argoCDApi: argoCDApiDep,
          instances: getArgocdInstances(configApi),
        }),
    }),
});

const deploymentLifecycleEntityContent = EntityContentBlueprint.make({
  name: 'deployment-lifecycle',
  params: {
    path: '/deployment-lifecycle',
    title: 'Deployment Lifecycle',
    routeRef: rootRouteRef,
    filter: isArgocdConfigured,
    loader: async () =>
      import('./components/DeploymentLifeCycle').then(m => (
        <m.DeploymentLifecycle />
      )),
  },
});

const deploymentSummaryEntityContent = EntityContentBlueprint.make({
  name: 'deployment-summary',
  params: {
    path: '/deployment-summary',
    title: 'Deployment Summary',
    filter: isArgocdConfigured,
    loader: async () =>
      import('./components/DeploymentSummary').then(m => (
        <m.DeploymentSummary />
      )),
  },
});

/**
 * ArgoCD plugin for the new frontend system
 *
 * @public
 */
const plugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'backstage-community-argocd',
  extensions: [
    argoCDApi,
    argoCDInstanceApi,
    deploymentLifecycleEntityContent,
    deploymentSummaryEntityContent,
  ],
  routes: {
    root: rootRouteRef,
  },
});

export default plugin;
