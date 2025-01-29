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
import { PolicyDetails } from '@backstage-community/plugin-rbac-common';

import {
  mockFormCurrentValues,
  mockFormInitialValues,
} from '../__fixtures__/mockFormValues';
import { mockMembers } from '../__fixtures__/mockMembers';
import { mockPermissionPolicies } from '../__fixtures__/mockPermissionPolicies';
import { ConditionsData } from '../components/ConditionalAccess/types';
import {
  getChildGroupsCount,
  getConditionalPermissionPoliciesData,
  getMembersCount,
  getNewConditionalPolicies,
  getParentGroupsCount,
  getPermissionPolicies,
  getPermissionPoliciesData,
  getPluginsPermissionPoliciesData,
  getRemovedConditionalPoliciesIds,
  getRoleData,
  getRulesNumber,
  getUpdatedConditionalPolicies,
} from './create-role-utils';

describe('getRoleData', () => {
  it('should return role data object', () => {
    let values = {
      name: 'testRole',
      namespace: 'default',
      kind: 'group',
      selectedMembers: [
        {
          type: 'User',
          namespace: 'default',
          label: 'user1',
          etag: '1',
          ref: 'user:default/user1',
        },
        {
          type: 'Group',
          namespace: 'default',
          label: 'group1',
          etag: '2',
          ref: 'group:default/group1',
        },
      ],
      selectedPlugins: [],
      permissionPoliciesRows: [
        {
          plugin: '',
          permission: '',
          policies: [
            { policy: 'Create', effect: 'deny' },
            { policy: 'Read', effect: 'deny' },
            { policy: 'Update', effect: 'deny' },
            { policy: 'Delete', effect: 'deny' },
          ],
          isResourced: false,
        },
      ],
    };

    let result = getRoleData(values);

    expect(result).toEqual({
      memberReferences: ['user:default/user1', 'group:default/group1'],
      metadata: {
        description: undefined,
      },
      name: 'group:default/testRole',
    });

    values = {
      name: 'testRole',
      namespace: 'default',
      kind: 'user',
      selectedMembers: [
        {
          type: 'User',
          namespace: 'default',
          label: 'user1',
          etag: '1',
          ref: 'user:default/user1',
        },
        {
          type: 'Group',
          namespace: 'default',
          label: 'group1',
          etag: '2',
          ref: 'group:default/group1',
        },
      ],
      selectedPlugins: [],
      permissionPoliciesRows: [
        {
          plugin: '',
          permission: '',
          policies: [
            { policy: 'Create', effect: 'deny' },
            { policy: 'Read', effect: 'deny' },
            { policy: 'Update', effect: 'deny' },
            { policy: 'Delete', effect: 'deny' },
          ],
          isResourced: false,
        },
      ],
    };

    result = getRoleData(values);

    expect(result).toEqual({
      memberReferences: ['user:default/user1', 'group:default/group1'],
      metadata: {
        description: undefined,
      },
      name: 'user:default/testRole',
    });
  });
});

describe('getMembersCount', () => {
  it('should return the number of members for a group', () => {
    const group = mockMembers[0];

    const result = getMembersCount(group);

    expect(result).toBe(2);
  });

  it('should return 0 if there are no members in the group', () => {
    const group = mockMembers[1];

    const result = getMembersCount(group);

    expect(result).toBe(0);
  });

  it('should return undefined for non-group entities', () => {
    const user = mockMembers[2];

    const result = getMembersCount(user);

    expect(result).toBeUndefined();
  });
});

describe('getParentGroupsCount', () => {
  it('should return the number of parent groups for a group', () => {
    const group = mockMembers[0];

    const result = getParentGroupsCount(group);

    expect(result).toBe(1);
  });

  it('should return undefined for non-group entities', () => {
    const user = mockMembers[2];

    const result = getParentGroupsCount(user);

    expect(result).toBeUndefined();
  });
});

