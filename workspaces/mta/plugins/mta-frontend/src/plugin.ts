import {
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import { createApiFactory } from '@backstage/frontend-plugin-api';

import { rootRouteRef } from './routes';
import { mtaApiRef, DefaultMtaApi } from './api/api';

export const mtaPlugin = createPlugin({
  id: 'mta',
  apis: [
    createApiFactory({
      api: mtaApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        config: configApiRef,
      },
      factory: ({ discoveryApi, identityApi }) => {
        return new DefaultMtaApi({ discoveryApi, identityApi });
      },
    }),
  ],
  routes: {
    entityContent: rootRouteRef,
  },
});

export const EntityMTAContent = mtaPlugin.provide(
  createRoutableExtension({
    name: 'EntityMTAContent',
    component: () => import('./components/App/App').then(m => m.App),
    mountPoint: rootRouteRef,
  }),
);
