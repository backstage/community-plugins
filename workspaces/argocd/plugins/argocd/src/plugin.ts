import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';

import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { ArgoCDApiClient, argoCDApiRef } from './api';
import { rootRouteRef } from './routes';

export const argocdPlugin = createPlugin({
  id: 'rh-argocd',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: argoCDApiRef,
      deps: {
        identityApi: identityApiRef,
        configApi: configApiRef,
      },
      factory: ({ identityApi, configApi }) =>
        new ArgoCDApiClient({
          identityApi,
          backendBaseUrl: configApi.getString('backend.baseUrl'),
          useNamespacedApps: Boolean(
            configApi.getOptionalBoolean('argocd.namespacedApps'),
          ),
        }),
    }),
  ],
});

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

export const ArgocdDeploymentSummary = argocdPlugin.provide(
  createRoutableExtension({
    name: 'ArgocdDeploymentSummary',
    component: () =>
      import('./components/DeploymentSummary').then(m => m.DeploymentSummary),
    mountPoint: rootRouteRef,
  }),
);