describe('getChildGroupsCount', () => {
  it('should return the number of child groups for a group', () => {
    const group = mockMembers[8];

    const result = getChildGroupsCount(group);

    expect(result).toBe(2);
  });

  it('should return undefined for non-group entities', () => {
    const user = mockMembers[2];

    const result = getChildGroupsCount(user);

    expect(result).toBeUndefined();
  });
});

describe('getPermissionPolicies', () => {
  it('returns empty object for empty input', () => {
    const result = getPermissionPolicies([]);
    expect(result).toEqual({});
  });

  it('correctly transforms policies into PermissionPolicies', () => {
    const policies: PolicyDetails[] = [
      {
        resourceType: 'catalog-entity',
        name: 'catalog.entity.read',
        policy: 'read',
      },
      {
        name: 'catalog.entity.create',
        policy: 'create',
      },
    ];
    const result = getPermissionPolicies(policies);
    expect(result).toEqual({
      'catalog.entity.read': {
        policies: ['Read'],
        isResourced: true,
        resourceType: 'catalog-entity',
      },
      'catalog.entity.create': {
        policies: ['Create'],
        isResourced: false,
        resourceType: '',
      },
    });
  });
});

describe('getPluginsPermissionPoliciesData', () => {
  it('returns empty object for empty input', () => {
    const result = getPluginsPermissionPoliciesData([]);
    expect(result).toEqual({ plugins: [], pluginsPermissions: {} });
  });

  it('correctly transforms pluginsPermissionPolicies', () => {
    const result = getPluginsPermissionPoliciesData(mockPermissionPolicies);

    expect(result).toEqual({
      plugins: ['catalog', 'scaffolder', 'permission'],
      pluginsPermissions: {
        catalog: {
          permissions: [
            'catalog.entity.read',
            'catalog.entity.create',
            'catalog.entity.delete',
            'catalog.entity.update',
            'catalog.location.read',
            'catalog.location.create',
            'catalog.location.delete',
          ],
          policies: {
            'catalog.entity.read': {
              policies: ['Read'],
              isResourced: true,
              resourceType: 'catalog-entity',
            },
            'catalog.entity.delete': {
              policies: ['Delete'],
              isResourced: true,
              resourceType: 'catalog-entity',
            },
            'catalog.entity.update': {
              policies: ['Update'],
              isResourced: true,
              resourceType: 'catalog-entity',
            },
            'catalog.entity.create': {
              policies: ['Create'],
              isResourced: false,
              resourceType: '',
            },
            'catalog.location.read': {
              policies: ['Read'],
              isResourced: false,
              resourceType: '',
            },
            'catalog.location.create': {
              policies: ['Create'],
              isResourced: false,
              resourceType: '',
            },
            'catalog.location.delete': {
              policies: ['Delete'],
              isResourced: false,
              resourceType: '',
            },
          },
        },
        scaffolder: {
          permissions: [
            'scaffolder.template.read',
            'scaffolder.template.read',
            'scaffolder.action.use',
          ],
          policies: {
            'scaffolder.template.read': {
              policies: ['Read'],
              isResourced: true,
              resourceType: 'scaffolder-template',
            },
            'scaffolder.action.use': {
              policies: ['Use'],
              isResourced: true,
              resourceType: 'scaffolder-action',
            },
          },
        },
        permission: {
          permissions: [
            'policy-entity',
            'policy-entity',
            'policy-entity',
            'policy-entity',
          ],
          policies: {
            'policy-entity': {
              policies: ['Read', 'Create', 'Delete', 'Update'],
              isResourced: false,
              resourceType: '',
            },
          },
        },
      },
    });
  });
});

