/*
 * Copyright 2026 The Backstage Authors
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

export type SeedPolicy = {
  entityReference: string;
  permission: string;
  policy: string;
  effect: string;
};

export type SeedCondition = {
  result: string;
  roleEntityRef: string;
  pluginId: string;
  resourceType: string;
  permissionMapping: string[];
  conditions: Record<string, unknown>;
};

export function getGuestsPolicies(guestsRef: string): SeedPolicy[] {
  return [
    {
      entityReference: guestsRef,
      permission: 'catalog-entity',
      policy: 'read',
      effect: 'allow',
    },
    {
      entityReference: guestsRef,
      permission: 'catalog.entity.create',
      policy: 'use',
      effect: 'allow',
    },
    {
      entityReference: guestsRef,
      permission: 'policy-entity',
      policy: 'create',
      effect: 'allow',
    },
    {
      entityReference: guestsRef,
      permission: 'policy-entity',
      policy: 'read',
      effect: 'allow',
    },
    {
      entityReference: guestsRef,
      permission: 'policy-entity',
      policy: 'update',
      effect: 'allow',
    },
    {
      entityReference: guestsRef,
      permission: 'policy-entity',
      policy: 'delete',
      effect: 'allow',
    },
  ];
}

export function getAdminPolicies(adminRef: string): SeedPolicy[] {
  return [
    {
      entityReference: adminRef,
      permission: 'policy-entity',
      policy: 'read',
      effect: 'allow',
    },
    {
      entityReference: adminRef,
      permission: 'policy-entity',
      policy: 'create',
      effect: 'allow',
    },
    {
      entityReference: adminRef,
      permission: 'policy-entity',
      policy: 'update',
      effect: 'allow',
    },
    {
      entityReference: adminRef,
      permission: 'policy-entity',
      policy: 'delete',
      effect: 'allow',
    },
    {
      entityReference: adminRef,
      permission: 'catalog-entity',
      policy: 'read',
      effect: 'allow',
    },
    {
      entityReference: adminRef,
      permission: 'catalog.entity.create',
      policy: 'use',
      effect: 'allow',
    },
    {
      entityReference: adminRef,
      permission: 'catalog-entity',
      policy: 'update',
      effect: 'allow',
    },
    {
      entityReference: adminRef,
      permission: 'catalog-entity',
      policy: 'delete',
      effect: 'allow',
    },
  ];
}

export function getAdminConditions(adminRef: string): SeedCondition[] {
  return [
    {
      result: 'CONDITIONAL',
      roleEntityRef: adminRef,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      permissionMapping: ['read'],
      conditions: {
        rule: 'HAS_ANNOTATION',
        resourceType: 'catalog-entity',
        params: { annotation: 'temp' },
      },
    },
    {
      result: 'CONDITIONAL',
      roleEntityRef: adminRef,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      permissionMapping: ['delete'],
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
    },
    {
      result: 'CONDITIONAL',
      roleEntityRef: adminRef,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      permissionMapping: ['update'],
      conditions: {
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: { claims: ['user:default/ciiay'] },
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
                params: { claims: ['user:default/ciiay'] },
              },
              {
                rule: 'IS_ENTITY_KIND',
                resourceType: 'catalog-entity',
                params: { kinds: ['User'] },
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
                  params: { claims: ['user:default/xyz'] },
                },
                {
                  rule: 'IS_ENTITY_KIND',
                  resourceType: 'catalog-entity',
                  params: { kinds: ['User'] },
                },
              ],
            },
          },
        ],
      },
    },
  ];
}
