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
import '@patternfly/react-core/dist/styles/base-no-reset.css';

import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { argoCDApiRef, argoCDInstanceApiRef } from './api';
import { rootRouteRef } from './routes';
import { ArgoCDApiClient } from './api/ArgoCDApiClient';
import { ArgoCDInstanceApiClient } from './api/ArgoCDInstanceApiClient';
import { getArgocdInstances } from './hooks/useArgocdConfig';

/**
 * ArgoCD plugin (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const argocdPlugin = createPlugin({
  id: 'backstage-community-argocd',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
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
    createApiFactory({
      api: argoCDInstanceApiRef,
      deps: {
        configApi: configApiRef,
        argoCDApi: argoCDApiRef,
      },
      factory: ({ configApi, argoCDApi }) =>
        new ArgoCDInstanceApiClient({
          argoCDApi,
          instances: getArgocdInstances(configApi),
        }),
    }),
  ],
});

/**
 * ArgoCD Deployment Lifecycle extension (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const ArgocdDeploymentLifecycle = argocdPlugin.provide(
  createRoutableExtension({
    name: 'ArgocdDeploymentLifecycle',
    component: () =>
      import('./components/DeploymentLifeCycle').then(
        m => m.DeploymentLifecycle,
      ),
    mountPoint: rootRouteRef,
  }),
);

/**
 * ArgoCD Deployment Summary extension (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const ArgocdDeploymentSummary = argocdPlugin.provide(
  createRoutableExtension({
    name: 'ArgocdDeploymentSummary',
    component: () =>
      import('./components/DeploymentSummary').then(m => m.DeploymentSummary),
    mountPoint: rootRouteRef,
  }),
);

export { isArgocdConfigured } from './utils/isArgocdConfigured';

export type { DeploymentSummaryProps } from './components/DeploymentSummary/DeploymentSummary';
export type { DeploymentLifecycleProps } from './components/DeploymentLifeCycle/DeploymentLifecycle';
