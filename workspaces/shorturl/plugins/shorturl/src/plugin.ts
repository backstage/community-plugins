import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const shorturlPlugin = createPlugin({
  id: 'shorturl',
  routes: {
    root: rootRouteRef,
  },
});

export const ShorturlPage = shorturlPlugin.provide(
  createRoutableExtension({
    name: 'ShorturlPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
