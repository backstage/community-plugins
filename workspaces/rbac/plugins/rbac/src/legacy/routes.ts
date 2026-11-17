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
import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'rbac',
});

export const roleRouteRef = createSubRouteRef({
  id: 'rbac-role-overview',
  parent: rootRouteRef,
  path: '/roles/:roleKind/:roleNamespace/:roleName',
});

export const createRoleRouteRef = createSubRouteRef({
  id: 'rbac-create-role',
  parent: rootRouteRef,
  path: '/role/new',
});

export const editRoleRouteRef = createSubRouteRef({
  id: 'rbac-edit-role',
  parent: rootRouteRef,
  path: '/role/:roleKind/:roleNamespace/:roleName',
});