describe('getPermissionPoliciesData', () => {
  it('returns empty array for empty input', () => {
    const result = getPermissionPoliciesData({
      kind: 'role',
      name: 'testRole',
      namespace: 'default',
      selectedMembers: [],
      selectedPlugins: [],
      permissionPoliciesRows: [],
    });
    expect(result).toEqual([]);
  });

  it('correctly transforms permissionPoliciesRows into RoleBasedPolicy', () => {
    const values = {
      name: 'testRole',
      namespace: 'default',
      kind: 'role',
      selectedMembers: [],
      selectedPlugins: [
        { label: 'Scaffolder', value: 'scaffolder' },
        { label: 'Catalog', value: 'catalog' },
      ],
      permissionPoliciesRows: [
        {
          plugin: 'scaffolder',
          permission: 'scaffolder-template',
          policies: [
            {
              policy: 'Read',
              effect: 'allow',
            },
          ],
        },
        {
          plugin: 'catalog',
          permission: 'catalog-entity',
          policies: [
            {
              policy: 'Read',
              effect: 'allow',
            },
            {
              policy: 'Delete',
              effect: 'allow',
            },
            {
              policy: 'Update',
              effect: 'allow',
            },
          ],
        },
      ],
    };
    const result = getPermissionPoliciesData(values);
    expect(result).toEqual([
      {
        entityReference: 'role:default/testRole',
        permission: 'scaffolder-template',
        policy: 'read',
        effect: 'allow',
      },
      {
        entityReference: 'role:default/testRole',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'allow',
      },
      {
        entityReference: 'role:default/testRole',
        permission: 'catalog-entity',
        policy: 'delete',
        effect: 'allow',
      },
      {
        entityReference: 'role:default/testRole',
        permission: 'catalog-entity',
        policy: 'update',
        effect: 'allow',
      },
    ]);
  });
});

describe('getConditionalPermissionPoliciesData', () => {
  it('should return conditional permission policies data correctly', () => {
    const values = mockFormCurrentValues;

    const result = getConditionalPermissionPoliciesData(values);

    expect(result).toEqual([
      {
        result: 'CONDITIONAL',
        roleEntityRef: 'user:default/div',
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        permissionMapping: ['read'],
        conditions: {
          rule: 'HAS_LABEL',
          params: {
            label: 'temp',
          },
          resourceType: 'catalog-entity',
        },
      },
    ]);
  });

  it('should return empty array if permissionPoliciesRows is empty', () => {
    const values = {
      kind: 'user',
      name: 'div',
      namespace: 'default',
      selectedMembers: [],
      selectedPlugins: [],
      permissionPoliciesRows: [],
    };

    const result = getConditionalPermissionPoliciesData(values);

    expect(result).toEqual([]);
  });
});

describe('getUpdatedConditionalPolicies', () => {
  it('should return updated conditional policies correctly', () => {
    const values = {
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
          isResourced: true,
          plugin: 'catalog',
          conditions: {
            allOf: [
              {
                rule: 'HAS_LABEL',
                params: {
                  label: 'temp',
                },
                resourceType: 'catalog-entity',
              },
              {
                rule: 'HAS_SPEC',
                params: {
                  label: 'test',
                },
                resourceType: 'catalog-entity',
              },
            ],
          },
        },
      ],
    };

    const initialValues = mockFormInitialValues;

    const result = getUpdatedConditionalPolicies(values, initialValues);

    expect(result).toEqual([
      {
        id: 1,
        updateCondition: {
          result: 'CONDITIONAL',
          roleEntityRef: 'user:default/div',
          pluginId: 'catalog',
          resourceType: 'catalog-entity',
          permissionMapping: ['read'],
          conditions: {
            allOf: [
              {
                rule: 'HAS_LABEL',
                params: {
                  label: 'temp',
                },
                resourceType: 'catalog-entity',
              },
              {
                rule: 'HAS_SPEC',
                params: {
                  label: 'test',
                },
                resourceType: 'catalog-entity',
              },
            ],
          },
        },
      },
    ]);
  });

  it('should return empty array if values.permissionPoliciesRows is empty', () => {
    const values = {
      kind: 'user',
      name: 'div',
      namespace: 'default',
      selectedMembers: [],
      selectedPlugins: [],
      permissionPoliciesRows: [],
    };

    const initialValues = mockFormInitialValues;

    const result = getUpdatedConditionalPolicies(values, initialValues);

    expect(result).toEqual([]);
  });
});

