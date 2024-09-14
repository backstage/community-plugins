// code based on https://github.com/shailahir/backstage-plugin-shorturl
import {
  createPlugin,
  createRoutableExtension,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { DefaultShortURLApi, shorturlApiRef } from './api/index';

export const shorturlPlugin = createPlugin({
  id: 'shorturl',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: shorturlApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ fetchApi, discoveryApi, identityApi }) =>
        new DefaultShortURLApi(fetchApi, discoveryApi, identityApi),
    }),
  ],
});

export const ShortURLPage = shorturlPlugin.provide(
  createRoutableExtension({
    name: 'ShortURLPage',
    component: () =>
      import('./components/ShortURLPage').then(m => m.ShortURLPage),
    mountPoint: rootRouteRef,
  }),
);
