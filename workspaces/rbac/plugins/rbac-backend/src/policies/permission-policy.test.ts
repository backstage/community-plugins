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
import type { LoggerService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { Config } from '@backstage/config';
import {
  AuthorizeResult,
  createPermission,
} from '@backstage/plugin-permission-common';
import type {
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';

import {
  Adapter,
  Enforcer,
  Model,
  newEnforcer,
  newModelFromString,
} from 'casbin';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';

import type { RoleMetadata } from '@backstage-community/plugin-rbac-common';

import { resolve } from 'path';

import { ADMIN_ROLE_NAME } from '../admin-permissions/admin-creation';
import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import { ConditionalStorage } from '../database/conditional-storage';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import { PluginPermissionMetadataCollector } from '../service/plugin-endpoints';
import { RBACPermissionPolicy } from './permission-policy';
import { catalogMock, mockAuditorService } from '../../__fixtures__/mock-utils';
import {
  clearAuditorMock,
  expectAuditorLogForPermission,
} from '../../__fixtures__/auditor-test-utils';

type PermissionAction = 'create' | 'read' | 'update' | 'delete';

const conditionalStorageMock: ConditionalStorage = {
  filterConditions: jest.fn().mockImplementation(() => []),
  createCondition: jest.fn().mockImplementation(),
  checkConflictedConditions: jest.fn().mockImplementation(),
  getCondition: jest.fn().mockImplementation(),
  deleteCondition: jest.fn().mockImplementation(),
  updateCondition: jest.fn().mockImplementation(),
};

const roleMetadataStorageMock: RoleMetadataStorage = {
  filterRoleMetadata: jest.fn().mockImplementation(() => []),
  findRoleMetadata: jest
    .fn()
    .mockImplementation(
      async (
        _roleEntityRef: string,
        _trx: Knex.Knex.Transaction,
      ): Promise<RoleMetadata> => {
        return { source: 'csv-file' };
      },
    ),
  filterForOwnerRoleMetadata: jest.fn().mockImplementation(),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
};

const csvPermFile = resolve(
  __dirname,
  '../../__fixtures__/data/valid-csv/rbac-policy.csv',
);

const mockClientKnex = Knex.knex({ client: MockClient });

const mockAuthService = mockServices.auth();

const pluginMetadataCollectorMock: Partial<PluginPermissionMetadataCollector> =
  {
    getPluginConditionRules: jest.fn().mockImplementation(),
    getPluginPolicies: jest.fn().mockImplementation(),
    getMetadataByPluginId: jest.fn().mockImplementation(),
  };

const modifiedBy = 'user:default/some-admin';

describe('RBACPermissionPolicy Tests', () => {
  beforeEach(() => {
    roleMetadataStorageMock.updateRoleMetadata = jest.fn().mockImplementation();
    jest.clearAllMocks();
  });

  it('should build', async () => {
    const config = newConfig();
    const adapter = await newAdapter(config);
    const enfDelegate = await newEnforcerDelegate(adapter, config);

    const policy = await newPermissionPolicy(config, enfDelegate);

    expect(policy).not.toBeNull();
  });

  it('should fail to build when creating admin role', async () => {
    roleMetadataStorageMock.updateRoleMetadata = jest
      .fn()
      .mockImplementation(async (): Promise<void> => {
        throw new Error(`Failed to create`);
      });

    const config = newConfig();
    const adapter = await newAdapter(config);
    const enfDelegate = await newEnforcerDelegate(adapter, config);
    await enfDelegate.addPolicy([
      'user:default/known_user',
      'test-resource',
      'update',
      'allow',
    ]);

    await expect(newPermissionPolicy(config, enfDelegate)).rejects.toThrow(
      'Failed to create',
    );
  });

  describe('Policy checks from csv file', () => {
    let enfDelegate: EnforcerDelegate;
    let policy: RBACPermissionPolicy;

    beforeEach(async () => {
      const config = newConfig();
      const adapter = await newAdapter(config);
      enfDelegate = await newEnforcerDelegate(adapter, config);
      policy = await newPermissionPolicy(config, enfDelegate);
    });

    // case1
    it('should allow read access to resource permission for user from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'catalog.entity.read',
          'catalog-entity',
          'read',
        ),
        newPolicyQueryUser('user:default/guest'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/guest',
        'catalog.entity.read',
        'catalog-entity',
        'read',
        AuthorizeResult.ALLOW,
      );
    });

    // case2
    it('should allow create access to resource permission for user from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('catalog.entity.create'),
        newPolicyQueryUser('user:default/guest'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/guest',
        'catalog.entity.create',
        undefined,
        'use',
        AuthorizeResult.ALLOW,
      );
    });

    // case3
    it('should allow deny access to resource permission for user:default/known_user', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource.deny'),
        newPolicyQueryUser('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/known_user',
        'test.resource.deny',
        undefined,
        'use',
        AuthorizeResult.ALLOW,
      );
    });

    // case1 with role
    it('should allow update access to resource permission for user from csv file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'catalog.entity.read',
          'catalog-entity',
          'update',
        ),
        newPolicyQueryUser('user:default/guest'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/guest',
        'catalog.entity.read',
        'catalog-entity',
        'update',
        AuthorizeResult.ALLOW,
      );
    });
  });

  describe('Policy checks for clean up old policies for csv file', () => {
    let config: Config;
    let adapter: Adapter;
    let enforcerDelegate: EnforcerDelegate;
    let rbacPolicy: RBACPermissionPolicy;
    const allEnfRoles = [
      'role:default/some-role',
      'role:default/rbac_admin',
      'role:default/catalog-writer',
      'role:default/legacy',
      'role:default/catalog-reader',
      'role:default/catalog-deleter',
      'role:default/known_role',
      'role:default/CATALOG-USER',
    ];

    const allEnfGroupPolicies = [
      ['user:default/tester', 'role:default/some-role'],
      ['user:default/guest', 'role:default/rbac_admin'],
      ['group:default/guests', 'role:default/rbac_admin'],
      ['user:default/guest', 'role:default/catalog-writer'],
      ['user:default/guest', 'role:default/legacy'],
      ['user:default/guest', 'role:default/catalog-reader'],
      ['user:default/guest', 'role:default/catalog-deleter'],
      ['user:default/known_user', 'role:default/known_role'],
      ['user:default/tom', 'role:default/CATALOG-USER'],
      ['group:default/reader-group', 'role:default/CATALOG-USER'],
    ];

    const allEnfPolicies = [
      // stored policy
      ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      // policies from csv file
      ['role:default/catalog-writer', 'catalog-entity', 'update', 'allow'],
      ['role:default/legacy', 'catalog-entity', 'update', 'allow'],
      ['role:default/catalog-writer', 'catalog-entity', 'read', 'allow'],
      ['role:default/catalog-writer', 'catalog.entity.create', 'use', 'allow'],
      ['role:default/catalog-deleter', 'catalog-entity', 'delete', 'deny'],
      ['role:default/CATALOG-USER', 'catalog-entity', 'read', 'allow'],
      ['role:default/known_role', 'test.resource.deny', 'use', 'allow'],
    ];

    beforeEach(async () => {
      (roleMetadataStorageMock.removeRoleMetadata as jest.Mock).mockReset();

      config = newConfig();
      adapter = await newAdapter(config);
    });

    it('should cleanup old group policies and metadata after re-attach policy file', async () => {
      roleMetadataStorageMock.filterRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          const roleMetadataDao: RoleMetadataDao = {
            roleEntityRef: 'role:default/old-role',
            source: 'csv-file',
            modifiedBy: 'user:default/tom',
          };
          return [roleMetadataDao];
        });

      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (
            roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadata> => {
            if (roleEntityRef.includes('rbac_admin')) {
              return { source: 'configuration' };
            }
            if (roleEntityRef.includes('some-role')) {
              return { source: 'rest' };
            }
            return { source: 'csv-file' };
          },
        );

      const storedGroupPolicies = [
        // should be removed
        ['user:default/user-old-1', 'role:default/old-role'],
        ['group:default/team-a-old-1', 'role:default/old-role'],

        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        config,
        storedPolicies,
        storedGroupPolicies,
      );

      await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (policy: string[]) => policy[0] !== 'role:default/rbac_admin',
      );

      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // role metadata should be removed
      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/old-role',
        expect.anything(),
      );
    });

    it('should cleanup old policies and metadata after re-attach policy file', async () => {
      const storedGroupPolicies = [
        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should be removed
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],

        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        config,
        storedPolicies,
        storedGroupPolicies,
      );

      rbacPolicy = await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (p: string[]) => {
          return p[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // role metadata should not be removed
      expect(
        roleMetadataStorageMock.removeRoleMetadata,
      ).not.toHaveBeenCalledWith('role:default/old-role', expect.anything());

      const decision = await rbacPolicy.handle(
        newPolicyQueryWithBasicPermission('test.some.resource'),
        newPolicyQueryUser('user:default/user-old-1'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
      expectAuditorLogForPermission(
        'user:default/user-old-1',
        'test.some.resource',
        undefined,
        'use',
        AuthorizeResult.DENY,
      );
    });

    it('should cleanup old policies and group policies and metadata after re-attach policy file', async () => {
      const storedGroupPolicies = [
        // should be removed
        ['user:default/user-old-1', 'role:default/old-role'],
        ['user:default/user-old-2', 'role:default/old-role'],
        ['group:default/team-a-old-1', 'role:default/old-role'],
        ['group:default/team-a-old-2', 'role:default/old-role'],

        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should be removed
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],

        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        config,
        storedPolicies,
        storedGroupPolicies,
      );

      await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (policy: string[]) => {
          return policy[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // role metadata should be removed
      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/old-role',
        expect.anything(),
      );
    });

    it('should cleanup old group policies and metadata after detach policy file', async () => {
      const storedGroupPolicies = [
        // should be removed
        ['user:default/user-old-1', 'role:default/old-role'],
        ['group:default/team-a-old-1', 'role:default/old-role'],

        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        config,
        storedPolicies,
        storedGroupPolicies,
      );

      await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (policy: string[]) => {
          return policy[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // role metadata should be removed
      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/old-role',
        expect.anything(),
      );
    });

    it('should cleanup old policies after detach policy file', async () => {
      const storedGroupPolicies = [
        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should be removed
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],

        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        config,
        storedPolicies,
        storedGroupPolicies,
      );

      await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (policy: string[]) => {
          return policy[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);
    });

    it('should cleanup old policies and group policies and metadata after detach policy file', async () => {
      const storedGroupPolicies = [
        // should be removed
        ['user:default/user-old-1', 'role:default/old-role'],
        ['user:default/user-old-2', 'role:default/old-role'],
        ['group:default/team-a-old-1', 'role:default/old-role'],
        ['group:default/team-a-old-2', 'role:default/old-role'],

        // should not be removed:
        ['user:default/tester', 'role:default/some-role'],
      ];
      const storedPolicies = [
        // should be removed
        ['role:default/old-role', 'test.some.resource', 'use', 'allow'],

        // should not be removed
        ['role:default/some-role', 'test.some.resource', 'use', 'allow'],
      ];

      enforcerDelegate = await newEnforcerDelegate(
        adapter,
        config,
        storedPolicies,
        storedGroupPolicies,
      );

      await newPermissionPolicy(config, enforcerDelegate);

      expect(await enforcerDelegate.getAllRoles()).toEqual(allEnfRoles);

      expect(await enforcerDelegate.getGroupingPolicy()).toEqual(
        allEnfGroupPolicies,
      );

      const nonAdminPolicies = (await enforcerDelegate.getPolicy()).filter(
        (policy: string[]) => {
          return policy[0] !== 'role:default/rbac_admin';
        },
      );
      expect(nonAdminPolicies).toEqual(allEnfPolicies);

      // role metadata should be removed
      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/old-role',
        expect.anything(),
      );
    });
  });

  describe('Policy checks for users', () => {
    let policy: RBACPermissionPolicy;
    let enfDelegate: EnforcerDelegate;

    const roleMetadataStorageTest: RoleMetadataStorage = {
      filterRoleMetadata: jest.fn().mockImplementation(() => []),
      findRoleMetadata: jest
        .fn()
        .mockImplementation(
          async (
            roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadata> => {
            if (roleEntityRef.includes('rbac_admin')) {
              return { source: 'configuration' };
            }
            return { source: 'csv-file' };
          },
        ),
      filterForOwnerRoleMetadata: jest.fn().mockImplementation(),
      createRoleMetadata: jest.fn().mockImplementation(),
      updateRoleMetadata: jest.fn().mockImplementation(),
      removeRoleMetadata: jest.fn().mockImplementation(),
    };

    beforeEach(async () => {
      const basicAndResourcePermissions = resolve(
        __dirname,
        '../../__fixtures__/data/valid-csv/basic-and-resource-policies.csv',
      );
      const config = newConfig(basicAndResourcePermissions);
      const adapter = await newAdapter(config);
      enfDelegate = await newEnforcerDelegate(adapter, config);

      policy = await newPermissionPolicy(
        config,
        enfDelegate,
        roleMetadataStorageTest,
      );
    });
    // +-------+------+------------------------------------+
    // | allow | deny |         result                 |   |
    // +-------+------+--------------------------------+---|
    // | N     | Y    | deny                           | 1 |
    // | N     | N    | deny (user not listed)         | 2 |
    // | Y     | Y    | deny (user:default/duplicated) | 3 |
    // | Y     | N    | allow                          | 4 |

    // Tests for Resource basic type permission

    // case1
    it('should deny access to basic permission for listed user with deny action', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource.deny'),
        newPolicyQueryUser('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
      expectAuditorLogForPermission(
        'user:default/known_user',
        'test.resource.deny',
        undefined,
        'use',
        AuthorizeResult.DENY,
      );
    });
    // case2
    it('should deny access to basic permission for unlisted user', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newPolicyQueryUser('unuser:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
      expectAuditorLogForPermission(
        'unuser:default/known_user',
        'test.resource',
        undefined,
        'use',
        AuthorizeResult.DENY,
      );
    });
    // case3
    it('should deny access to basic permission for listed user deny and allow', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newPolicyQueryUser('user:default/duplicated'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
      expectAuditorLogForPermission(
        'user:default/duplicated',
        'test.resource',
        undefined,
        'use',
        AuthorizeResult.DENY,
      );
    });
    // case4
    it('should allow access to basic permission for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newPolicyQueryUser('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/known_user',
        'test.resource',
        undefined,
        'use',
        AuthorizeResult.ALLOW,
      );
    });
    // case5
    it('should deny access to undefined user', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('test.resource'),
        newPolicyQueryUser(),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
      expectAuditorLogForPermission(
        undefined,
        'test.resource',
        undefined,
        'use',
        AuthorizeResult.DENY,
      );
    });

    // Tests for Resource Permission type

    // case1
    it('should deny access to resource permission for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.deny',
          'test-resource-deny',
          'update',
        ),
        newPolicyQueryUser('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
      expectAuditorLogForPermission(
        'user:default/known_user',
        'test.resource.deny',
        'test-resource-deny',
        'update',
        AuthorizeResult.DENY,
      );
    });
    // case 2
    it('should deny access to resource permission for user unlisted on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'update',
        ),
        newPolicyQueryUser('unuser:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
      expectAuditorLogForPermission(
        'unuser:default/known_user',
        'test.resource.update',
        'test-resource',
        'update',
        AuthorizeResult.DENY,
      );
    });
    // case 3
    it('should deny access to resource permission for user listed deny and allow', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'update',
        ),
        newPolicyQueryUser('user:default/duplicated'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
      expectAuditorLogForPermission(
        'user:default/duplicated',
        'test.resource.update',
        'test-resource',
        'update',
        AuthorizeResult.DENY,
      );
    });
    // case 4
    it('should allow access to resource permission for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'update',
        ),
        newPolicyQueryUser('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/known_user',
        'test.resource.update',
        'test-resource',
        'update',
        AuthorizeResult.ALLOW,
      );
    });
    // case 5
    // TODO: Temporary workaround to prevent breakages after the removal of the resource type `policy-entity` from the permission `policy.entity.create`
    it('should allow access to basic permission policy.entity.create even though it is defined as `policy-entity, create` for user listed on policy', async () => {
      await enfDelegate.addPolicy([
        'user:default/known_user',
        'policy-entity',
        'create',
        'allow',
      ]);

      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('policy.entity.create', 'create'),
        newPolicyQueryUser('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/known_user',
        'policy.entity.create',
        undefined,
        'create',
        AuthorizeResult.ALLOW,
      );
    });
    // case 6
    // TODO: Temporary workaround to prevent breakages after the removal of the resource type `policy-entity` from the permission `policy.entity.create`
    it('should allow access to basic permission policy.entity.create even though it is defined as `policy-entity, create` for role', async () => {
      await enfDelegate.addGroupingPolicy(
        ['user:default/known_user', 'role:default/known_user'],
        {
          source: 'csv-file',
          roleEntityRef: 'role:default/known_user',
          modifiedBy,
        },
      );
      await enfDelegate.addPolicy([
        'role:default/known_user',
        'policy-entity',
        'create',
        'allow',
      ]);

      const decision = await policy.handle(
        newPolicyQueryWithBasicPermission('policy.entity.create', 'create'),
        newPolicyQueryUser('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/known_user',
        'policy.entity.create',
        undefined,
        'create',
        AuthorizeResult.ALLOW,
      );
    });

    // Tests for actions on resource permissions
    it('should deny access to resource permission for unlisted action for user listed on policy', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'test.resource.update',
          'test-resource',
          'delete',
        ),
        newPolicyQueryUser('user:default/known_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.DENY);
    });

    // Tests for admin added through app config
    it('should allow access to permission resources for admin added through app config', async () => {
      const adminPerm: {
        name: string;
        resource: string;
        action: PermissionAction;
      }[] = [
        {
          name: 'policy.entity.read',
          resource: 'policy-entity',
          action: 'read',
        },
        {
          name: 'policy.entity.create',
          resource: 'policy-entity',
          action: 'create',
        },
        {
          name: 'policy.entity.update',
          resource: 'policy-entity',
          action: 'update',
        },
        {
          name: 'policy.entity.delete',
          resource: 'policy-entity',
          action: 'delete',
        },
        {
          name: 'catalog.entity.read',
          resource: 'catalog-entity',
          action: 'read',
        },
      ];
      for (const perm of adminPerm) {
        const decision = await policy.handle(
          newPolicyQueryWithResourcePermission(
            perm.name,
            perm.resource,
            perm.action,
          ),
          newPolicyQueryUser('user:default/guest'),
        );
        expect(decision.result).toBe(AuthorizeResult.ALLOW);
        expectAuditorLogForPermission(
          'user:default/guest',
          perm.name,
          perm.resource,
          perm.action,
          AuthorizeResult.ALLOW,
        );
        clearAuditorMock();
      }
    });
  });

  describe('Policy checks from config file', () => {
    let policy: RBACPermissionPolicy;
    let enfDelegate: EnforcerDelegate;
    const roleMetadataStorageTest: RoleMetadataStorage = {
      filterRoleMetadata: jest.fn().mockImplementation(() => []),
      findRoleMetadata: jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadataDao> => {
            return {
              roleEntityRef: 'role:default/catalog-writer',
              source: 'legacy',
              modifiedBy,
            };
          },
        ),
      filterForOwnerRoleMetadata: jest.fn().mockImplementation(),
      createRoleMetadata: jest.fn().mockImplementation(),
      updateRoleMetadata: jest.fn().mockImplementation(),
      removeRoleMetadata: jest.fn().mockImplementation(),
    };

    const adminRole = 'role:default/rbac_admin';
    const groupPolicy = [
      ['user:default/test_admin', 'role:default/rbac_admin'],
    ];
    const permissions = [
      ['role:default/rbac_admin', 'policy-entity', 'read', 'allow'],
      ['role:default/rbac_admin', 'policy.entity.create', 'create', 'allow'],
      ['role:default/rbac_admin', 'policy-entity', 'delete', 'allow'],
      ['role:default/rbac_admin', 'policy-entity', 'update', 'allow'],
      ['role:default/rbac_admin', 'catalog-entity', 'read', 'allow'],
    ];
    const oldGroupPolicy = [
      'user:default/old_admin',
      'role:default/rbac_admin',
    ];
    const admins = new Array<{ name: string }>();
    admins.push({ name: 'user:default/test_admin' });
    const superUser = new Array<{ name: string }>();
    superUser.push({ name: 'user:default/super_user' });

    beforeEach(async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadataDao> => {
            return {
              roleEntityRef: 'role:default/catalog-writer',
              source: 'legacy',
              modifiedBy,
            };
          },
        );

      const config = newConfig(csvPermFile, admins, superUser);
      const adapter = await newAdapter(config);

      enfDelegate = await newEnforcerDelegate(adapter, config);

      await enfDelegate.addGroupingPolicy(oldGroupPolicy, {
        source: 'configuration',
        roleEntityRef: ADMIN_ROLE_NAME,
        modifiedBy: `user:default/tom`,
      });

      policy = await newPermissionPolicy(
        config,
        enfDelegate,
        roleMetadataStorageTest,
      );
    });

    it('should allow read access to resource permission for user from config file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'policy.entity.read',
          'policy-entity',
          'read',
        ),
        newPolicyQueryUser('user:default/test_admin'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/test_admin',
        'policy.entity.read',
        'policy-entity',
        'read',
        AuthorizeResult.ALLOW,
      );
    });

    it('should allow read access to resource permission for super user from config file', async () => {
      const decision = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'policy.entity.read',
          'policy-entity',
          'read',
        ),
        newPolicyQueryUser('user:default/super_user'),
      );
      expect(decision.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/super_user',
        'policy.entity.read',
        'policy-entity',
        'read',
        AuthorizeResult.ALLOW,
      );
      clearAuditorMock();
      const decision2 = await policy.handle(
        newPolicyQueryWithResourcePermission(
          'catalog.entity.delete',
          'catalog-entity',
          'delete',
        ),
        newPolicyQueryUser('user:default/super_user'),
      );
      expect(decision2.result).toBe(AuthorizeResult.ALLOW);
      expectAuditorLogForPermission(
        'user:default/super_user',
        'catalog.entity.delete',
        'catalog-entity',
        'delete',
        AuthorizeResult.ALLOW,
      );
    });

    it('should remove users that are no longer in the config file', async () => {
      const enfRole = await enfDelegate.getFilteredGroupingPolicy(1, adminRole);
      const enfPermission = await enfDelegate.getFilteredPolicy(0, adminRole);
      expect(enfRole).toEqual(groupPolicy);
      expect(enfRole).not.toContain(oldGroupPolicy);
      expect(enfPermission).toEqual(permissions);
    });
  });
});

