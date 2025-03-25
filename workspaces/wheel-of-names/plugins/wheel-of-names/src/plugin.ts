import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const wheelOfNamesPlugin = createPlugin({
  id: 'wheel-of-names',
  routes: {
    root: rootRouteRef,
  },
});

export const WheelOfNamesPage = wheelOfNamesPlugin.provide(
  createRoutableExtension({
    name: 'WheelOfNamesPage',
    component: () =>
      import('./pages/WheelOfNamesPage').then(m => m.WheelOfNamesPage),
    mountPoint: rootRouteRef,
  }),
);
