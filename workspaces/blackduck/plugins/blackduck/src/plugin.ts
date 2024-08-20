import {
  createPlugin,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

import { blackduckApiRef, BlackDuckClient } from './api';

/**
 * @public
 */
export const blackduckPlugin = createPlugin({
  id: 'blackduck',
  apis: [
    createApiFactory({
      api: blackduckApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, identityApi }) =>
        new BlackDuckClient({
          discoveryApi,
          identityApi,
        }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * @public
 */
export const BlackDuckPage = blackduckPlugin.provide(
  createRoutableExtension({
    name: 'BlackDuckPage',
    component: () =>
      import('./components/BlackDuckPage').then(m => m.BlackDuckPageComponent),
    mountPoint: rootRouteRef,
  }),
);

/**
 * @public
 */
export const RiskCard = blackduckPlugin.provide(
  createRoutableExtension({
    name: 'RiskCard',
    component: () =>
      import('./components/BlackDuckCard').then(m => m.RiskCardComponent),
    mountPoint: rootRouteRef,
  }),
);
