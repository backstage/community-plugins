import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';

import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  gitlabAuthApiRef,
  googleAuthApiRef,
  identityApiRef,
  microsoftAuthApiRef,
  oktaAuthApiRef,
  oneloginAuthApiRef,
} from '@backstage/core-plugin-api';
import {
  KubernetesAuthProviders,
  KubernetesBackendClient,
} from '@backstage/plugin-kubernetes-react';

import { ArgoCDApiClient, argoCDApiRef } from './api';
import { kubernetesApiRef, kubernetesAuthProvidersApiRef } from './kubeApi';
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
    createApiFactory({
      api: kubernetesAuthProvidersApiRef,
      deps: {
        gitlabAuthApi: gitlabAuthApiRef,
        googleAuthApi: googleAuthApiRef,
        microsoftAuthApi: microsoftAuthApiRef,
        oktaAuthApi: oktaAuthApiRef,
        oneloginAuthApi: oneloginAuthApiRef,
      },
      factory: ({
        gitlabAuthApi,
        googleAuthApi,
        microsoftAuthApi,
        oktaAuthApi,
        oneloginAuthApi,
      }) => {
        const oidcProviders = {
          gitlab: gitlabAuthApi,
          google: googleAuthApi,
          microsoft: microsoftAuthApi,
          okta: oktaAuthApi,
          onelogin: oneloginAuthApi,
        };

        return new KubernetesAuthProviders({
          microsoftAuthApi,
          googleAuthApi,
          oidcProviders,
        });
      },
    }),
    createApiFactory({
      api: kubernetesApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        kubernetesAuthProvidersApi: kubernetesAuthProvidersApiRef,
      },
      factory: ({ discoveryApi, fetchApi, kubernetesAuthProvidersApi }) =>
        new KubernetesBackendClient({
          discoveryApi,
          fetchApi,
          kubernetesAuthProvidersApi,
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
