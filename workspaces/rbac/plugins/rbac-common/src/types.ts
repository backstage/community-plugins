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
import { NotAllowedError } from '@backstage/errors';
import {
  ConditionalPolicyDecision,
  PermissionAttributes,
} from '@backstage/plugin-permission-common';

/**
 * @public
 * 'rest' created via REST API
 * 'csv-file' created via policies-csv-file with defined path in the application configuration
 * 'configuration' created from application configuration
 * 'legacy'; preexisting policies
 */
export type Source = string;

/**
 * @public
 */
export type PermissionPolicyMetadata = {
  source: Source;
};

/**
 * @public
 */
export type RoleMetadata = {
  description?: string;
  source?: Source;
  modifiedBy?: string;
  author?: string;
  lastModified?: string;
  createdAt?: string;
  owner?: string;
};

/**
 * @public
 */
export type Policy = {
  permission?: string;
  policy?: string;
};

/**
 * @public
 */
export type RoleBasedPolicy = Policy & {
  entityReference?: string;
  effect?: string;
  metadata?: PermissionPolicyMetadata;
};

/**
 * @public
 */
export type Role = {
  memberReferences: string[];
  name: string;
  metadata?: RoleMetadata;
};

/**
 * @public
 */
export type UpdatePolicy = {
  oldPolicy: Policy;
  newPolicy: Policy;
};

/**
 * @public
 */
export type NamedPolicy = {
  name: string;

  policy: string;
};

/**
 * @public
 */
export type ResourcedPolicy = NamedPolicy & {
  resourceType: string;
};

/**
 * @public
 */
export type PolicyDetails = NamedPolicy | ResourcedPolicy;

/**
 * @public
 */
export function isResourcedPolicy(
  policy: PolicyDetails,
): policy is ResourcedPolicy {
  return 'resourceType' in policy;
}

/**
 * @public
 */
export type PluginPermissionMetaData = {
  pluginId: string;
  policies: PolicyDetails[];
};

/**
 * @public
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * @public
 * Permission framework attributes action has values: 'create' | 'read' | 'update' | 'delete' | undefined.
 * But we are introducing an action named "use" when action does not exist('undefined') to avoid
 * a more complicated model with multiple policy and request shapes.
 */
export const PermissionActionValues = [
  'create',
  'read',
  'update',
  'delete',
  'use',
] as const;

/**
 * @public
 */
export type PermissionAction = (typeof PermissionActionValues)[number];

/**
 * @public
 */
export const toPermissionAction = (
  attr: PermissionAttributes,
): PermissionAction => attr.action ?? 'use';

/**
 * @public
 */
export function isValidPermissionAction(
  action: string,
): action is PermissionAction {
  return (PermissionActionValues as readonly string[]).includes(action);
}

/**
 * @public
 */
export type PermissionInfo = {
  name: string;
  action: PermissionAction;
};

/**
 * @public
 * Frontend should use RoleConditionalPolicyDecision<PermissionAction>
 */
export type RoleConditionalPolicyDecision<
  T extends PermissionAction | PermissionInfo,
> = ConditionalPolicyDecision & {
  id: number;
  roleEntityRef: string;

  permissionMapping: T[];
};

/**
 * @public
 */
export const ConditionalAliases = {
  CURRENT_USER: 'currentUser',
  OWNER_REFS: 'ownerRefs',
} as const;

/**
 * @public
 */
export const CONDITION_ALIAS_SIGN = '$';

/**
 * @public
 * UnauthorizedError should be uniformely used for authorization errors.
 */
export class UnauthorizedError extends NotAllowedError {
  constructor() {
    super('Unauthorized');
  }
}
