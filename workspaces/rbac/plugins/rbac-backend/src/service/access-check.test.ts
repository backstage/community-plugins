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
import { mockServices } from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import type { JsonObject } from '@backstage/types';

import type {
  PluginPermissionMetaData,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import { ConditionalStorage } from '../database/conditional-storage';
import { AccessCheckService } from './access-check';
import { EnforcerDelegate } from './enforcer-delegate';

const user = 'user:default/tom';

const pluginPolicies: PluginPermissionMetaData[] = [
  {
    pluginId: 'catalog',
    policies: [
      {
        name: 'catalog.entity.read',
        resourceType: 'catalog-entity',
        policy: 'read',
      },
      {
        name: 'catalog.entity.delete',
        resourceType: 'catalog-entity',
        policy: 'delete',
      },
    ],
  },
  {
    pluginId: 'scaffolder',
    policies: [{ name: 'scaffolder.action.execute', policy: 'use' }],
  },
  {
    // an invalid action string falls back to 'use', like the metadata mapper
    pluginId: 'custom',
    policies: [{ name: 'custom.thing.do', policy: 'not-an-action' }],
  },
];

const deleteCondition: RoleConditionalPolicyDecision = {
  id: 1,
  result: AuthorizeResult.CONDITIONAL,
  pluginId: 'catalog',
  resourceType: 'catalog-entity',
  roleEntityRef: 'role:default/qa',
  permissionMapping: [{ name: 'catalog.entity.delete', action: 'delete' }],
  conditions: {
    rule: 'IS_ENTITY_OWNER',
    resourceType: 'catalog-entity',
    params: {},
  },
};

const mockEnforcer = (options: {
  roles?: string[];
  rowsByRole?: Record<string, string[][]>;
  allRows?: string[][];
  membersByRole?: Record<string, string[]>;
  linkedGroups?: string[];
}): EnforcerDelegate => {
  const {
    roles = [],
    rowsByRole = {},
    allRows = [],
    membersByRole = {},
    linkedGroups = [],
  } = options;
  return {
    getRolesForUser: jest.fn().mockResolvedValue(roles),
    getFilteredPolicy: jest
      .fn()
      .mockImplementation(async (_index: number, role: string) => {
        return rowsByRole[role] ?? [];
      }),
    getFilteredGroupingPolicy: jest
      .fn()
      .mockImplementation(async (_index: number, role: string) => {
        return (membersByRole[role] ?? []).map(member => [member, role]);
      }),
    getPolicy: jest.fn().mockResolvedValue(allRows),
    isUserLinkedTo: jest
      .fn()
      .mockImplementation(async (userRef: string, member: string) => {
        return member === userRef || linkedGroups.includes(member);
      }),
  } as unknown as EnforcerDelegate;
};

const mockConditionalStorage = (
  conditions: RoleConditionalPolicyDecision[] = [],
): ConditionalStorage => {
  return {
    filterConditions: jest.fn().mockResolvedValue(conditions),
  } as unknown as ConditionalStorage;
};

const serviceWith = (options: {
  enforcer: EnforcerDelegate;
  conditions?: RoleConditionalPolicyDecision[];
  rbacConfig?: JsonObject;
}) => {
  const conditionalStorage = mockConditionalStorage(options.conditions);
  const config = mockServices.rootConfig({
    data: { permission: { rbac: options.rbacConfig ?? {} } },
  });
  return {
    service: new AccessCheckService(
      options.enforcer,
      conditionalStorage,
      config,
    ),
    conditionalStorage,
  };
};

describe('AccessCheckService', () => {
  it('resolves the memberships and explains allow, deny and conditional decisions', async () => {
    const enforcer = mockEnforcer({
      // the role manager appends the configured default role unconditionally,
      // so a role can come back twice; the response must not repeat it
      roles: ['role:default/dev', 'role:default/qa', 'role:default/dev'],
      rowsByRole: {
        'role:default/dev': [
          ['role:default/dev', 'catalog-entity', 'read', 'allow'],
          ['role:default/dev', 'scaffolder.action.execute', 'use', 'allow'],
        ],
        'role:default/qa': [
          ['role:default/qa', 'catalog-entity', 'read', 'deny'],
        ],
      },
      membersByRole: {
        'role:default/dev': [user, 'user:default/jane'],
        'role:default/qa': ['group:default/team-a'],
      },
      linkedGroups: ['group:default/team-a'],
    });
    const { service, conditionalStorage } = serviceWith({
      enforcer,
      conditions: [
        deleteCondition,
        // neither of these may match catalog.entity.delete: wrong resource
        // type, and a permission name that differs from the checked one
        { ...deleteCondition, id: 2, resourceType: 'scaffolder-template' },
        {
          ...deleteCondition,
          id: 3,
          permissionMapping: [
            { name: 'catalog.entity.other', action: 'delete' },
          ],
        },
      ],
    });

    const result = await service.checkAccess(user, pluginPolicies);

    expect(result.userEntityRef).toBe(user);
    expect(result.isSuperUser).toBe(false);
    // jane is a member of the dev role but does not connect tom to it
    expect(result.roles).toEqual([
      { roleEntityRef: 'role:default/dev', via: [user] },
      { roleEntityRef: 'role:default/qa', via: ['group:default/team-a'] },
    ]);
    expect(conditionalStorage.filterConditions).toHaveBeenCalledWith([
      'role:default/dev',
      'role:default/qa',
    ]);
    // the policy and membership lookups filter by the right columns
    expect(enforcer.getFilteredPolicy).toHaveBeenCalledWith(
      0,
      'role:default/dev',
    );
    expect(enforcer.getFilteredGroupingPolicy).toHaveBeenCalledWith(
      1,
      'role:default/qa',
    );

    expect(result.decisions).toEqual([
      {
        pluginId: 'catalog',
        permission: 'catalog.entity.read',
        resourceType: 'catalog-entity',
        action: 'read',
        result: AuthorizeResult.DENY,
        allowedBy: ['role:default/dev'],
        deniedBy: ['role:default/qa'],
        conditionalBy: [],
      },
      {
        pluginId: 'catalog',
        permission: 'catalog.entity.delete',
        resourceType: 'catalog-entity',
        action: 'delete',
        result: AuthorizeResult.CONDITIONAL,
        allowedBy: [],
        deniedBy: [],
        conditionalBy: [deleteCondition],
      },
      {
        pluginId: 'scaffolder',
        permission: 'scaffolder.action.execute',
        action: 'use',
        result: AuthorizeResult.ALLOW,
        allowedBy: ['role:default/dev'],
        deniedBy: [],
        conditionalBy: [],
      },
      {
        pluginId: 'custom',
        permission: 'custom.thing.do',
        action: 'use',
        result: AuthorizeResult.DENY,
        allowedBy: [],
        deniedBy: [],
        conditionalBy: [],
      },
    ]);
  });

  it('lets a policy on the permission name win over a resource-type deny, like the enforcer does', async () => {
    const enforcer = mockEnforcer({
      roles: ['role:default/a', 'role:default/b'],
      rowsByRole: {
        'role:default/a': [
          ['role:default/a', 'catalog.entity.read', 'read', 'allow'],
        ],
        'role:default/b': [
          ['role:default/b', 'catalog-entity', 'read', 'deny'],
        ],
      },
    });
    const { service } = serviceWith({ enforcer });

    const result = await service.checkAccess(user, pluginPolicies);

    expect(result.decisions[0]).toMatchObject({
      permission: 'catalog.entity.read',
      result: AuthorizeResult.ALLOW,
      allowedBy: ['role:default/a'],
      deniedBy: [],
    });
  });

  it('prefers the permission policy over the condition under basic precedence', async () => {
    const enforcer = mockEnforcer({
      roles: ['role:default/qa'],
      rowsByRole: {
        'role:default/qa': [
          ['role:default/qa', 'catalog-entity', 'delete', 'allow'],
        ],
      },
    });
    const { service } = serviceWith({
      enforcer,
      conditions: [deleteCondition],
      rbacConfig: { policyDecisionPrecedence: 'basic' },
    });

    const result = await service.checkAccess(user, pluginPolicies);

    // the role has a basic delete policy, so the condition is not consulted
    expect(result.decisions[1]).toMatchObject({
      permission: 'catalog.entity.delete',
      result: AuthorizeResult.ALLOW,
      allowedBy: ['role:default/qa'],
      conditionalBy: [],
    });
    // read has neither a policy nor a condition
    expect(result.decisions[0]).toMatchObject({
      permission: 'catalog.entity.read',
      result: AuthorizeResult.DENY,
      allowedBy: [],
      deniedBy: [],
    });

    // with no role policy at all, the condition is still the answer
    const bare = serviceWith({
      enforcer: mockEnforcer({ roles: ['role:default/qa'] }),
      conditions: [deleteCondition],
      rbacConfig: { policyDecisionPrecedence: 'basic' },
    });
    const bareResult = await bare.service.checkAccess(user, pluginPolicies);
    expect(bareResult.decisions[1]).toMatchObject({
      permission: 'catalog.entity.delete',
      result: AuthorizeResult.CONDITIONAL,
      conditionalBy: [deleteCondition],
    });
  });

  it('falls back to policies assigned directly to the user or their groups when there are no roles', async () => {
    const enforcer = mockEnforcer({
      roles: [],
      allRows: [
        [user, 'catalog-entity', 'read', 'allow'],
        ['group:default/team-a', 'catalog-entity', 'delete', 'allow'],
        ['user:default/jane', 'scaffolder.action.execute', 'use', 'allow'],
      ],
      linkedGroups: ['group:default/team-a'],
    });
    const { service, conditionalStorage } = serviceWith({ enforcer });

    const result = await service.checkAccess(user, pluginPolicies);

    expect(result.roles).toEqual([]);
    expect(conditionalStorage.filterConditions).not.toHaveBeenCalled();
    expect(result.decisions).toMatchObject([
      {
        permission: 'catalog.entity.read',
        result: AuthorizeResult.ALLOW,
        allowedBy: [user],
      },
      {
        permission: 'catalog.entity.delete',
        result: AuthorizeResult.ALLOW,
        allowedBy: ['group:default/team-a'],
      },
      // jane's policy does not apply to tom
      {
        permission: 'scaffolder.action.execute',
        result: AuthorizeResult.DENY,
        allowedBy: [],
      },
      {
        permission: 'custom.thing.do',
        action: 'use',
        result: AuthorizeResult.DENY,
      },
    ]);
  });

  it('mirrors the legacy policy-entity workaround for policy.entity.create', async () => {
    const permissionPlugin = [
      {
        pluginId: 'permission',
        // declared basic, like the real permission metadata
        policies: [{ name: 'policy.entity.create', policy: 'create' }],
      },
    ];

    // a legacy row on the old resource type still allows the permission
    const legacy = serviceWith({
      enforcer: mockEnforcer({
        roles: ['role:default/admin'],
        rowsByRole: {
          'role:default/admin': [
            ['role:default/admin', 'policy-entity', 'create', 'allow'],
          ],
        },
      }),
    });
    const legacyResult = await legacy.service.checkAccess(
      user,
      permissionPlugin,
    );
    expect(legacyResult.decisions[0]).toEqual({
      pluginId: 'permission',
      permission: 'policy.entity.create',
      resourceType: 'policy-entity',
      action: 'create',
      result: AuthorizeResult.ALLOW,
      allowedBy: ['role:default/admin'],
      deniedBy: [],
      conditionalBy: [],
    });

    // the workaround also holds under basic precedence
    const legacyBasic = serviceWith({
      enforcer: mockEnforcer({
        roles: ['role:default/admin'],
        rowsByRole: {
          'role:default/admin': [
            ['role:default/admin', 'policy-entity', 'create', 'allow'],
          ],
        },
      }),
      rbacConfig: { policyDecisionPrecedence: 'basic' },
    });
    const legacyBasicResult = await legacyBasic.service.checkAccess(
      user,
      permissionPlugin,
    );
    expect(legacyBasicResult.decisions[0]).toMatchObject({
      permission: 'policy.entity.create',
      resourceType: 'policy-entity',
      result: AuthorizeResult.ALLOW,
      allowedBy: ['role:default/admin'],
    });

    // a policy on the permission name wins and stays a basic permission
    const named = serviceWith({
      enforcer: mockEnforcer({
        roles: ['role:default/admin'],
        rowsByRole: {
          'role:default/admin': [
            ['role:default/admin', 'policy.entity.create', 'create', 'allow'],
          ],
        },
      }),
    });
    const namedResult = await named.service.checkAccess(user, permissionPlugin);
    expect(namedResult.decisions[0]).toMatchObject({
      permission: 'policy.entity.create',
      result: AuthorizeResult.ALLOW,
      allowedBy: ['role:default/admin'],
    });
    expect(namedResult.decisions[0].resourceType).toBeUndefined();
  });

  it('answers deny when one role holds colliding conditions, like the policy does', async () => {
    const collidingCondition = {
      ...deleteCondition,
      id: 4,
      conditions: {
        rule: 'HAS_LABEL',
        resourceType: 'catalog-entity',
        params: { label: 'temp' },
      },
    };
    const { service } = serviceWith({
      enforcer: mockEnforcer({ roles: ['role:default/qa'] }),
      conditions: [deleteCondition, collidingCondition],
    });

    const result = await service.checkAccess(user, pluginPolicies);

    expect(result.decisions[1]).toMatchObject({
      permission: 'catalog.entity.delete',
      result: AuthorizeResult.DENY,
      conditionalBy: [deleteCondition, collidingCondition],
    });
  });

  it('marks every permission allowed for a configured super user', async () => {
    const enforcer = mockEnforcer({
      roles: ['role:default/dev'],
      membersByRole: { 'role:default/dev': [user] },
    });
    const { service } = serviceWith({
      enforcer,
      rbacConfig: { admin: { superUsers: [{ name: user }] } },
    });

    const result = await service.checkAccess(user, pluginPolicies);

    expect(result.isSuperUser).toBe(true);
    // the memberships are still explained for a super user
    expect(result.roles).toEqual([
      { roleEntityRef: 'role:default/dev', via: [user] },
    ]);
    expect(result.decisions).toHaveLength(4);
    for (const decision of result.decisions) {
      expect(decision).toMatchObject({
        result: AuthorizeResult.ALLOW,
        allowedBy: [],
        deniedBy: [],
        conditionalBy: [],
      });
    }
  });
});
