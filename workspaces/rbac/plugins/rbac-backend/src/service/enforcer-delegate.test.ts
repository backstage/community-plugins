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
import { mockServices } from '@backstage/backend-test-utils';

import { Model, newEnforcer, newModelFromString } from 'casbin';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';
import {
  conditionalStorageMock,
  mockAuditorService,
} from '../../__fixtures__/mock-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  PermissionInfo,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

// TODO: Move to 'catalogServiceMock' from '@backstage/plugin-catalog-node/testUtils'
// once '@backstage/plugin-catalog-node' is upgraded
const catalogApiMock = {
  getEntityAncestors: jest.fn().mockImplementation(),
  getLocationById: jest.fn().mockImplementation(),
  getEntities: jest.fn().mockImplementation(),
  getEntitiesByRefs: jest.fn().mockImplementation(),
  queryEntities: jest.fn().mockImplementation(),
  getEntityByRef: jest.fn().mockImplementation(),
  refreshEntity: jest.fn().mockImplementation(),
  getEntityFacets: jest.fn().mockImplementation(),
  addLocation: jest.fn().mockImplementation(),
  getLocationByRef: jest.fn().mockImplementation(),
  removeLocationById: jest.fn().mockImplementation(),
  removeEntityByUid: jest.fn().mockImplementation(),
  validateEntity: jest.fn().mockImplementation(),
  getLocationByEntity: jest.fn().mockImplementation(),
};

const roleMetadataStorageMock: RoleMetadataStorage = {
  filterRoleMetadata: jest.fn().mockImplementation(() => []),
  filterForOwnerRoleMetadata: jest.fn().mockImplementation(),
  findRoleMetadata: jest.fn().mockImplementation(),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
};

const mockClientKnex = Knex.knex({ client: MockClient });

const mockAuthService = mockServices.auth();

const config = mockServices.rootConfig({
  data: {
    backend: {
      database: {
        client: 'better-sqlite3',
        connection: ':memory:',
      },
    },
    permission: {
      rbac: {},
    },
  },
});
const policy = ['role:default/dev-team', 'policy-entity', 'read', 'allow'];
const secondPolicy = [
  'role:default/qa-team',
  'catalog-entity',
  'create',
  'allow',
];

const groupingPolicy = ['user:default/tom', 'role:default/dev-team'];
const secondGroupingPolicy = ['user:default/tim', 'role:default/qa-team'];

