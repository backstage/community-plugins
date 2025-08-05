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
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import { RoleBasedConditions } from '../types';

export const mockNewConditions: RoleBasedConditions[] = [
  {
    result: AuthorizeResult.CONDITIONAL,
    pluginId: 'catalog',
    resourceType: 'catalog-entity',
    conditions: {
      rule: 'HAS_ANNOTATION',
      resourceType: 'catalog-entity',
      params: { annotation: 'temp' },
    },
    roleEntityRef: 'role:default/rbac_admin',
    permissionMapping: ['read'],
  },
  {
    result: AuthorizeResult.CONDITIONAL,
    pluginId: 'catalog',
    resourceType: 'catalog-entity',
    conditions: {
      allOf: [
        {
          rule: 'HAS_LABEL',
          resourceType: 'catalog-entity',
          params: { label: 'temp' },
        },
        {
          rule: 'HAS_METADATA',
          resourceType: 'catalog-entity',
          params: { key: 'status' },
        },
      ],
    },
    roleEntityRef: 'role:default/rbac_admin',
    permissionMapping: ['delete'],
  },
];

export const mockConditions: RoleConditionalPolicyDecision<PermissionAction>[] =
  [
    {
      id: 1,
      ...mockNewConditions[0],
    },
    {
      id: 2,
      ...mockNewConditions[1],
    },
    {
      id: 3,
      result: AuthorizeResult.CONDITIONAL,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      conditions: {
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/ciiay'],
            },
          },
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group'] },
          },
          {
            allOf: [
              {
                rule: 'IS_ENTITY_OWNER',
                resourceType: 'catalog-entity',
                params: {
                  claims: ['user:default/ciiay'],
                },
              },
              {
                rule: 'IS_ENTITY_KIND',
                resourceType: 'catalog-entity',
                params: {
                  kinds: ['User'],
                },
              },
              {
                not: {
                  rule: 'HAS_LABEL',
                  resourceType: 'catalog-entity',
                  params: { label: 'temp' },
                },
              },
              {
                anyOf: [
                  {
                    rule: 'HAS_TAG',
                    resourceType: 'catalog-entity',
                    params: { tag: 'dev' },
                  },
                  {
                    rule: 'HAS_TAG',
                    resourceType: 'catalog-entity',
                    params: { tag: 'test' },
                  },
                ],
              },
            ],
          },
          {
            not: {
              allOf: [
                {
                  rule: 'IS_ENTITY_OWNER',
                  resourceType: 'catalog-entity',
                  params: {
                    claims: ['user:default/xyz'],
                  },
                },
                {
                  rule: 'IS_ENTITY_KIND',
                  resourceType: 'catalog-entity',
                  params: {
                    kinds: ['User'],
                  },
                },
              ],
            },
          },
        ],
      },
      roleEntityRef: 'role:default/rbac_admin',
      permissionMapping: ['update'],
    },
    {
      id: 4,
      result: AuthorizeResult.CONDITIONAL,
      pluginId: 'scaffolder',
      resourceType: 'scaffolder-template',
      conditions: {
        not: {
          anyOf: [
            {
              rule: 'HAS_TAG',
              resourceType: 'scaffolder-template',
              params: { tag: 'dev' },
            },
            {
              rule: 'HAS_TAG',
              resourceType: 'scaffolder-template',
              params: { tag: 'test' },
            },
          ],
        },
      },
      roleEntityRef: 'role:default/rbac_admin',
      permissionMapping: ['read'],
    },
  ];
