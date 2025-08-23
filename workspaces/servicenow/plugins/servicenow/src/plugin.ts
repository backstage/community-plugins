/*
 * Copyright 2025 The Backstage Authors
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
import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import {
  serviceNowApiRef,
  ServiceNowBackendClient,
} from './api/ServiceNowBackendClient';

import {
  Entity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';

/**
 * Servicenow Plugin
 * @public
 */
export const servicenowPlugin = createPlugin({
  id: 'servicenow',
  apis: [
    createApiFactory({
      api: serviceNowApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, fetchApi, identityApi }) =>
        new ServiceNowBackendClient(discoveryApi, fetchApi, identityApi),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * Servicenow Page
 * @public
 */
export const ServicenowPage = servicenowPlugin.provide(
  createRoutableExtension({
    name: 'ServicenowPage',
    component: () =>
      import('./components/Servicenow').then(m => m.ServicenowContent),
    mountPoint: rootRouteRef,
  }),
);

/**
 * @public
 * Check if the current entity is the logged-in user
 */

export const isMyProfile = (entity: Entity): boolean => {
  const currentUserRef = localStorage.getItem('userEntityRef');
  if (!currentUserRef) return false;

  try {
    const a = parseEntityRef(currentUserRef);
    const b = parseEntityRef(stringifyEntityRef(entity));
    return (
      a.kind.toLowerCase() === b.kind.toLowerCase() &&
      a.namespace.toLowerCase() === b.namespace.toLowerCase() &&
      a.name.toLowerCase() === b.name.toLowerCase()
    );
  } catch {
    return false;
  }
};
