import { type Entity } from '@backstage/catalog-model';
import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import {
  NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
  NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS,
} from './annotations';
import {
  NexusRepositoryManagerApiClient,
  NexusRepositoryManagerApiRef,
} from './api';
import { rootRouteRef } from './routes';

export const nexusRepositoryManagerPlugin = createPlugin({
  id: 'nexus-repository-manager',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: NexusRepositoryManagerApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, configApi, identityApi }) =>
        new NexusRepositoryManagerApiClient({
          discoveryApi,
          configApi,
          identityApi,
        }),
    }),
  ],
});

export const NexusRepositoryManagerPage = nexusRepositoryManagerPlugin.provide(
  createComponentExtension({
    name: 'NexusRepositoryManagerPage',
    component: {
      lazy: () => import('./components').then(m => m.NexusRepositoryManager),
    },
  }),
);

export const isNexusRepositoryManagerAvailable = (entity: Entity) =>
  NEXUS_REPOSITORY_MANAGER_ANNOTATIONS.some(value =>
    Boolean(entity.metadata.annotations?.[value.annotation]),
  );

export const isNexusRepositoryManagerExperimentalAvailable = (entity: Entity) =>
  isNexusRepositoryManagerAvailable(entity) ||
  NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS.some(value =>
    Boolean(entity.metadata.annotations?.[value.annotation]),
  );