describe('getNewConditionalPolicies', () => {
  it('should return new conditional policies correctly', () => {
    const values = mockFormCurrentValues;

    const result = getNewConditionalPolicies(values);

    expect(result).toEqual([
      {
        result: 'CONDITIONAL',
        roleEntityRef: 'user:default/div',
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        permissionMapping: ['read'],
        conditions: {
          rule: 'HAS_LABEL',
          params: {
            label: 'temp',
          },
          resourceType: 'catalog-entity',
        },
      },
    ]);
  });

  it('should return empty array if values.permissionPoliciesRows is empty', () => {
    const values = {
      kind: 'user',
      name: 'div',
      namespace: 'default',
      selectedMembers: [],
      selectedPlugins: [],
      permissionPoliciesRows: [],
    };

    const result = getNewConditionalPolicies(values);

    expect(result).toEqual([]);
  });
});

describe('getRemovedConditionalPoliciesIds', () => {
  it('should return removed conditional policies IDs correctly', () => {
    const values = {
      kind: 'user',
      name: 'div',
      namespace: 'default',
      selectedMembers: [],
      selectedPlugins: [],
      permissionPoliciesRows: [],
    };

    const initialValues = mockFormInitialValues;

    const result = getRemovedConditionalPoliciesIds(values, initialValues);

    expect(result).toEqual([1]);
  });

  it('should return empty array if both values.permissionPoliciesRows and initialValues.permissionPoliciesRows are empty', () => {
    const values = {
      kind: 'user',
      name: 'div',
      namespace: 'default',
      selectedMembers: [],
      selectedPlugins: [],
      permissionPoliciesRows: [],
    };

    const initialValues = {
      kind: 'user',
      name: 'div',
      namespace: 'default',
      selectedMembers: [],
      selectedPlugins: [],
      permissionPoliciesRows: [],
    };

    const result = getRemovedConditionalPoliciesIds(values, initialValues);

    expect(result).toEqual([]);
  });
});

describe('getRulesNumber', () => {
  it('should return the correct number of rules', () => {
    const conditions: ConditionsData = {
      allOf: [
        {
          rule: 'HAS_ANNOTATION',
          resourceType: 'catalog-entity',
          params: {
            annotation: 'k',
          },
        },
        {
          allOf: [
            {
              rule: 'HAS_LABEL',
              resourceType: 'catalog-entity',
              params: {
                label: 'h',
              },
            },
          ],
        },
        {
          anyOf: [
            {
              rule: 'HAS_LABEL',
              resourceType: 'catalog-entity',
              params: {
                label: 'h',
              },
            },
            {
              rule: 'HAS_ANNOTATION',
              resourceType: 'catalog-entity',
              params: {
                annotation: 'k',
              },
            },
          ],
        },
      ],
    };

    const result = getRulesNumber(conditions);
    expect(result).toBe(4);
  });

  it('should return 0 when there are no conditions', () => {
    const result = getRulesNumber();
    expect(result).toBe(0);
  });

  it('should count rules correctly with nested anyOf and allOf', () => {
    const conditions: ConditionsData = {
      anyOf: [
        {
          rule: 'HAS_LABEL',
          resourceType: 'catalog-entity',
          params: {
            label: 'x',
          },
        },
        {
          allOf: [
            {
              rule: 'HAS_ANNOTATION',
              resourceType: 'catalog-entity',
              params: {
                annotation: 'y',
              },
            },
            {
              anyOf: [
                {
                  rule: 'HAS_LABEL',
                  resourceType: 'catalog-entity',
                  params: {
                    label: 'z',
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const result = getRulesNumber(conditions);
    expect(result).toBe(3);
  });

  it('should count single condition correctly', () => {
    const conditions: ConditionsData = {
      condition: {
        rule: 'HAS_LABEL',
        resourceType: 'catalog-entity',
        params: {
          label: 'a',
        },
      },
    };

    const result = getRulesNumber(conditions);
    expect(result).toBe(1);
  });

  it('should count rules correctly with not condition', () => {
    const conditions: ConditionsData = {
      not: {
        rule: 'HAS_LABEL',
        resourceType: 'catalog-entity',
        params: {
          label: 'b',
        },
      },
    };

    const result = getRulesNumber(conditions);
    expect(result).toBe(1);
  });
});
