// plugins/kener-status/src/plugin.ts
import {
  createPlugin,
  createRouteRef,
  createComponentExtension,
} from '@backstage/core-plugin-api';
import { KenerStatusPage } from './components/KenerStatusPage';

// Create a route reference for the full-page view.
export const rootRouteRef = createRouteRef({
  id: 'kener-status',
});

// Define the plugin with its routes.
export const kenerStatusPlugin = createPlugin({
  id: 'kener-status',
  routes: {
    root: rootRouteRef,
  },
});

// (Optional) Create a component extension for use as a card on an entity page.
export const EntityKenerStatusCard = kenerStatusPlugin.provide(
  createComponentExtension({
    name: 'EntityKenerStatusCard',
    component: {
      lazy: () =>
        import('./components/KenerStatusCard').then((m) => m.KenerStatusCard),
    },
  }),
);