// Notice: There is corner case, when "resourced" permission policy can be defined not by resource type, but by name.
describe('Policy checks for resourced permissions defined by name', () => {
  const roleMetadataStorageTest: RoleMetadataStorage = {
    filterRoleMetadata: jest.fn().mockImplementation(() => []),
    findRoleMetadata: jest
      .fn()
      .mockImplementation(
        async (
          _roleEntityRef: string,
          _trx: Knex.Knex.Transaction,
        ): Promise<RoleMetadataDao> => {
          return {
            roleEntityRef: 'role:default/catalog-writer',
            source: 'legacy',
            modifiedBy,
          };
        },
      ),
    filterForOwnerRoleMetadata: jest.fn().mockImplementation(),
    createRoleMetadata: jest.fn().mockImplementation(),
    updateRoleMetadata: jest.fn().mockImplementation(),
    removeRoleMetadata: jest.fn().mockImplementation(),
  };
  let enfDelegate: EnforcerDelegate;
  let policy: RBACPermissionPolicy;

  beforeEach(async () => {
    const config = newConfig();
    const adapter = await newAdapter(config);
    enfDelegate = await newEnforcerDelegate(adapter, config);
    policy = await newPermissionPolicy(
      config,
      enfDelegate,
      roleMetadataStorageTest,
    );
  });

  it('should allow access to resourced permission assigned by name', async () => {
    await enfDelegate.addGroupingPolicy(
      ['user:default/tor', 'role:default/catalog_reader'],
      {
        source: 'csv-file',
        roleEntityRef: 'role:default/catalog_reader',
        modifiedBy,
      },
    );
    await enfDelegate.addPolicy([
      'role:default/catalog_reader',
      'catalog.entity.read',
      'read',
      'allow',
    ]);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  it('should allow access to resourced permission assigned by name, because it has higher priority then permission for the same resource assigned by resource type', async () => {
    await enfDelegate.addGroupingPolicy(
      ['user:default/tor', 'role:default/catalog_reader'],
      {
        source: 'csv-file',
        roleEntityRef: 'role:default/catalog_reader',
        modifiedBy,
      },
    );
    await enfDelegate.addPolicies([
      ['role:default/catalog_reader', 'catalog.entity.read', 'read', 'allow'],
      ['role:default/catalog_reader', 'catalog-entity', 'read', 'deny'],
    ]);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
  });

  it('should deny access to resourced permission assigned by name, because it has higher priority then permission for the same resource assigned by resource type', async () => {
    await enfDelegate.addGroupingPolicy(
      ['user:default/tor', 'role:default/catalog_reader'],
      {
        source: 'csv-file',
        roleEntityRef: 'role:default/catalog_reader',
        modifiedBy,
      },
    );

    await enfDelegate.addPolicies([
      ['role:default/catalog_reader', 'catalog.entity.read', 'read', 'deny'],
      ['role:default/catalog_reader', 'catalog-entity', 'read', 'allow'],
    ]);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      'user:default/tor',
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('should allow access to resourced permission assigned by name, but user inherits policy from his group', async () => {
    await enfDelegate.addGroupingPolicy(
      ['group:default/team-a', 'role:default/catalog_user'],
      {
        source: 'csv-file',
        roleEntityRef: 'role:default/catalog_user',
        modifiedBy,
      },
    );

    await enfDelegate.addPolicies([
      ['role:default/catalog_user', 'catalog.entity.read', 'read', 'allow'],
    ]);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      'user:default/tor',
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('should allow access to resourced permission assigned by name, but user inherits policy from uppercase group', async () => {
    const name = 'team-C';
    await enfDelegate.addGroupingPolicy(
      [
        `group:default/${name.toLocaleLowerCase('en-US')}`,
        'role:default/catalog_user',
      ],
      {
        source: 'csv-file',
        roleEntityRef: 'role:default/catalog_user',
        modifiedBy,
      },
    );

    await enfDelegate.addPolicies([
      ['role:default/catalog_user', 'catalog.entity.read', 'read', 'allow'],
    ]);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      'user:default/tor',
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('should allow access to resourced permission assigned by name, but user inherits policy from few groups', async () => {
    await enfDelegate.addGroupingPolicy(
      ['group:default/team-a', 'role:default/catalog_user'],
      {
        source: 'csv-file',
        roleEntityRef: 'role:default/catalog_user',
        modifiedBy,
      },
    );
    await enfDelegate.addGroupingPolicy(
      ['group:default/team-a', 'group:default/team-c'],
      {
        source: 'csv-file',
        roleEntityRef: 'role:default/catalog_user',
        modifiedBy,
      },
    );

    await enfDelegate.addPolicies([
      ['role:default/catalog_user', 'catalog.entity.read', 'read', 'allow'],
    ]);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/tor'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      'user:default/tor',
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });
});

describe('Policy checks for users and groups', () => {
  let policy: RBACPermissionPolicy;

  beforeEach(async () => {
    const policyChecksCSV = resolve(
      __dirname,
      '../../__fixtures__/data/valid-csv/policy-checks.csv',
    );
    const config = newConfig(policyChecksCSV);
    const adapter = await newAdapter(config);

    const enfDelegate = await newEnforcerDelegate(adapter, config);

    policy = await newPermissionPolicy(config, enfDelegate);
  });

  // User inherits permissions from groups and their parent groups.
  // This behavior can be configured with `policy_effect` in the model.
  // Also it can be customized using casbin function.
  // Test suite table:
  // +-------+---------+----------+-------+
  // | Group |  User   |  result  | case# |
  // +-------+---------+----------+-------+
  // | deny  |  allow  |  deny    |   1   | +
  // | deny  |    -    |  deny    |   2   | +
  // | deny  |  deny   |  deny    |   3   | +
  // +-------+---------+----------+-------+
  // | allow | allow   | allow    |   4   | +
  // | allow |   -     | allow    |   5   | +
  // | allow |  deny   | deny     |   6   |
  // +-------+---------+----------+-------+

  // Basic type permissions

  // case1
  it('should deny access to basic permission for user Alice with "allow" "use" action, when her group "deny" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newPolicyQueryUser('user:default/alice'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      'user:default/alice',
      'test.resource',
      undefined,
      'use',
      AuthorizeResult.DENY,
    );
  });

  // case2
  it('should deny access to basic permission for user Akira without("-") "use" action definition, when his group "deny" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newPolicyQueryUser('user:default/akira'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      'user:default/akira',
      'test.resource',
      undefined,
      'use',
      AuthorizeResult.DENY,
    );
  });

  // case3
  it('should deny access to basic permission for user Antey with "deny" "use" action definition, when his group "deny" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newPolicyQueryUser('user:default/antey'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      'user:default/antey',
      'test.resource',
      undefined,
      'use',
      AuthorizeResult.DENY,
    );
  });

  // case4
  it('should allow access to basic permission for user Julia with "allow" "use" action, when her group "allow" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newPolicyQueryUser('user:default/julia'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      'user:default/julia',
      'test.resource',
      undefined,
      'use',
      AuthorizeResult.ALLOW,
    );
  });

  // case5
  it('should allow access to basic permission for user Mike without("-") "use" action definition, when his group "allow" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newPolicyQueryUser('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      'user:default/mike',
      'test.resource',
      undefined,
      'use',
      AuthorizeResult.ALLOW,
    );
  });

  // case6
  it('should deny access to basic permission for user Tom with "deny" "use" action definition, when his group "allow" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource'),
      newPolicyQueryUser('user:default/tom'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      'user:default/tom',
      'test.resource',
      undefined,
      'use',
      AuthorizeResult.DENY,
    );
  });

  // inheritance case
  it('should allow access to basic permission to test.resource.2 for user Mike with "-" "use" action definition, when parent group of his group "allow" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithBasicPermission('test.resource.2'),
      newPolicyQueryUser('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      'user:default/mike',
      'test.resource.2',
      undefined,
      'use',
      AuthorizeResult.ALLOW,
    );
  });

  // Resource type permissions

  // case1
  it('should deny access to basic permission for user Alice with "allow" "read" action, when her group "deny" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newPolicyQueryUser('user:default/alice'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      'user:default/alice',
      'test.resource.read',
      'test-resource',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // case2
  it('should deny access to basic permission for user Akira without("-") "read" action definition, when his group "deny" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newPolicyQueryUser('user:default/akira'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      'user:default/akira',
      'test.resource.read',
      'test-resource',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // case3
  it('should deny access to basic permission for user Antey with "deny" "read" action definition, when his group "deny" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newPolicyQueryUser('user:default/antey'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      'user:default/antey',
      'test.resource.read',
      'test-resource',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // case4
  it('should allow access to basic permission for user Julia with "allow" "read" action, when her group "allow" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newPolicyQueryUser('user:default/julia'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      'user:default/julia',
      'test.resource.read',
      'test-resource',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  // case5
  it('should allow access to basic permission for user Mike without("-") "read" action definition, when his group "allow" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newPolicyQueryUser('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      'user:default/mike',
      'test.resource.read',
      'test-resource',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  // case6
  it('should deny access to basic permission for user Tom with "deny" "read" action definition, when his group "allow" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.read',
        'test-resource',
        'read',
      ),
      newPolicyQueryUser('user:default/tom'),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      'user:default/tom',
      'test.resource.read',
      'test-resource',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // inheritance case
  it('should allow access to resource permission to test-resource for user Mike with "-" "write" action definition, when parent group of his group "allow" this action', async () => {
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'test.resource.create',
        'test-resource',
        'create',
      ),
      newPolicyQueryUser('user:default/mike'),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      'user:default/mike',
      'test.resource.create',
      'test-resource',
      'create',
      AuthorizeResult.ALLOW,
    );
  });
});

describe('Policy checks for conditional policies', () => {
  let policy: RBACPermissionPolicy;

  beforeEach(async () => {
    const config = newConfig(undefined, []);
    const adapter = await newAdapter(config);
    const theModel = newModelFromString(MODEL);
    const logger = mockServices.logger.mock();
    const enf = await createEnforcer(theModel, adapter, logger, config);
    const policies = [['role:default/test', 'catalog-entity', 'read', 'allow']];
    const groupPolicies = [
      ['group:default/test-group', 'role:default/test'],
      ['group:default/qa', 'role:default/qa'],
    ];
    await enf.addPolicies(policies);
    await enf.addGroupingPolicies(groupPolicies);

    const enfDelegate = new EnforcerDelegate(
      enf,
      mockAuditorService,
      conditionalStorageMock,
      roleMetadataStorageMock,
      mockClientKnex,
    );

    policy = await RBACPermissionPolicy.build(
      logger,
      mockAuditorService,
      config,
      conditionalStorageMock,
      enfDelegate,
      roleMetadataStorageMock,
      mockClientKnex,
      pluginMetadataCollectorMock as PluginPermissionMetadataCollector,
      mockAuthService,
    );
  });

  it('should execute condition policy', async () => {
    (conditionalStorageMock.filterConditions as jest.Mock).mockReturnValueOnce([
      {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        actions: ['read'],
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['group:default/test-group'],
          },
        },
      },
    ]);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/mike'),
    );
    expect(decision).toStrictEqual({
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      result: AuthorizeResult.CONDITIONAL,
      conditions: {
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['group:default/test-group'],
            },
          },
        ],
      },
    });
  });

  it('should execute condition policy with current user alias', async () => {
    (conditionalStorageMock.filterConditions as jest.Mock).mockReturnValueOnce([
      {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        actions: ['read'],
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['$currentUser'],
          },
        },
      },
    ]);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/mike', [
        'user:default/mike',
        'group:default/team-a',
      ]),
    );
    expect(decision).toStrictEqual({
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      result: AuthorizeResult.CONDITIONAL,
      conditions: {
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/mike'],
            },
          },
        ],
      },
    });
  });

  it('should merge condition policies for user assigned to few roles', async () => {
    (conditionalStorageMock.filterConditions as jest.Mock)
      .mockReturnValueOnce([
        {
          id: 1,
          pluginId: 'catalog',
          resourceType: 'catalog-entity',
          actions: ['read'],
          roleEntityRef: 'role:default/test',
          result: AuthorizeResult.CONDITIONAL,
          conditions: {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['group:default/test-group'],
            },
          },
        },
      ])
      .mockReturnValueOnce([
        {
          id: 2,
          pluginId: 'catalog',
          resourceType: 'catalog-entity',
          actions: ['read'],
          roleEntityRef: 'role:default/qa',
          result: AuthorizeResult.CONDITIONAL,
          conditions: {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group', 'User'] },
          },
        },
      ]);
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/mike'),
    );
    expect(decision).toStrictEqual({
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      result: AuthorizeResult.CONDITIONAL,
      conditions: {
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['group:default/test-group'],
            },
          },
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group', 'User'] },
          },
        ],
      },
    });
  });

  it('should deny condition policy caused collision', async () => {
    (conditionalStorageMock.filterConditions as jest.Mock).mockReturnValueOnce([
      {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        actions: ['read'],
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['group:default/test-group'],
          },
        },
      },
      {
        id: 2,
        pluginId: 'catalog-fork',
        resourceType: 'catalog-entity',
        actions: ['read'],
        roleEntityRef: 'role:default/test',
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['group:default/test-group'],
          },
        },
      },
    ]);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/mike'),
    );
    expect(decision).toStrictEqual({
      result: AuthorizeResult.DENY,
    });
  });
});

