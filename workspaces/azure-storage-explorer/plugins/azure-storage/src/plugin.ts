import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { AzureStorageClient, azureStorageApiRef } from './api';

export const azureStoragePlugin = createPlugin({
  id: 'azure-storage',
  apis: [
    createApiFactory({
      api: azureStorageApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, identityApi }) =>
        new AzureStorageClient({
          discoveryApi,
          identityApi,
        }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const AzureStoragePage = azureStoragePlugin.provide(
  createRoutableExtension({
    name: 'AzureStoragePage',
    component: () =>
      import('./components/AzureStoragePage').then(m => m.AzureStoragePage),
    mountPoint: rootRouteRef,
  }),
);