describe('EnforcerDelegate', () => {
  let enfRemovePolicySpy: jest.SpyInstance<Promise<boolean>, string[], any>;
  let enfRemovePoliciesSpy: jest.SpyInstance<
    Promise<boolean>,
    [rules: string[][]],
    any
  >;
  let enfRemoveGroupingPolicySpy: jest.SpyInstance<
    Promise<boolean>,
    string[],
    any
  >;
  let adapterLoaderFilterGroupingPolicySpy: jest.SpyInstance<
    Promise<void>,
    [model: Model, filter: any],
    any
  >;
  let enfRemoveGroupingPoliciesSpy: jest.SpyInstance<
    Promise<boolean>,
    [rules: string[][]],
    any
  >;
  let enfAddPolicySpy: jest.SpyInstance<
    Promise<boolean>,
    [...policy: string[]],
    any
  >;
  let enfAddGroupingPolicySpy: jest.SpyInstance<
    Promise<boolean>,
    [...policy: string[]],
    any
  >;
  let enfAddGroupingPoliciesSpy: jest.SpyInstance<
    Promise<boolean>,
    [policy: string[][]],
    any
  >;
  let enfAddPoliciesSpy: jest.SpyInstance<
    Promise<boolean>,
    [rules: string[][]],
    any
  >;

  const modifiedBy = 'user:default/some-admin';

  beforeEach(() => {
    (roleMetadataStorageMock.createRoleMetadata as jest.Mock).mockReset();
    (roleMetadataStorageMock.updateRoleMetadata as jest.Mock).mockReset();
    (roleMetadataStorageMock.findRoleMetadata as jest.Mock).mockReset();
    (roleMetadataStorageMock.removeRoleMetadata as jest.Mock).mockReset();
  });

  const knex = Knex.knex({ client: MockClient });

  async function createEnfDelegate(
    policies?: string[][],
    groupingPolicies?: string[][],
  ): Promise<EnforcerDelegate> {
    const theModel = newModelFromString(MODEL);
    const logger = mockServices.logger.mock();

    const sqliteInMemoryAdapter = await new CasbinDBAdapterFactory(
      config,
      mockClientKnex,
    ).createAdapter();
    adapterLoaderFilterGroupingPolicySpy = jest.spyOn(
      sqliteInMemoryAdapter,
      'loadFilteredPolicy',
    );

    const catalogDBClient = Knex.knex({ client: MockClient });
    const rbacDBClient = Knex.knex({ client: MockClient });
    const enf = await newEnforcer(theModel, sqliteInMemoryAdapter);
    enfRemovePolicySpy = jest.spyOn(enf, 'removePolicy');
    enfRemovePoliciesSpy = jest.spyOn(enf, 'removePolicies');
    enfRemoveGroupingPolicySpy = jest.spyOn(enf, 'removeGroupingPolicy');
    enfRemoveGroupingPoliciesSpy = jest.spyOn(enf, 'removeGroupingPolicies');
    enfAddPolicySpy = jest.spyOn(enf, 'addPolicy');
    enfAddGroupingPolicySpy = jest.spyOn(enf, 'addGroupingPolicy');
    enfAddGroupingPoliciesSpy = jest.spyOn(enf, 'addGroupingPolicies');
    enfAddPoliciesSpy = jest.spyOn(enf, 'addPolicies');

    const rm = new BackstageRoleManager(
      catalogApiMock,
      logger,
      catalogDBClient,
      rbacDBClient,
      config,
      mockAuthService,
    );
    enf.setRoleManager(rm);
    enf.enableAutoBuildRoleLinks(false);
    await enf.buildRoleLinks();

    if (policies && policies.length > 0) {
      await enf.addPolicies(policies);
    }
    if (groupingPolicies && groupingPolicies.length > 0) {
      await enf.addGroupingPolicies(groupingPolicies);
    }

    return new EnforcerDelegate(
      enf,
      mockAuditorService,
      conditionalStorageMock,
      roleMetadataStorageMock,
      knex,
    );
  }

  describe('hasPolicy', () => {
    it('has policy should return false', async () => {
      const enfDelegate = await createEnfDelegate();
      const result = await enfDelegate.hasPolicy(...policy);

      expect(result).toBeFalsy();
    });

    it('has policy should return true', async () => {
      const enfDelegate = await createEnfDelegate([policy]);

      const result = await enfDelegate.hasPolicy(...policy);

      expect(result).toBeTruthy();
    });
  });

  describe('hasGroupingPolicy', () => {
    it('has policy should return false', async () => {
      const enfDelegate = await createEnfDelegate([policy]);
      const result = await enfDelegate.hasGroupingPolicy(...groupingPolicy);

      expect(result).toBeFalsy();
    });

    it('has policy should return true', async () => {
      const enfDelegate = await createEnfDelegate([], [groupingPolicy]);

      const result = await enfDelegate.hasGroupingPolicy(...groupingPolicy);

      expect(result).toBeTruthy();
    });
  });

  describe('getPolicy', () => {
    it('should return empty array', async () => {
      const enfDelegate = await createEnfDelegate();
      const policies = await enfDelegate.getPolicy();

      expect(policies.length).toEqual(0);
    });

    it('should return policy', async () => {
      const enfDelegate = await createEnfDelegate([policy]);

      const policies = await enfDelegate.getPolicy();

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(policy);
    });
  });

  describe('getGroupingPolicy', () => {
    it('should return empty array', async () => {
      const enfDelegate = await createEnfDelegate();
      const groupingPolicies = await enfDelegate.getGroupingPolicy();

      expect(groupingPolicies.length).toEqual(0);
    });

    it('should return grouping policy', async () => {
      const enfDelegate = await createEnfDelegate([], [groupingPolicy]);

      const policies = await enfDelegate.getGroupingPolicy();

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(groupingPolicy);
    });
  });

  describe('getFilteredPolicy', () => {
    it('should return empty array', async () => {
      const enfDelegate = await createEnfDelegate();
      // filter by policy assignment person
      const policies = await enfDelegate.getFilteredPolicy(0, policy[0]);

      expect(policies.length).toEqual(0);
    });

    it('should return filtered policy by role name', async () => {
      const enfDelegate = await createEnfDelegate([policy, secondPolicy]);

      // filter by policy assignment person
      const policies = await enfDelegate.getFilteredPolicy(
        0,
        'role:default/qa-team',
      );

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(secondPolicy);
    });

    it('should return filtered policy by policy name', async () => {
      const enfDelegate = await createEnfDelegate([policy, secondPolicy]);

      const policyName = policy[1];
      const policies = await enfDelegate.getFilteredPolicy(0, '', policyName);

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(policy);
    });

    it('should return filtered policy by policy name with index offset', async () => {
      const enfDelegate = await createEnfDelegate([policy, secondPolicy]);

      const policyName = policy[1];
      const policies = await enfDelegate.getFilteredPolicy(1, policyName);

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(policy);
    });

    it('should return filtered policy by policy action', async () => {
      const enfDelegate = await createEnfDelegate([policy, secondPolicy]);

      const policyAction = policy[2];
      const policies = await enfDelegate.getFilteredPolicy(
        0,
        '',
        '',
        policyAction,
      );

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(policy);
    });

    it('should return filtered policy by policy effect', async () => {
      const enfDelegate = await createEnfDelegate([policy, secondPolicy]);

      const policyEffect = policy[3];
      const policies = await enfDelegate.getFilteredPolicy(
        0,
        '',
        '',
        '',
        policyEffect,
      );

      expect(policies.length).toEqual(2);
      expect(policies[0]).toEqual(policy);
      expect(policies[1]).toEqual(secondPolicy);
    });
  });

  describe('getFilteredGroupingPolicy', () => {
    it('should return empty array', async () => {
      const enfDelegate = await createEnfDelegate();
      // filter by policy assignment person
      const policies = await enfDelegate.getFilteredGroupingPolicy(
        0,
        'user:default/tim',
      );

      expect(policies.length).toEqual(0);
    });

    it('should return filtered grouping policy by role member', async () => {
      const enfDelegate = await createEnfDelegate(
        [],
        [groupingPolicy, secondGroupingPolicy],
      );

      // filter by policy assignment person
      const policies = await enfDelegate.getFilteredGroupingPolicy(
        0,
        'user:default/tim',
      );

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(secondGroupingPolicy);
    });

    it('should return filtered grouping policy by role name', async () => {
      const enfDelegate = await createEnfDelegate(
        [],
        [groupingPolicy, secondGroupingPolicy],
      );

      // filter by policy assignment person
      const policies = await enfDelegate.getFilteredGroupingPolicy(
        0,
        '',
        'role:default/qa-team',
      );

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(secondGroupingPolicy);
    });

    it('should return filtered grouping policy by role name with index offset', async () => {
      const enfDelegate = await createEnfDelegate(
        [],
        [groupingPolicy, secondGroupingPolicy],
      );

      // filter by policy assignment person
      const policies = await enfDelegate.getFilteredGroupingPolicy(
        1,
        'role:default/qa-team',
      );

      expect(policies.length).toEqual(1);
      expect(policies[0]).toEqual(secondGroupingPolicy);
    });
  });

  describe('addPolicy', () => {
    it('should add policy', async () => {
      const enfDelegate = await createEnfDelegate();
      enfAddPolicySpy.mockClear();

      await enfDelegate.addPolicy(policy);

      expect(enfAddPolicySpy).toHaveBeenCalledWith(...policy);

      expect(await enfDelegate.getPolicy()).toEqual([policy]);
    });
  });

  describe('addPolicies', () => {
    it('should be added single policy', async () => {
      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addPolicies([policy]);

      const storePolicies = await enfDelegate.getPolicy();

      expect(storePolicies).toEqual([policy]);
      expect(enfAddPoliciesSpy).toHaveBeenCalledWith([policy]);
    });

    it('should be added few policies', async () => {
      const enfDelegate = await createEnfDelegate();

      await enfDelegate.addPolicies([policy, secondPolicy]);

      const storePolicies = await enfDelegate.getPolicy();

      expect(storePolicies.length).toEqual(2);
      expect(storePolicies).toEqual(
        expect.arrayContaining([
          expect.objectContaining(policy),
          expect.objectContaining(secondPolicy),
        ]),
      );
      expect(enfAddPoliciesSpy).toHaveBeenCalledWith([policy, secondPolicy]);
    });

    it('should not fail, when argument is empty array', async () => {
      const enfDelegate = await createEnfDelegate();

      enfDelegate.addPolicies([]);

      expect(enfAddPoliciesSpy).not.toHaveBeenCalled();
      expect((await enfDelegate.getPolicy()).length).toEqual(0);
    });
  });

  describe('addGroupingPolicy', () => {
    it('should add grouping policy and create role metadata', async () => {
      (roleMetadataStorageMock.findRoleMetadata as jest.Mock).mockReturnValue(
        Promise.resolve(undefined),
      );

      const enfDelegate = await createEnfDelegate();

      const roleEntityRef = 'role:default/dev-team';
      await enfDelegate.addGroupingPolicy(groupingPolicy, {
        source: 'rest',
        roleEntityRef: roleEntityRef,
        author: modifiedBy,
        modifiedBy,
      });

      expect(enfAddGroupingPolicySpy).toHaveBeenCalledWith(...groupingPolicy);
      expect(roleMetadataStorageMock.createRoleMetadata).toHaveBeenCalled();
      expect(
        (roleMetadataStorageMock.createRoleMetadata as jest.Mock).mock.calls
          .length,
      ).toEqual(1);
      const metadata: RoleMetadataDao = (
        roleMetadataStorageMock.createRoleMetadata as jest.Mock
      ).mock.calls[0][0];
      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified).toEqual(createdAtData);

      expect(metadata.source).toEqual('rest');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
    });

    it('should fail to add policy, caused role metadata storage error', async () => {
      const enfDelegate = await createEnfDelegate();

      roleMetadataStorageMock.createRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('some unexpected error');
        });

      await expect(
        enfDelegate.addGroupingPolicy(groupingPolicy, {
          source: 'rest',
          roleEntityRef: 'role:default/dev-team',
          author: modifiedBy,
          modifiedBy,
        }),
      ).rejects.toThrow('some unexpected error');
    });

    it('should update role metadata on addGroupingPolicy, because metadata has been created', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (
            _roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadataDao> => {
            return {
              source: 'csv-file',
              roleEntityRef: 'role:default/dev-team',
              createdAt: '2024-03-01 00:23:41+00',
              author: modifiedBy,
              modifiedBy,
            };
          },
        );

      const enfDelegate = await createEnfDelegate();

      const roleEntityRef = 'role:default/dev-team';
      await enfDelegate.addGroupingPolicy(groupingPolicy, {
        source: 'rest',
        roleEntityRef,
        author: modifiedBy,
        modifiedBy,
      });

      expect(enfAddGroupingPolicySpy).toHaveBeenCalledWith(...groupingPolicy);

      expect(roleMetadataStorageMock.createRoleMetadata).not.toHaveBeenCalled();
      const metadata: RoleMetadataDao = (
        roleMetadataStorageMock.updateRoleMetadata as jest.Mock
      ).mock.calls[0][0];
      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();

      expect(metadata.source).toEqual('rest');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
    });
  });

  describe('addGroupingPolicies', () => {
    it('should add grouping policies and create role metadata', async () => {
      const enfDelegate = await createEnfDelegate();

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/security',
        source: 'rest',
        author: modifiedBy,
        modifiedBy,
      };
      await enfDelegate.addGroupingPolicies(
        [groupingPolicy, secondGroupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies).toEqual([groupingPolicy, secondGroupingPolicy]);

      expect(enfAddGroupingPoliciesSpy).toHaveBeenCalledWith([
        groupingPolicy,
        secondGroupingPolicy,
      ]);

      expect(roleMetadataStorageMock.createRoleMetadata).toHaveBeenCalledWith(
        roleMetadataDao,
        expect.anything(),
      );

      const metadata: RoleMetadataDao = (
        roleMetadataStorageMock.createRoleMetadata as jest.Mock
      ).mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified).toEqual(createdAtData);
      expect(metadata.author).toEqual(modifiedBy);
      expect(metadata.roleEntityRef).toEqual('role:default/security');
      expect(metadata.source).toEqual('rest');
      expect(metadata.description).toBeUndefined();
    });

    it('should add grouping policies and create role metadata with description', async () => {
      const enfDelegate = await createEnfDelegate();

      const description = 'Role for security engineers';
      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/security',
        source: 'rest',
        description,
        author: modifiedBy,
        modifiedBy,
      };
      await enfDelegate.addGroupingPolicies(
        [groupingPolicy, secondGroupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies).toEqual([groupingPolicy, secondGroupingPolicy]);

      expect(enfAddGroupingPoliciesSpy).toHaveBeenCalledWith([
        groupingPolicy,
        secondGroupingPolicy,
      ]);

      expect(roleMetadataStorageMock.createRoleMetadata).toHaveBeenCalledWith(
        roleMetadataDao,
        expect.anything(),
      );

      const metadata: RoleMetadataDao = (
        roleMetadataStorageMock.createRoleMetadata as jest.Mock
      ).mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified).toEqual(createdAtData);
      expect(metadata.roleEntityRef).toEqual('role:default/security');
      expect(metadata.source).toEqual('rest');
      expect(metadata.description).toEqual('Role for security engineers');
    });

    it('should fail to add grouping policy, because fail to create role metadata', async () => {
      roleMetadataStorageMock.createRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('some unexpected error');
        });

      const enfDelegate = await createEnfDelegate();

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/security',
        source: 'rest',
        author: 'user:default/some-user',
        modifiedBy: 'user:default/some-user',
      };
      await expect(
        enfDelegate.addGroupingPolicies(
          [groupingPolicy, secondGroupingPolicy],
          roleMetadataDao,
        ),
      ).rejects.toThrow('some unexpected error');

      // shouldn't store group policies
      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies).toEqual([]);
    });

    it('should update role metadata, because metadata has been created', async () => {
      (roleMetadataStorageMock.findRoleMetadata as jest.Mock) = jest
        .fn()
        .mockReturnValueOnce({
          source: 'csv-file',
          roleEntityRef: 'role:default/dev-team',
          author: 'user:default/some-user',
          description: 'Role for dev engineers',
          createdAt: '2024-03-01 00:23:41+00',
        });

      const enfDelegate = await createEnfDelegate();

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/dev-team',
        source: 'rest',
        author: 'user:default/some-user',
        modifiedBy,
      };
      await enfDelegate.addGroupingPolicies(
        [
          ['user:default/tom', 'role:default/dev-team'],
          ['user:default/tim', 'role:default/dev-team'],
        ],
        roleMetadataDao,
      );
      const storedPolicies = await enfDelegate.getGroupingPolicy();

      expect(storedPolicies).toEqual([
        ['user:default/tom', 'role:default/dev-team'],
        ['user:default/tim', 'role:default/dev-team'],
      ]);

      expect(enfAddGroupingPoliciesSpy).toHaveBeenCalledWith([
        ['user:default/tom', 'role:default/dev-team'],
        ['user:default/tim', 'role:default/dev-team'],
      ]);

      expect(roleMetadataStorageMock.createRoleMetadata).not.toHaveBeenCalled();

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual('user:default/some-user');
      expect(metadata.description).toEqual('Role for dev engineers');
      expect(metadata.modifiedBy).toEqual(modifiedBy);
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
      expect(metadata.source).toEqual('rest');
    });
  });

  describe('updateGroupingPolicies', () => {
    it('should update grouping policies: add one more policy and update roleMetadata with new modifiedBy', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/dev-team',
            author: 'user:default/tom',
            modifiedBy: 'user:default/tom',
            description: 'Role for dev engineers',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });

      const enfDelegate = await createEnfDelegate([], [groupingPolicy]);

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/dev-team',
        source: 'rest',
        author: modifiedBy,
        modifiedBy: 'user:default/system-admin',
      };

      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy],
        [groupingPolicy, secondGroupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(2);

      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith([
        groupingPolicy,
      ]);
      expect(enfAddGroupingPoliciesSpy).toHaveBeenCalledWith([
        groupingPolicy,
        secondGroupingPolicy,
      ]);

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual('user:default/tom');
      expect(metadata.description).toEqual('Role for dev engineers');
      expect(metadata.modifiedBy).toEqual('user:default/system-admin');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
      expect(metadata.source).toEqual('rest');
    });

    it('should update grouping policies: one policy should be removed for updateGroupingPolicies', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/dev-team',
            author: modifiedBy,
            modifiedBy,
            description: 'Role for dev engineers',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });

      const enfDelegate = await createEnfDelegate(
        [],
        [groupingPolicy, secondGroupingPolicy],
      );

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/dev-team',
        source: 'rest',
        author: modifiedBy,
        modifiedBy: 'user:default/system-admin',
      };
      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy, secondGroupingPolicy],
        [groupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(1);

      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith([
        groupingPolicy,
        secondGroupingPolicy,
      ]);
      expect(enfAddGroupingPoliciesSpy).toHaveBeenCalledWith([groupingPolicy]);

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual(modifiedBy);
      expect(metadata.description).toEqual('Role for dev engineers');
      expect(metadata.modifiedBy).toEqual('user:default/system-admin');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
      expect(metadata.source).toEqual('rest');
    });

    it('should update grouping policies: one policy should be removed and description updated', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/dev-team',
            author: 'user:default/some-user',
            modifiedBy: 'user:default/some-user',
            description: 'Role for dev engineers',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });

      const enfDelegate = await createEnfDelegate(
        [],
        [groupingPolicy, secondGroupingPolicy],
      );

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/dev-team',
        source: 'rest',
        author: modifiedBy,
        modifiedBy: 'user:default/system-admin',
        description: 'updated description',
      };
      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy, secondGroupingPolicy],
        [groupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(1);

      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith([
        groupingPolicy,
        secondGroupingPolicy,
      ]);
      expect(enfAddGroupingPoliciesSpy).toHaveBeenCalledWith([groupingPolicy]);

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual('user:default/some-user');
      expect(metadata.description).toEqual('updated description');
      expect(metadata.modifiedBy).toEqual('user:default/system-admin');
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
      expect(metadata.source).toEqual('rest');
    });

    it('should update grouping policies: role should be renamed', async () => {
      const oldRoleName = 'role:default/dev-team';
      const newRoleName = 'role:default/new-team-name';

      const oldCondition = {
        id: 1,
        pluginId: 'catalog',
        resourceType: 'catalog-entity',
        actions: ['read'],
        roleEntityRef: oldRoleName,
        result: AuthorizeResult.CONDITIONAL,
        conditions: {
          rule: 'IS_ENTITY_OWNER',
          resourceType: 'catalog-entity',
          params: {
            claims: ['group:default/team-a'],
          },
        },
      };
      (
        conditionalStorageMock.filterConditions as jest.Mock
      ).mockReturnValueOnce([oldCondition]);
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(
          async (
            roleEntityRef: string,
            _trx: Knex.Knex.Transaction,
          ): Promise<RoleMetadataDao | undefined> => {
            if (roleEntityRef === oldRoleName) {
              return {
                source: 'rest',
                roleEntityRef: oldRoleName,
                author: modifiedBy,
                modifiedBy,
                description: 'Role for dev engineers',
                createdAt: '2024-03-01 00:23:41+00',
              };
            }
            return undefined;
          },
        );

      const secondGroupingPolicyWithOldRole = ['user:default/tim', oldRoleName];
      const policyWithOldRole = [
        oldRoleName,
        'catalog-entity',
        'delete',
        'allow',
      ];
      const expectedPolicies = [
        secondPolicy,
        [newRoleName, 'policy-entity', 'read', 'allow'],
        [newRoleName, 'catalog-entity', 'delete', 'allow'],
      ];

      const enfDelegate = await createEnfDelegate(
        [policy, secondPolicy, policyWithOldRole],
        [groupingPolicy, secondGroupingPolicy, secondGroupingPolicyWithOldRole],
      );

      const groupingPolicyWithRenamedRole = ['user:default/tom', newRoleName];
      const secondGroupingPolicyWithRenamedRole = [
        'user:default/tim',
        newRoleName,
      ];

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: newRoleName,
        source: 'rest',
        modifiedBy,
      };
      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy, secondGroupingPolicyWithOldRole],
        [groupingPolicyWithRenamedRole, secondGroupingPolicyWithRenamedRole],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(3);
      expect(storedPolicies[0]).toEqual(secondGroupingPolicy); // different role remained unchanged
      expect(storedPolicies[1]).toEqual(groupingPolicyWithRenamedRole);
      expect(storedPolicies[2]).toEqual(secondGroupingPolicyWithRenamedRole);

      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith([
        groupingPolicy,
        secondGroupingPolicyWithOldRole,
      ]);
      expect(enfAddGroupingPoliciesSpy).toHaveBeenCalledWith([
        groupingPolicyWithRenamedRole,
        secondGroupingPolicyWithRenamedRole,
      ]);

      const updatedCondition: RoleConditionalPolicyDecision<PermissionInfo> = (
        conditionalStorageMock.updateCondition as jest.Mock
      ).mock.calls[0][1];
      expect(updatedCondition).toEqual({
        ...oldCondition,
        roleEntityRef: newRoleName,
      });

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual(modifiedBy);
      expect(metadata.description).toEqual('Role for dev engineers');
      expect(metadata.modifiedBy).toEqual(modifiedBy);
      expect(metadata.roleEntityRef).toEqual(newRoleName);
      expect(metadata.source).toEqual('rest');
      expect(await enfDelegate.getPolicy()).toEqual(expectedPolicies);
    });

    it('should update grouping policies: should be updated role description and source', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(async (): Promise<RoleMetadataDao> => {
          return {
            source: 'legacy',
            roleEntityRef: 'role:default/dev-team',
            author: modifiedBy,
            description: 'Role for dev engineers',
            createdAt: '2024-03-01 00:23:41+00',
            modifiedBy,
          };
        });

      const enfDelegate = await createEnfDelegate([], [groupingPolicy]);

      const roleMetadataDao: RoleMetadataDao = {
        roleEntityRef: 'role:default/dev-team',
        source: 'rest',
        modifiedBy,
        description: 'some-new-description',
      };
      await enfDelegate.updateGroupingPolicies(
        [groupingPolicy],
        [groupingPolicy],
        roleMetadataDao,
      );

      const storedPolicies = await enfDelegate.getGroupingPolicy();
      expect(storedPolicies.length).toEqual(1);
      expect(storedPolicies).toEqual([groupingPolicy]);

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();
      expect(metadata.author).toEqual(modifiedBy);
      expect(metadata.description).toEqual('some-new-description');
      expect(metadata.modifiedBy).toEqual(modifiedBy);
      expect(metadata.roleEntityRef).toEqual('role:default/dev-team');
      expect(metadata.source).toEqual('rest');
    });
  });

  describe('updatePolicies', () => {
    it('should be updated single policy', async () => {
      const enfDelegate = await createEnfDelegate([policy]);
      enfAddPolicySpy.mockClear();
      enfRemovePoliciesSpy.mockClear();

      const newPolicy = ['user:default/tom', 'policy-entity', 'read', 'deny'];

      await enfDelegate.updatePolicies([policy], [newPolicy]);

      expect(enfRemovePoliciesSpy).toHaveBeenCalledWith([policy]);
      expect(enfAddPoliciesSpy).toHaveBeenCalledWith([newPolicy]);
    });

    it('should be added few policies', async () => {
      const enfDelegate = await createEnfDelegate([policy, secondPolicy]);
      enfAddPolicySpy.mockClear();
      enfRemovePoliciesSpy.mockClear();

      const newPolicy1 = ['user:default/tom', 'policy-entity', 'read', 'deny'];
      const newPolicy2 = [
        'user:default/tim',
        'catalog-entity',
        'write',
        'allow',
      ];

      await enfDelegate.updatePolicies(
        [policy, secondPolicy],
        [newPolicy1, newPolicy2],
      );

      expect(enfRemovePoliciesSpy).toHaveBeenCalledWith([policy, secondPolicy]);
      expect(enfAddPoliciesSpy).toHaveBeenCalledWith([newPolicy1, newPolicy2]);
    });
  });

  describe('removePolicy', () => {
    const policyToDelete = [
      'user:default/some-user',
      'catalog-entity',
      'read',
      'allow',
    ];

    it('policy should be removed', async () => {
      const enfDelegate = await createEnfDelegate([policyToDelete]);
      await enfDelegate.removePolicy(policyToDelete);

      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...policyToDelete);
    });
  });

  describe('removePolicies', () => {
    const policiesToDelete = [
      ['user:default/some-user', 'catalog-entity', 'read', 'allow'],
      ['user:default/some-user-2', 'catalog-entity', 'read', 'allow'],
    ];
    it('policies should be removed', async () => {
      const enfDelegate = await createEnfDelegate(policiesToDelete);
      await enfDelegate.removePolicies(policiesToDelete);

      expect(enfRemovePoliciesSpy).toHaveBeenCalledWith(policiesToDelete);
    });
  });

  describe('removeGroupingPolicy', () => {
    const groupingPolicyToDelete = [
      'user:default/some-user',
      'role:default/team-dev',
    ];

    beforeEach(() => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/team-dev',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });
    });

    it('should remove grouping policy and remove role metadata', async () => {
      const enfDelegate = await createEnfDelegate([], [groupingPolicyToDelete]);
      await enfDelegate.removeGroupingPolicy(
        groupingPolicyToDelete,
        { source: 'rest', roleEntityRef: 'role:default/team-dev', modifiedBy },
        false,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).toHaveBeenCalledTimes(1);
      expect(adapterLoaderFilterGroupingPolicySpy).toHaveBeenCalledTimes(1);

      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/team-dev',
        expect.anything(),
      );
    });

    it('should remove grouping policy and update role metadata', async () => {
      const enfDelegate = await createEnfDelegate(
        [],
        [
          groupingPolicyToDelete,
          ['group:default/team-a', 'role:default/team-dev'],
        ],
      );
      await enfDelegate.removeGroupingPolicy(
        groupingPolicyToDelete,
        { source: 'rest', roleEntityRef: 'role:default/team-dev', modifiedBy },
        false,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).toHaveBeenCalledTimes(1);
      expect(adapterLoaderFilterGroupingPolicySpy).toHaveBeenCalledTimes(1);

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();

      expect(metadata.roleEntityRef).toEqual('role:default/team-dev');
      expect(metadata.source).toEqual('rest');
    });

    it('should remove grouping policy and not update or remove role metadata, because isUpdate flag set to true', async () => {
      const enfDelegate = await createEnfDelegate([], [groupingPolicyToDelete]);
      await enfDelegate.removeGroupingPolicy(
        groupingPolicyToDelete,
        {
          source: 'rest',
          roleEntityRef: 'role:default/dev-team',
          modifiedBy: 'user:default/some-user',
        },
        true,
      );

      expect(enfRemoveGroupingPolicySpy).toHaveBeenCalledWith(
        ...groupingPolicyToDelete,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).not.toHaveBeenCalled();
      expect(adapterLoaderFilterGroupingPolicySpy).not.toHaveBeenCalled();
      expect(roleMetadataStorageMock.removeRoleMetadata).not.toHaveBeenCalled();
      expect(roleMetadataStorageMock.updateRoleMetadata).not.toHaveBeenCalled();
    });
  });

  describe('removeGroupingPolicies', () => {
    const groupingPoliciesToDelete = [
      ['user:default/some-user', 'role:default/team-dev'],
      ['group:default/team-a', 'role:default/team-dev'],
    ];

    it('should remove grouping policies and remove role metadata', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/team-dev',
          };
        });
      enfRemoveGroupingPoliciesSpy.mockReset();
      adapterLoaderFilterGroupingPolicySpy.mockReset();

      const enfDelegate = await createEnfDelegate([], groupingPoliciesToDelete);
      await enfDelegate.removeGroupingPolicies(
        groupingPoliciesToDelete,
        {
          roleEntityRef: 'role:default/team-dev',
          source: 'rest',
          modifiedBy,
        },
        false,
      );

      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith(
        groupingPoliciesToDelete,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).toHaveBeenCalledTimes(1);
      expect(adapterLoaderFilterGroupingPolicySpy).toHaveBeenCalledTimes(1);

      expect(roleMetadataStorageMock.removeRoleMetadata).toHaveBeenCalledWith(
        'role:default/team-dev',
        expect.anything(),
      );
    });

    it('should remove grouping policies and update role metadata', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/team-dev',
            createdAt: '2024-03-01 00:23:41+00',
          };
        });
      enfRemoveGroupingPoliciesSpy.mockReset();
      adapterLoaderFilterGroupingPolicySpy.mockReset();

      const remainingGroupPolicy = [
        'user:default/some-user-2',
        'role:default/team-dev',
      ];
      const enfDelegate = await createEnfDelegate(
        [],
        [...groupingPoliciesToDelete, remainingGroupPolicy],
      );
      await enfDelegate.removeGroupingPolicies(
        groupingPoliciesToDelete,
        {
          roleEntityRef: 'role:default/team-dev',
          source: 'rest',
          modifiedBy,
        },
        false,
      );

      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith(
        groupingPoliciesToDelete,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).toHaveBeenCalledTimes(1);
      expect(adapterLoaderFilterGroupingPolicySpy).toHaveBeenCalledTimes(1);

      const metadata = (roleMetadataStorageMock.updateRoleMetadata as jest.Mock)
        .mock.calls[0][0];

      const createdAtData = new Date(`${metadata.createdAt}`);
      const lastModified = new Date(`${metadata.lastModified}`);
      expect(lastModified > createdAtData).toBeTruthy();

      expect(metadata.roleEntityRef).toEqual('role:default/team-dev');
      expect(metadata.source).toEqual('rest');
    });

    it('should remove grouping policy and not update or remove role metadata, because isUpdate flag set to true', async () => {
      roleMetadataStorageMock.findRoleMetadata = jest
        .fn()
        .mockImplementation(() => {
          return {
            source: 'rest',
            roleEntityRef: 'role:default/team-dev',
          };
        });
      enfRemoveGroupingPoliciesSpy.mockReset();
      adapterLoaderFilterGroupingPolicySpy.mockReset();

      const enfDelegate = await createEnfDelegate([], groupingPoliciesToDelete);
      await enfDelegate.removeGroupingPolicies(
        groupingPoliciesToDelete,
        {
          roleEntityRef: 'role:default/team-dev',
          source: 'rest',
          modifiedBy: 'user:default/test-user',
        },
        true,
      );

      expect(enfRemoveGroupingPoliciesSpy).toHaveBeenCalledWith(
        groupingPoliciesToDelete,
      );

      expect(roleMetadataStorageMock.findRoleMetadata).not.toHaveBeenCalled();
      expect(adapterLoaderFilterGroupingPolicySpy).not.toHaveBeenCalled();
      expect(roleMetadataStorageMock.removeRoleMetadata).not.toHaveBeenCalled();
      expect(roleMetadataStorageMock.updateRoleMetadata).not.toHaveBeenCalled();
    });
  });
});