describe('Policy checks with preferPermissionPolicy config', () => {
  const allowReadAndCreatePolicies = [
    // allow read for all resources
    ['role:default/all_resource_reader', 'catalog-entity', 'read', 'allow'],
    ['role:default/all_resource_reader', 'catalog-entity', 'create', 'allow'],
  ];

  const allowCreateButDenyReadPolicies = [
    // deny read for all resources
    ['role:default/all_resource_reader', 'catalog-entity', 'read', 'deny'],
    ['role:default/all_resource_reader', 'catalog-entity', 'create', 'allow'],
  ];

  const allowOnlyCreateAndNoneReadPolicies = [
    ['role:default/all_resource_reader', 'catalog-entity', 'create', 'allow'],
  ];

  const groupPolicies = [
    ['user:default/mike', 'role:default/all_resource_reader'],
    ['user:default/mike', 'role:default/owned_resource_reader'],
  ];

  const conditionalPolicy = [
    {
      id: 1,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      actions: ['read'],
      roleEntityRef: 'role:default/owned_resource_reader',
      result: AuthorizeResult.CONDITIONAL,
      conditions: {
        rule: 'IS_ENTITY_OWNER',
        resourceType: 'catalog-entity',
        params: {
          claims: ['user:default/mike'],
        },
      },
    },
  ];

  it('should allow "catalog read operation" when preferPermissionPolicy is true (permission policy first) and read policy has "allow" value', async () => {
    const config = newConfig(undefined, undefined, undefined, 'basic');
    const adapter = await newAdapter(config);
    const enfDelegate = await newEnforcerDelegate(
      adapter,
      config,
      allowReadAndCreatePolicies,
      groupPolicies,
    );
    const policy = await newPermissionPolicy(config, enfDelegate);

    // Mock conditionalStorage to return a conditional ALLOW for owned-reader
    (
      conditionalStorageMock.filterConditions as jest.Mock
    ).mockResolvedValueOnce(conditionalPolicy);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/mike', ['user:default/mike']), // user is owner
    );
    expect(decision).toStrictEqual({ result: AuthorizeResult.ALLOW });
  });

  it('should deny "catalog read operation" when preferPermissionPolicy is true (permission policy first) and read policy has "deny" value', async () => {
    const config = newConfig(undefined, undefined, undefined, 'basic');
    const adapter = await newAdapter(config);
    const enfDelegate = await newEnforcerDelegate(
      adapter,
      config,
      allowCreateButDenyReadPolicies,
      groupPolicies,
    );
    const policy = await newPermissionPolicy(config, enfDelegate);

    // Mock conditionalStorage to return a conditional ALLOW for owned-reader
    (
      conditionalStorageMock.filterConditions as jest.Mock
    ).mockResolvedValueOnce(conditionalPolicy);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/mike', ['user:default/mike']), // user is owner
    );
    expect(decision).toStrictEqual({ result: AuthorizeResult.DENY });
  });

  it('should return conditional result for "catalog read operation" when preferPermissionPolicy is true (permission policy first) and there is no read policy value', async () => {
    const config = newConfig(undefined, undefined, undefined, 'basic');
    const adapter = await newAdapter(config);
    const enfDelegate = await newEnforcerDelegate(
      adapter,
      config,
      allowOnlyCreateAndNoneReadPolicies,
      groupPolicies,
    );
    const policy = await newPermissionPolicy(config, enfDelegate);

    // Mock conditionalStorage to return a conditional ALLOW for owned-reader
    (
      conditionalStorageMock.filterConditions as jest.Mock
    ).mockResolvedValueOnce(conditionalPolicy);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/mike', ['user:default/mike']), // user is owner
    );
    expect(decision).toStrictEqual({
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      result: AuthorizeResult.CONDITIONAL,
      conditions: {
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/mike'],
            },
          },
        ],
      },
    });
  });

  it('should NOT allow read when preferPermissionPolicy is false by default (conditional policy first)', async () => {
    const config = newConfig();
    const adapter = await newAdapter(config);
    const enfDelegate = await newEnforcerDelegate(
      adapter,
      config,
      allowReadAndCreatePolicies,
      groupPolicies,
    );
    const policy = await newPermissionPolicy(config, enfDelegate);

    // Mock conditionalStorage to return a conditional ALLOW for owned-reader
    (
      conditionalStorageMock.filterConditions as jest.Mock
    ).mockResolvedValueOnce(conditionalPolicy);

    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser('user:default/mike', ['user:default/mike']),
    );
    expect(decision).toStrictEqual({
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      result: AuthorizeResult.CONDITIONAL,
      conditions: {
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/mike'],
            },
          },
        ],
      },
    });
  });
});

