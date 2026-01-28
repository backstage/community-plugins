import {
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  createApiFactory,
  createApiRef,
  OAuthApi,
  OpenIdConnectApi,
  ProfileInfoApi,
  BackstageIdentityApi,
  SessionApi,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { mtaApiRef, DefaultMtaApi } from './api/api';

/** @internal */
const oidcAuthApiRef = createApiRef<
  OAuthApi &
    OpenIdConnectApi &
    ProfileInfoApi &
    BackstageIdentityApi &
    SessionApi
>({
  id: 'internal.auth.oidc',
});

/** @public */
export const mtaPlugin = createPlugin({
  id: 'mta',
  apis: [
    createApiFactory({
      api: mtaApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        oidcAuthApi: oidcAuthApiRef,
      },
      factory: ({ discoveryApi, fetchApi, oidcAuthApi }) =>
        new DefaultMtaApi({ discoveryApi, fetchApi, oidcAuthApi }),
    }),
  ],
  routes: {
    entityContent: rootRouteRef,
  },
});

/** @public */
export const EntityMTAContent = mtaPlugin.provide(
  createRoutableExtension({
    name: 'EntityMTAContent',
    component: () => import('./components/App/App').then(m => m.App),
    mountPoint: rootRouteRef,
  }),
);
