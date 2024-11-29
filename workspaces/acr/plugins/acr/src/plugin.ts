import { Entity } from '@backstage/catalog-model';
import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import {
  AzureContainerRegistryApiClient,
  AzureContainerRegistryApiRef,
} from './api';
import { AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME } from './consts';
import { rootRouteRef } from './routes';

/**
 * @public
 */
export const acrPlugin = createPlugin({
  id: 'acr',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: AzureContainerRegistryApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, configApi, identityApi }) =>
        new AzureContainerRegistryApiClient({
          discoveryApi,
          configApi,
          identityApi,
        }),
    }),
  ],
});
/**
 * @public
 */
export const AcrPage = acrPlugin.provide(
  createComponentExtension({
    name: 'AzureContainerRegistryPage',
    component: {
      lazy: () =>
        import('./components/AcrDashboardPage').then(m => m.AcrDashboardPage),
    },
  }),
);
/**
 * @public
 */
export const isAcrAvailable = (entity: Entity) =>
  Boolean(
    entity?.metadata.annotations?.[
      AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME
    ],
  );