function newPolicyQueryWithBasicPermission(
  name: string,
  action?: 'create' | 'read' | 'update' | 'delete',
): PolicyQuery {
  const mockPermission = createPermission({
    name: name,
    attributes: { action },
  });
  return { permission: mockPermission };
}

function newPolicyQueryWithResourcePermission(
  name: string,
  resource: string,
  action: PermissionAction,
): PolicyQuery {
  const mockPermission = createPermission({
    name: name,
    attributes: {},
    resourceType: resource,
  });
  if (action) {
    mockPermission.attributes.action = action;
  }
  return { permission: mockPermission };
}

function newPolicyQueryUser(
  user?: string,
  ownershipEntityRefs?: string[],
): PolicyQueryUser | undefined {
  if (user) {
    return {
      identity: {
        ownershipEntityRefs: ownershipEntityRefs ?? [],
        type: 'user',
        userEntityRef: user,
      },
      credentials: {
        $$type: '@backstage/BackstageCredentials',
        principal: true,
        expiresAt: new Date('2021-01-01T00:00:00Z'),
      },
      info: {
        userEntityRef: user,
        ownershipEntityRefs: ownershipEntityRefs ?? [],
      },
      token: 'token',
    };
  }
  return undefined;
}

function newConfig(
  permFile?: string,
  users?: Array<{ name: string }>,
  superUsers?: Array<{ name: string }>,
  policyDecisionPrecedence?: 'basic' | 'conditional',
): Config {
  const testUsers = [
    {
      name: 'user:default/guest',
    },
    {
      name: 'group:default/guests',
    },
  ];

  return mockServices.rootConfig({
    data: {
      permission: {
        rbac: {
          'policies-csv-file': permFile || csvPermFile,
          policyFileReload: false,
          admin: {
            users: users || testUsers,
            superUsers: superUsers,
          },
          policyDecisionPrecedence: policyDecisionPrecedence ?? 'conditional',
        },
      },
      backend: {
        database: {
          client: 'better-sqlite3',
          connection: ':memory:',
        },
      },
    },
  });
}

