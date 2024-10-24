// code based on https://github.com/shailahir/backstage-plugin-shorturl
import {
  createPlugin,
  createRoutableExtension,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef, goRouteRef } from './routes';
import { DefaultShortURLApi, shorturlApiRef } from './api/index';

/**
 * The ShortURL frontend plugin.
 * @public
 */
export const shorturlPlugin = createPlugin({
  id: 'shorturl',
  routes: {
    root: rootRouteRef,
    go: goRouteRef,
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

/**
 * ShortURLPage is a ui on /shorturl to manage short urls
 * @public
 */
export const ShortURLPage = shorturlPlugin.provide(
  createRoutableExtension({
    name: 'ShortURLPage',
    component: () =>
      import('./components/ShortURLPage').then(m => m.ShortURLPage),
    mountPoint: rootRouteRef,
  }),
);

/**
 * ShortURLGo is a ui on /go/:url to redirect to the original url
 * @public
 */
export const ShortURLGo = shorturlPlugin.provide(
  createRoutableExtension({
    name: 'ShortURLGo',
    component: () => import('./components/ShortURLGo').then(m => m.ShortURLGo),
    mountPoint: goRouteRef,
  }),
);
