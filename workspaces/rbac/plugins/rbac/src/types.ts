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
import { GroupEntity, UserEntity } from '@backstage/catalog-model';

import { RJSFSchema } from '@rjsf/utils';

import {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import { ConditionsData } from './components/ConditionalAccess/types';

export type { ConditionsData }; // Export ConditionsData

import { RowPolicy } from './components/CreateRole/types';

export type RolesData = {
  name: string;
  description: string;
  members: string[];
  permissions: number;
  modifiedBy: string;
  lastModified: string;
  actionsPermissionResults: {
    edit: { allowed: boolean };
  };
  accessiblePlugins: string[];
};

export type MembersData = {
  name: string;
  type: 'User' | 'Group';
  members: number;
  ref: {
    name: string;
    namespace: string;
    kind: string;
  };
};

export type PermissionsDataSet = {
  plugin: string;
  permission: string;
  policies: Set<RowPolicy>;
  policyString?: Set<string>;
  isResourced?: boolean;
  resourceType?: string;
  usingResourceType?: boolean;
};

export type SelectedPlugin = { label: string; value: string };

export type PermissionsData = {
  id?: number;
  plugin: string;
  permission: string;
  policies: RowPolicy[];
  policyString?: string[] | string;
  isResourced?: boolean;
  conditions?: ConditionsData;
  resourceType?: string;
  usingResourceType?: boolean;
  // New fields for default policies
  effect?: string;
  metadata?: {
    source?: string;
    // other metadata fields can be added if needed
  };
  entityReference?: string; // For '<default>' or actual role entityRef
};

/**
 * @public
 */
export type MemberEntity = UserEntity | GroupEntity;

/**
 * @public
 */
export type RoleError = { error: { name: string; message: string } };

/**
 * @public
 */
export type RoleBasedConditions = Omit<
  RoleConditionalPolicyDecision<PermissionAction>,
  'id'
>;

/**
 * @public
 */
export type ConditionRule = {
  name: string;
  description?: string;
  resourceType: string;
  paramsSchema: RJSFSchema;
};

/**
 * @public
 */
export type PluginConditionRules = {
  pluginId: string;
  rules: ConditionRule[];
};

export type UpdatedConditionsData = {
  id: number;
  updateCondition: RoleBasedConditions;
}[];
