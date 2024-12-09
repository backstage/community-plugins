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
import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  identityApiRef,
} from '@backstage/core-plugin-api';

import {
  LicensedUsersAPIClient,
  licensedUsersApiRef,
} from './api/LicensedUsersClient';
import { rbacApiRef, RBACBackendClient } from './api/RBACBackendClient';
import { createRoleRouteRef, roleRouteRef, rootRouteRef } from './routes';

/**
 * @public
 */
export const rbacPlugin = createPlugin({
  id: 'rbac',
  routes: {
    root: rootRouteRef,
    role: roleRouteRef,
    createRole: createRoleRouteRef,
  },
  apis: [
    createApiFactory({
      api: rbacApiRef,
      deps: {
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ configApi, identityApi }) =>
        new RBACBackendClient({ configApi, identityApi }),
    }),
    createApiFactory({
      api: licensedUsersApiRef,
      deps: {
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ configApi, identityApi }) =>
        new LicensedUsersAPIClient({ configApi, identityApi }),
    }),
  ],
});

/**
 * @public
 */
export const RbacPage = rbacPlugin.provide(
  createRoutableExtension({
    name: 'RbacPage',
    component: () => import('./components').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

/**
 * @public
 */
export const Administration = rbacPlugin.provide(
  createComponentExtension({
    name: 'Administration',
    component: {
      lazy: () => import('./components').then(m => m.Administration),
    },
  }),
);
