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
import { PermissionsData, SelectedPlugin } from '../../types';

export type SelectedMember = {
  id?: string;
  label: string;
  etag: string;
  namespace?: string;
  type: string;
  members?: number;
  description?: string;
  ref: string;
};

export type RowPolicy = {
  policy: string;
  effect: string;
};

export type RoleFormValues = {
  name: string;
  namespace: string;
  kind: string;
  description?: string;
  owner?: string;
  selectedMembers: SelectedMember[];
  selectedPlugins: SelectedPlugin[];
  permissionPoliciesRows: PermissionsData[];
};

export type PermissionPolicies = {
  [permission: string]: {
    policies: string[];
    isResourced: boolean;
    resourceType?: string;
  };
};

export type PluginsPermissions = {
  [plugin: string]: {
    permissions: string[];
    policies: PermissionPolicies;
  };
};

export type PluginsPermissionPoliciesData = {
  plugins: string[];
  pluginsPermissions: PluginsPermissions;
};
