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
  createPermission,
  ResourcePermission,
} from '@backstage/plugin-permission-common';

/**
 * @public
 */
export const RESOURCE_TYPE_POLICY_ENTITY = 'policy-entity';

/**
 * @public
 * Convenience type for permission entity
 */
export type PolicyEntityPermission = ResourcePermission<
  typeof RESOURCE_TYPE_POLICY_ENTITY
>;

/**
 * @public
 * This permission is used to authorize actions that involve reading
 * permission policies.
 */
export const policyEntityReadPermission = createPermission({
  name: 'policy.entity.read',
  attributes: {
    action: 'read',
  },
  resourceType: RESOURCE_TYPE_POLICY_ENTITY,
});

/**
 * @public
 * This permission is used to authorize the creation of new permission policies.
 */
export const policyEntityCreatePermission = createPermission({
  name: 'policy.entity.create',
  attributes: {
    action: 'create',
  },
});

/**
 * @public
 * This permission is used to authorize actions that involve removing permission
 * policies.
 */
export const policyEntityDeletePermission = createPermission({
  name: 'policy.entity.delete',
  attributes: {
    action: 'delete',
  },
  resourceType: RESOURCE_TYPE_POLICY_ENTITY,
});

/**
 * @public
 * This permission is used to authorize updating permission policies
 */
export const policyEntityUpdatePermission = createPermission({
  name: 'policy.entity.update',
  attributes: {
    action: 'update',
  },
  resourceType: RESOURCE_TYPE_POLICY_ENTITY,
});

/**
 * @public
 * List of all permissions on permission polices.
 */
export const policyEntityPermissions = [
  policyEntityReadPermission,
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityUpdatePermission,
];
