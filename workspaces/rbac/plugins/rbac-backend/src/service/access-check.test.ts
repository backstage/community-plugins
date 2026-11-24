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
      roles: ['role:default/dev', 'role:default/qa'],
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
      conditions: [deleteCondition],
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
    ]);
  });

  it('marks every permission allowed for a configured super user', async () => {
    const enforcer = mockEnforcer({ roles: [] });
    const { service } = serviceWith({
      enforcer,
      rbacConfig: { admin: { superUsers: [{ name: user }] } },
    });

    const result = await service.checkAccess(user, pluginPolicies);

    expect(result.isSuperUser).toBe(true);
    expect(result.decisions).toHaveLength(3);
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
