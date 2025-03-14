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
import { PluginPermissionMetaData } from '@backstage-community/plugin-rbac-common';

export const mockPermissionPolicies: PluginPermissionMetaData[] = [
  {
    pluginId: 'catalog',
    policies: [
      {
        resourceType: 'catalog-entity',
        name: 'catalog.entity.read',
        policy: 'read',
      },
      {
        name: 'catalog.entity.create',
        policy: 'use',
      },
      {
        resourceType: 'catalog-entity',
        name: 'catalog.entity.delete',
        policy: 'delete',
      },
      {
        resourceType: 'catalog-entity',
        name: 'catalog.entity.update',
        policy: 'update',
      },
      {
        name: 'catalog.location.read',
        policy: 'read',
      },
      {
        name: 'catalog.location.create',
        policy: 'create',
      },
      {
        name: 'catalog.location.delete',
        policy: 'delete',
      },
    ],
  },
  {
    pluginId: 'scaffolder',
    policies: [
      {
        resourceType: 'scaffolder-template',
        name: 'scaffolder.template.read',
        policy: 'read',
      },
      {
        resourceType: 'scaffolder-action',
        name: 'scaffolder.action.use',
        policy: 'use',
      },
    ],
  },
  {
    pluginId: 'permission',
    policies: [
      {
        resourceType: 'policy-entity',
        name: 'policy.entity.read',
        policy: 'read',
      },
      {
        resourceType: 'policy-entity',
        name: 'policy.entity.create',
        policy: 'create',
      },
      {
        resourceType: 'policy-entity',
        name: 'policy.entity.delete',
        policy: 'delete',
      },
      {
        resourceType: 'policy-entity',
        name: 'policy.entity.update',
        policy: 'update',
      },
    ],
  },
];
