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
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import {
  Entity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';

import { rootRouteRef } from './routes';
import {
  serviceNowApiRef,
  ServiceNowBackendClient,
} from './api/ServiceNowBackendClient';

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
 * Servicenow entity content that shows an incident table with a
 * filter similar to the catalog table
 * @public
 */
export const EntityServicenowContent = servicenowPlugin.provide(
  createComponentExtension({
    name: 'EntityServicenowContent',
    component: {
      lazy: () =>
        import('./components/Servicenow').then(m => m.EntityServicenowContent),
    },
  }),
);

/**
 * @deprecated please use `EntityServicenowCard` instead, this page
 * might be removed in future releases or replaced with a page
 * that lists the incidents assigned to the current user.
 * @public
 */
export const ServicenowPage = EntityServicenowContent;

/**
 * Check if the current entity is the logged-in user
 * @public
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
