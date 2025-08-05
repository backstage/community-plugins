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
export const mockFormCurrentValues = {
  kind: 'user',
  name: 'div',
  namespace: 'default',
  selectedMembers: [],
  selectedPlugins: [{ label: 'Catalog', value: 'catalog' }],
  permissionPoliciesRows: [
    {
      permission: 'catalog.entity.read',
      policies: [{ policy: 'read', effect: 'allow' }],
      policyString: 'Read',
      resourceType: 'catalog-entity',
      isResourced: true,
      plugin: 'catalog',
      conditions: {
        condition: {
          rule: 'HAS_LABEL',
          params: {
            label: 'temp',
          },
          resourceType: 'catalog-entity',
        },
      },
    },
  ],
};

export const mockFormInitialValues = {
  kind: 'user',
  name: 'div',
  namespace: 'default',
  selectedMembers: [],
  selectedPlugins: [{ label: 'Catalog', value: 'catalog' }],
  permissionPoliciesRows: [
    {
      id: 1,
      permission: 'catalog.entity.read',
      resourceType: 'catalog-entity',
      policies: [{ policy: 'read', effect: 'allow' }],
      policyString: 'Read',
      isResourced: true,
      plugin: 'catalog',
      conditions: {
        condition: {
          rule: 'HAS_LABEL',
          params: {
            label: 'temp',
          },
          resourceType: 'catalog-entity',
        },
      },
    },
  ],
};
