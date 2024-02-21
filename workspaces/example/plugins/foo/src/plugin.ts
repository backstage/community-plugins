import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const fooPlugin = createPlugin({
  id: 'foo',
  routes: {
    root: rootRouteRef,
  },
});

export const FooPage = fooPlugin.provide(
  createRoutableExtension({
    name: 'FooPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
