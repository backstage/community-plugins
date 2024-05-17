import {
  createPlugin,
  createComponentExtension,
  createApiRef,
  discoveryApiRef,
  createApiFactory,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { LinkerdClient } from './api/client';

export const linkerdPluginRef = createApiRef<LinkerdClient>({
  id: 'plugin.linkerd.service',
});

/**
 * @public
 * The linkerd plugin
 */
export const linkerdPlugin = createPlugin({
  id: 'linkerd',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: linkerdPluginRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new LinkerdClient({ discoveryApi, fetchApi }),
    }),
  ],
});

/**
 * @public
 * A card that displays the dependencies of a Linkerd deployment
 */
export const LinkerdDependenciesCard = linkerdPlugin.provide(
  createComponentExtension({
    name: 'LinkerdDependenciesCard',
    component: {
      lazy: () =>
        import('./components/DependenciesCard').then(m => m.DependenciesCard),
    },
  }),
);

/**
 * @public
 * A banner that displays whether a component is meshed with Linkerd
 */
export const LinkerdIsMeshedBanner = linkerdPlugin.provide(
  createComponentExtension({
    name: 'LinkerdIsMeshedBanner',
    component: {
      lazy: () =>
        import('./components/IsMeshedBanner').then(m => m.IsMeshedBanner),
    },
  }),
);
