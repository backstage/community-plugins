import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { AzureStorageClient, azureStorageApiRef } from './api';

/** @public */
export const azureStoragePlugin = createPlugin({
  id: 'azure-storage',
  apis: [
    createApiFactory({
      api: azureStorageApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new AzureStorageClient({
          discoveryApi,
          fetchApi,
        }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/** @public */
export const AzureStoragePage = azureStoragePlugin.provide(
  createRoutableExtension({
    name: 'AzureStoragePage',
    component: () =>
      import('./components/AzureStoragePage').then(m => m.AzureStoragePage),
    mountPoint: rootRouteRef,
  }),
);
