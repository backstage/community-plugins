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
  RESOURCE_TYPE_POLICY_ENTITY,
  type RoleMetadata,
} from '@backstage-community/plugin-rbac-common';
import { createPermissionResourceRef } from '@backstage/plugin-permission-node';
import { RBACFilter } from './rules';

/**
 * Reference to the RBAC permission metadata resource.
 * This is used to create RBAC permissions and conditions.
 *
 */
export const permissionMetadataResourceRef = createPermissionResourceRef<
  RoleMetadata,
  RBACFilter
>().with({
  pluginId: 'permission',
  resourceType: RESOURCE_TYPE_POLICY_ENTITY,
});
