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
import { GroupEntity } from '@backstage/catalog-model';
import {
  AllOfCriteria,
  AuthorizeResult,
  PermissionCondition,
} from '@backstage/plugin-permission-common';

import {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import { mockConditions } from '../__fixtures__/mockConditions';
import { mockPermissionPolicies } from '../__fixtures__/mockPermissionPolicies';
import {
  getConditionalPermissionsData,
  getConditionsData,
  getConditionUpperCriteria,
  getDefaultPermissions,
  getMembers,
  getMembersFromGroup,
  getPermissions,
  getPermissionsArray,
  getPermissionsData,
  getPluginInfo,
  getPoliciesData,
} from './rbac-utils';

const mockPolicies = [
  {
    entityReference: 'role:default/guests',
    permission: 'catalog.entity.read',
    policy: 'read',
    effect: 'deny',
  },
  {
    entityReference: 'role:default/guests',
    permission: 'catalog.entity.create',
    policy: 'use',
    effect: 'deny',
  },
  {
    entityReference: 'user:default/xyz',
    permission: 'policy.entity.read',
    policy: 'read',
    effect: 'allow',
  },
  {
    entityReference: 'user:default/xyz',
    permission: 'policy.entity.create',
    policy: 'create',
    effect: 'allow',
  },
  {
    entityReference: 'user:default/xyz',
    permission: 'policy.entity.delete',
    policy: 'delete',
    effect: 'allow',
  },
  {
    entityReference: 'user:default/xyz',
    permission: 'catalog.entity.read',
    policy: 'read',
    effect: 'allow',
  },
  {
    entityReference: 'user:default/xyz',
    permission: 'catalog.entity.create',
    policy: 'use',
    effect: 'allow',
  },
];

describe('rbac utils', () => {
  it('should list associated allowed permissions for a role', () => {
    expect(getPermissions('role:default/guests', mockPolicies)).toBe(0);
    expect(getPermissions('user:default/xyz', mockPolicies)).toBe(5);
  });

  it('should return number of users and groups in member references', () => {
    expect(getMembers(['user:default/xyz', 'group:default/admins'])).toBe(
      '1 group, 1 user',
    );

    expect(
      getMembers([
        'user:default/xyz',
        'group:default/admins',
        'user:default/alice',
      ]),
    ).toBe('1 group, 2 users');

    expect(getMembers(['user:default/xyz'])).toBe('1 user');

    expect(getMembers(['group:default/xyz'])).toBe('1 group');

    expect(getMembers([])).toBe('No members');
  });

  it('should return number of members in a group', () => {
    let resource: GroupEntity = {
      metadata: {
        namespace: 'default',
        annotations: {},
        name: 'team-b',
        description: 'Team B',
      },
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      spec: {
        type: 'team',
        profile: {},
        parent: 'backstage',
        children: [],
      },
      relations: [
        {
          type: 'childOf',
          targetRef: 'group:default/backstage',
        },
        {
          type: 'hasMember',
          targetRef: 'user:default/amelia.park',
        },
        {
          type: 'hasMember',
          targetRef: 'user:default/colette.brock',
        },
        {
          type: 'hasMember',
          targetRef: 'user:default/jenny.doe',
        },
        {
          type: 'hasMember',
          targetRef: 'user:default/jonathon.page',
        },
        {
          type: 'hasMember',
          targetRef: 'user:default/justine.barrow',
        },
      ],
    };
    expect(getMembersFromGroup(resource)).toBe(5);

    resource = {
      metadata: {
        namespace: 'default',
        annotations: {},
        name: 'team-b',
        description: 'Team B',
      },
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      spec: {
        type: 'team',
        profile: {},
        parent: 'backstage',
        children: [],
      },
      relations: [
        {
          type: 'childOf',
          targetRef: 'group:default/backstage',
        },
      ],
    };

    expect(getMembersFromGroup(resource)).toBe(0);
  });

  it('should return plugin-id of the policy', () => {
    expect(
      getPluginInfo(mockPermissionPolicies, {
        permission: 'catalog.entity.read',
        policy: 'read',
      }).pluginId,
    ).toBe('catalog');
    expect(
      getPluginInfo(mockPermissionPolicies, {
        permission: 'scaffolder.template.read',
        policy: 'read',
      }).pluginId,
    ).toBe('scaffolder');
  });

  it('should return if the permission is resourced', () => {
    expect(
      getPluginInfo(mockPermissionPolicies, {
        permission: 'catalog.entity.read',
        policy: 'read',
      }).isResourced,
    ).toBe(true);
    expect(
      getPluginInfo(mockPermissionPolicies, {
        permission: 'scaffolder.template.read',
        policy: 'read',
      }).isResourced,
    ).toBe(true);
  });

  it('should return the permissions data', () => {
    const data = getPermissionsData(mockPolicies, mockPermissionPolicies);
    expect(data[0]).toEqual({
      permission: 'policy.entity.read',
      plugin: 'permission',
      policies: [
        {
          effect: 'allow',
          policy: 'Read',
        },
      ],
      policyString: ['Read'],
      isResourced: true,
      resourceType: 'policy-entity',
      usingResourceType: false,
    });
  });
});

describe('getConditionUpperCriteria', () => {
  it('should return the upper criteria', () => {
    const conditions = mockConditions[1].conditions;

    const result = getConditionUpperCriteria(conditions);

    expect(result).toEqual('allOf');
  });

  it('should return undefined if no upper criteria is found', () => {
    const conditions = mockConditions[0].conditions;

    const result = getConditionUpperCriteria(conditions);

    expect(result).toBeUndefined();
  });
});

describe('getConditionsData', () => {
  it('should return conditions data correctly for simple condition', () => {
    const conditions = mockConditions[0].conditions;

    const result = getConditionsData(conditions);

    expect(result).toEqual({
      condition: {
        rule: 'HAS_ANNOTATION',
        resourceType: 'catalog-entity',
        params: { annotation: 'temp' },
      },
    });
  });

  it('should return conditions data correctly for any upper criteria', () => {
    const conditions = mockConditions[1].conditions;

    const result = getConditionsData(conditions);

    expect(result).toEqual({
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
    });
  });

  it('should return nested conditions if nested condition exists', () => {
    const conditions = {
      allOf: [mockConditions[1].conditions, mockConditions[0].conditions],
    } as AllOfCriteria<PermissionCondition>;

    const result = getConditionsData(conditions);
    const expectedResult = {
      allOf: [
        {
          allOf: [
            {
              params: { label: 'temp' },
              resourceType: 'catalog-entity',
              rule: 'HAS_LABEL',
            },
            {
              params: { key: 'status' },
              resourceType: 'catalog-entity',
              rule: 'HAS_METADATA',
            },
          ],
        },
        {
          params: { annotation: 'temp' },
          resourceType: 'catalog-entity',
          rule: 'HAS_ANNOTATION',
        },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});

describe('getPoliciesData', () => {
  it('should return policies data correctly', () => {
    const allowedPermissions = ['read', 'update'];
    const policies = ['read', 'update', 'delete'];

    const result = getPoliciesData(allowedPermissions, policies);

    expect(result).toEqual([
      { policy: 'read', effect: 'allow' },
      { policy: 'update', effect: 'allow' },
      { policy: 'delete', effect: 'deny' },
    ]);
  });

  it('should return empty array if no policies provided', () => {
    const allowedPermissions = ['read', 'write'];
    const policies: string[] = [];

    const result = getPoliciesData(allowedPermissions, policies);

    expect(result).toEqual([]);
  });

  it('should return all policies as deny if no allowed permissions provided', () => {
    const allowedPermissions: string[] = [];
    const policies = ['read', 'update', 'delete'];

    const result = getPoliciesData(allowedPermissions, policies);

    expect(result).toEqual([
      { policy: 'read', effect: 'deny' },
      { policy: 'update', effect: 'deny' },
      { policy: 'delete', effect: 'deny' },
    ]);
  });
});

describe('getConditionalPermissionsData', () => {
  it('should return conditional permissions data correctly', () => {
    const conditionalPermissions = [mockConditions[0]];
    const permissionPolicies = {
      plugins: ['catalog'],
      pluginsPermissions: {
        ['catalog']: {
          permissions: ['catalog.entity.read'],
          policies: {
            ['catalog.entity.read']: {
              policies: ['Read'],
              isResourced: true,
              resourceType: 'catalog-entity',
            },
          },
        },
      },
    };

    const result = getConditionalPermissionsData(
      conditionalPermissions,
      permissionPolicies,
      mockPermissionPolicies,
    );

    expect(result).toEqual([
      {
        plugin: 'catalog',
        permission: 'catalog.entity.read',
        isResourced: true,
        resourceType: 'catalog-entity',
        policies: [{ policy: 'Read', effect: 'allow' }],
        policyString: 'Read',
        conditions: {
          condition: {
            rule: 'HAS_ANNOTATION',
            resourceType: 'catalog-entity',
            params: { annotation: 'temp' },
          },
        },
        id: 1,
      },
    ]);
  });

  it('should return empty array if no conditional permissions provided', () => {
    const conditionalPermissions: RoleConditionalPolicyDecision<PermissionAction>[] =
      [];
    const permissionPolicies = {
      plugins: ['catalog'],
      pluginsPermissions: {
        ['catalog']: {
          permissions: ['catalog-entity'],
          policies: {
            ['catalog-entity']: {
              policies: ['read', 'update', 'delete'],
              isResourced: true,
            },
          },
        },
      },
    };

    const result = getConditionalPermissionsData(
      conditionalPermissions,
      permissionPolicies,
      mockPermissionPolicies,
    );

    expect(result).toEqual([]);
  });

  it('should return nested conditional permission with nested upper criteria', () => {
    const conditionalPermissions = [
      {
        id: 1,
        pluginId: 'catalog',
        result: AuthorizeResult.CONDITIONAL,
        resourceType: 'catalog-entity',
        permissionMapping: ['read'],
        conditions: {
          allOf: [mockConditions[1].conditions, mockConditions[0].conditions],
        } as AllOfCriteria<PermissionCondition>,
      },
    ] as RoleConditionalPolicyDecision<PermissionAction>[];

    const permissionPolicies = {
      plugins: ['catalog'],
      pluginsPermissions: {
        ['catalog']: {
          permissions: ['catalog.entity.read'],
          policies: {
            ['catalog.entity.read']: {
              policies: ['read'],
              isResourced: true,
              resourceType: 'catalog-entity',
            },
          },
        },
      },
    };
    const result = getConditionalPermissionsData(
      conditionalPermissions,
      permissionPolicies,
      mockPermissionPolicies,
    );

    const expectedResultConditions = {
      allOf: [
        {
          allOf: [
            {
              params: {
                label: 'temp',
              },
              resourceType: 'catalog-entity',
              rule: 'HAS_LABEL',
            },
            {
              params: {
                key: 'status',
              },
              resourceType: 'catalog-entity',
              rule: 'HAS_METADATA',
            },
          ],
        },
        {
          params: {
            annotation: 'temp',
          },
          resourceType: 'catalog-entity',
          rule: 'HAS_ANNOTATION',
        },
      ],
    };

    expect(result[0].conditions?.allOf).toHaveLength(2);

    const allOfConditions = result[0].conditions?.allOf || [];
    expect(allOfConditions[0]).toHaveProperty('allOf');
    expect(allOfConditions[1]).toHaveProperty('params');
    expect(result[0].conditions).toEqual(expectedResultConditions);
  });
});

describe('getPermissionsArray', () => {
  it('should return empty array if policies is undefined', () => {
    expect(getPermissionsArray('role:default/guests', undefined)).toEqual([]);
  });

  it('should return empty array if policies is empty', () => {
    expect(getPermissionsArray('role:default/guests', [])).toEqual([]);
  });

  it('should return filtered policies for a role', () => {
    const result = getPermissionsArray('user:default/xyz', mockPolicies);
    expect(result.length).toBe(5);
    expect(result[0].permission).toBe('policy.entity.read');
  });

  it('should return default permissions when user has no policies and useDefaultPermissions is true', () => {
    const result = getPermissionsArray(
      'user:default/new-user',
      mockPolicies,
      true,
    );
    expect(result.length).toBe(1);
    expect(result[0].permission).toBe('catalog-entity');
    expect(result[0].policy).toBe('read');
    expect(result[0].effect).toBe('allow');
    expect(result[0].metadata?.source).toBe('default');
  });

  it('should not return default permissions when useDefaultPermissions is false', () => {
    const result = getPermissionsArray(
      'user:default/new-user',
      mockPolicies,
      false,
    );
    expect(result.length).toBe(0);
  });
});

describe('getDefaultPermissions', () => {
  it('should return default catalog read permission for the provided role', () => {
    const role = 'user:default/test-user';
    const result = getDefaultPermissions(role);

    expect(result.length).toBe(1);
    expect(result[0]).toEqual({
      entityReference: role,
      permission: 'catalog-entity',
      policy: 'read',
      effect: 'allow',
      metadata: {
        source: 'default',
      },
    });
  });
});

describe('getPermissions', () => {
  it('should return the count of permissions with default fallback', () => {
    expect(
      getPermissions('user:default/not-existing', mockPolicies, true),
    ).toBe(1);
    expect(
      getPermissions('user:default/not-existing', mockPolicies, false),
    ).toBe(0);
    expect(getPermissions('user:default/xyz', mockPolicies, true)).toBe(5);
  });
});
