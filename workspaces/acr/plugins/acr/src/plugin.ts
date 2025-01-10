/*
 * Copyright 2024 The Backstage Authors
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
 * Backstage plugin.
 *
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
 * Page content for the catalog (entity page) that shows
 * latest container images.
 *
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
 * Function that returns true if the given entity contains at least one
 * Azure Container Registry related annotation.
 *
 * @public
 */
export const isAcrAvailable = (entity: Entity) =>
  Boolean(
    entity?.metadata.annotations?.[
      AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME
    ],
  );