async function newAdapter(config: Config): Promise<Adapter> {
  return await new CasbinDBAdapterFactory(
    config,
    mockClientKnex,
  ).createAdapter();
}

async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  logger: LoggerService,
  config: Config,
): Promise<Enforcer> {
  const catalogDBClient = Knex.knex({ client: MockClient });
  const rbacDBClient = Knex.knex({ client: MockClient });
  const enf = await newEnforcer(theModel, adapter);

  const rm = new BackstageRoleManager(
    catalogMock,
    logger,
    catalogDBClient,
    rbacDBClient,
    config,
    mockAuthService,
  );
  enf.setRoleManager(rm);
  enf.enableAutoBuildRoleLinks(false);
  await enf.buildRoleLinks();

  return enf;
}

async function newEnforcerDelegate(
  adapter: Adapter,
  config: Config,
  storedPolicies?: string[][],
  storedGroupingPolicies?: string[][],
): Promise<EnforcerDelegate> {
  const theModel = newModelFromString(MODEL);
  const logger = mockServices.logger.mock();

  const enf = await createEnforcer(theModel, adapter, logger, config);

  if (storedPolicies) {
    await enf.addPolicies(storedPolicies);
  }

  if (storedGroupingPolicies) {
    await enf.addGroupingPolicies(storedGroupingPolicies);
  }

  return new EnforcerDelegate(
    enf,
    mockAuditorService,
    conditionalStorageMock,
    roleMetadataStorageMock,
    mockClientKnex,
  );
}

async function newPermissionPolicy(
  config: Config,
  enfDelegate: EnforcerDelegate,
  roleMock?: RoleMetadataStorage,
): Promise<RBACPermissionPolicy> {
  const logger = mockServices.logger.mock();
  const permissionPolicy = await RBACPermissionPolicy.build(
    logger,
    mockAuditorService,
    config,
    conditionalStorageMock,
    enfDelegate,
    roleMock || roleMetadataStorageMock,
    mockClientKnex,
    pluginMetadataCollectorMock as PluginPermissionMetadataCollector,
    mockAuthService,
  );
  clearAuditorMock();
  return permissionPolicy;
}
