import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const exampleFrontend2Plugin = createPlugin({
  id: 'example-frontend-2',
  routes: {
    root: rootRouteRef,
  },
});

export const ExampleFrontend2Page = exampleFrontend2Plugin.provide(
  createRoutableExtension({
    name: 'ExampleFrontend2Page',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
