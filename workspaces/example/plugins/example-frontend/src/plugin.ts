import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const exampleFrontendPlugin = createPlugin({
  id: 'example-frontend',
  routes: {
    root: rootRouteRef,
  },
});

export const ExampleFrontendPage = exampleFrontendPlugin.provide(
  createRoutableExtension({
    name: 'ExampleFrontendPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
