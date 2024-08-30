import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { OptimizationsApiClient } from '@backstage-community/plugin-redhat-resource-optimization-common';
import { optimizationsBreakdownRouteRef, rootRouteRef } from './routes';
import { optimizationsApiRef } from './apis';

/** @public */
export const resourceOptimizationPlugin = createPlugin({
  id: 'redhat-resource-optimization',
  apis: [
    createApiFactory({
      api: optimizationsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory({ discoveryApi, fetchApi }) {
        return new OptimizationsApiClient({
          discoveryApi,
          fetchApi,
        });
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
    breakdown: optimizationsBreakdownRouteRef,
  },
});

/** @public */
export const ResourceOptimizationPage = resourceOptimizationPlugin.provide(
  createRoutableExtension({
    name: 'ResourceOptimizationPage',
    component: () => import('./pages/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);
