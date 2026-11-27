/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

/**
 * @public
 */
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

/**
 * @public
 */
export const NexusRepositoryManagerPage = nexusRepositoryManagerPlugin.provide(
  createComponentExtension({
    name: 'NexusRepositoryManagerPage',
    component: {
      lazy: () => import('./components').then(m => m.NexusRepositoryManager),
    },
  }),
);

/**
 * @public
 */
export const isNexusRepositoryManagerAvailable = (entity: Entity) =>
  NEXUS_REPOSITORY_MANAGER_ANNOTATIONS.some(value =>
    Boolean(entity.metadata.annotations?.[value.annotation]),
  );

/**
 * @public
 */
export const isNexusRepositoryManagerExperimentalAvailable = (entity: Entity) =>
  isNexusRepositoryManagerAvailable(entity) ||
  NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS.some(value =>
    Boolean(entity.metadata.annotations?.[value.annotation]),
  );
