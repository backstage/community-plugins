import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { mendApiRef, MendClient } from './api';

import { rootRouteRef } from './routes';

/** @public */
export const plugin = createPlugin({
  id: 'mend-plugin',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: mendApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
      },
      factory: ({ discoveryApi }) => new MendClient({ discoveryApi }),
    }),
  ],
});

/** @public */
export const MendPage = plugin.provide(
  createRoutableExtension({
    name: 'mend-page',
    component: () => import('./App').then(m => m.App),
    mountPoint: rootRouteRef,
  }),
);
