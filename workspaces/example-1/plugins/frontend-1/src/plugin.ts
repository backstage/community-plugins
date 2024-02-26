import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const frontend1Plugin = createPlugin({
  id: 'frontend-1',
  routes: {
    root: rootRouteRef,
  },
});

export const Frontend1Page = frontend1Plugin.provide(
  createRoutableExtension({
    name: 'Frontend1Page',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
