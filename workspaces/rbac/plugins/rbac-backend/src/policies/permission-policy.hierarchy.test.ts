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
import {
  GroupEntityV1alpha1,
  parseEntityRef,
  UserEntityV1alpha1,
} from '@backstage/catalog-model';
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

import { resolve } from 'path';

import { GROUPS_FOR_TESTS } from '../../__fixtures__/data/hierarchy/groups';
import { USERS_FOR_TEST } from '../../__fixtures__/data/hierarchy/users';
import {
  mockAuditorService,
  catalogApiMock,
  conditionalStorageMock,
  csvPermFile,
  mockAuthService,
  mockClientKnex,
  pluginMetadataCollectorMock,
  roleMetadataStorageMock,
} from '../../__fixtures__/mock-utils';
import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import { RoleMetadataStorage } from '../database/role-metadata';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import { PluginPermissionMetadataCollector } from '../service/plugin-endpoints';
import { RBACPermissionPolicy } from './permission-policy';
import {
  clearAuditorMock,
  expectAuditorLogForPermission,
} from '../../__fixtures__/auditor-test-utils';

type PermissionAction = 'create' | 'read' | 'update' | 'delete';

/**
 * Group, user, role, and permission information can be found under `__fixtures__/data/hierarchy/`
 * More information can be found at `examples/manual-tests/rbac` at the root of the workspace
 * Included is a txt file with charts for the hierarchy levels for visualization
 */
describe('Policy checks for users and groups', () => {
  let policy: RBACPermissionPolicy;
  const testUsers = convertUsersToEntity();
  const testGroups = convertGroupsToEntity();

  beforeEach(async () => {
    catalogApiMock.getEntities.mockImplementation((arg: any) => {
      const hasMember = arg.filter['relations.hasMember'];
      if (hasMember) {
        const filtered = testGroups.filter(group => {
          const foundUser = testUsers.find(
            user => user.metadata.name === parseEntityRef(hasMember).name,
          );
          return foundUser?.spec.memberOf?.includes(group.metadata.name);
        });
        return { items: filtered };
      }
      return { items: testGroups };
    });

    const policyChecksCSV = resolve(
      __dirname,
      '../../__fixtures__/data/hierarchy/rbac-policy.csv',
    );
    const config = newConfig(policyChecksCSV);
    const adapter = await newAdapter(config);

    const enfDelegate = await newEnforcerDelegate(adapter, config);

    policy = await newPermissionPolicy(config, enfDelegate);
  });

  afterEach(() => {
    (catalogApiMock.getEntities as jest.Mock).mockReset();
  });

  // Simple user to role tests
  it('case 1, user directly assigned to allow role', async () => {
    const userEntity = 'user:default/ant_man';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('case 2, user directly assigned to deny role', async () => {
    const userEntity = 'user:default/hulk';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Simple group to role tests
  it('case 3, group assigned to allow role', async () => {
    const userEntity = 'user:default/thor';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('case 4, group assigned to deny role', async () => {
    const userEntity = 'user:default/wasp';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Group hierarchy tests with a two level hierarchy
  it('case 5, group hierarchy test where furthest group is assigned to allow role', async () => {
    const userEntity = 'user:default/moon_knight';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('case 6, group hierarchy test where furthest group is assigned to deny role', async () => {
    const userEntity = 'user:default/spiderman';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 7, group hierarchy test where the closest group is assigned allow role, furthest group is assigned allow role', async () => {
    const userEntity = 'user:default/captain_america';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('case 8, group hierarchy test where the closest group is assigned deny role, furthest group is assigned deny role', async () => {
    const userEntity = 'user:default/hawkeye';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 9, group hierarchy test where the closest group is assigned deny role, furthest group is assigned allow role', async () => {
    const userEntity = 'user:default/quicksilver';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 10, group hierarchy test where the closest group is assigned allow role, furthest group is assigned deny role', async () => {
    const userEntity = 'user:default/scarlet_witch';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Branching tests
  it('case 11, branching test where user is directly assigned to allow role and group is directly assigned to allow role', async () => {
    const userEntity = 'user:default/swordsman';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('case 12, branching test where user is directly assigned to deny role and group is directly assigned to deny role', async () => {
    const userEntity = 'user:default/hercules';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 13, branching test where user is directly assigned to deny role and group is directly assigned to allow role', async () => {
    const userEntity = 'user:default/black_panther';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 14, branching test where user is directly assigned to allow role and group is directly assigned to deny role', async () => {
    const userEntity = 'user:default/vision';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Branching tests with group role assignment
  it('case 15, branching test where top group assigned to allow role and right group is assigned to allow role', async () => {
    const userEntity = 'user:default/black_knight';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('case 16, branching test where top group assigned to deny role and right group is assigned to deny role', async () => {
    const userEntity = 'user:default/black_widow';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 17, branching test where top group assigned to deny role and right group is assigned to allow role', async () => {
    const userEntity = 'user:default/mantis';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 18, branching test where top group assigned to allow role and right group is assigned to deny role', async () => {
    const userEntity = 'user:default/beast';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Branching tests with two level group role assignment
  it('case 19, branching test where fruthest top group assigned to allow role and furthest right group is assigned to allow role', async () => {
    const userEntity = 'user:default/moondragon';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('case 20, branching test where fruthest top group assigned to deny role and furthest right group is assigned to deny role', async () => {
    const userEntity = 'user:default/hellcat';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 21, branching test where fruthest top group assigned to deny role and furthest right group is assigned to allow role', async () => {
    const userEntity = 'user:default/captain_marvel';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 22, branching test where fruthest top group assigned to allow role and furthest right group is assigned to deny role', async () => {
    const userEntity = 'user:default/falcon';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Group hierarchy with cyclic behavior
  // TODO: get the logger for all cyclic behavior tests
  it('case 23, cyclic behavior between two groups with one group assigned to allow role', async () => {
    const userEntity = 'user:default/wonder_man';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 24, cyclic behavior between two groups with one group assigned to deny role', async () => {
    const userEntity = 'user:default/tigra';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Branching tests with cyclic behavior
  it('case 25, branching test where closest group is assigned to allow role and cyclic behavior between two groups with one group assigned to allow role', async () => {
    const userEntity = 'user:default/she_hulk';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 26, branching test where closest group is assigned to deny role and cyclic behavior between two groups with one group assigned to deny role', async () => {
    const userEntity = 'user:default/starfox';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 27, branching test where closest group is assigned to deny role and cyclic behavior between two groups with one group assigned to allow role', async () => {
    const userEntity = 'user:default/mockingbird';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 28, branching test where closest group is assigned to allow role and cyclic behavior between two groups with one group assigned to deny role', async () => {
    const userEntity = 'user:default/war_machine';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Branching tests with two level group hierarchy and both branches have cyclic behavior
  it('case 29, branching test where top group is assigned to allow role and right group is assigned allow role, both branches have cyclic behavior', async () => {
    const userEntity = 'user:default/namor';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 30, branching test where top group is assigned to deny role and right group is assigned deny role, both branches have cyclic behavior', async () => {
    const userEntity = 'user:default/thing';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 31, branching test where top group is assigned to deny role and right group is assigned allow role, both branches have cyclic behavior', async () => {
    const userEntity = 'user:default/doctor_druid';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 32, branching test where top group is assigned to allow role and right group is assigned deny role, both branches have cyclic behavior', async () => {
    const userEntity = 'user:default/firebird';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Branching tests with two level group hierarchy and cyclic behavior
  it('case 33, branching test where top group is assigned to allow role and right group is assigned allow role, right branch has cyclic behavior', async () => {
    const userEntity = 'user:default/valkyrie';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 34, branching test where top group is assigned to deny role and right group is assigned deny role, right branch has cyclic behavior', async () => {
    const userEntity = 'user:default/nova';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 35, branching test where top group is assigned to deny role and right group is assigned allow role, right branch has cyclic behavior', async () => {
    const userEntity = 'user:default/storm';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  it('case 36, branching test where top group is assigned to allow role and right group is assigned deny role, right branch has cyclic behavior', async () => {
    const userEntity = 'user:default/daredevil';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Simple user to role tests
  it('case 37, user directly assigned to allow permission', async () => {
    const userEntity = 'user:default/psylocke';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('case 38, user directly assigned to deny permission', async () => {
    const userEntity = 'user:default/penance';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Simple group to role tests
  it('case 39, group assigned to allow permission', async () => {
    const userEntity = 'user:default/cable';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  it('case 40, group assigned to deny permission', async () => {
    const userEntity = 'user:default/ghost_rider';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.DENY);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.DENY,
    );
  });

  // Admin test
  it('case 37, user directly assigned to admin role through config', async () => {
    const userEntity = 'user:default/admin';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  // Admin test
  it('case 37, group directly assigned to admin role through config', async () => {
    const userEntity = 'user:default/admin_one';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });

  // Super user test
  it('case 37, super user assigned to superUsers through config', async () => {
    const userEntity = 'user:default/super_user';
    const decision = await policy.handle(
      newPolicyQueryWithResourcePermission(
        'catalog.entity.read',
        'catalog-entity',
        'read',
      ),
      newPolicyQueryUser(userEntity),
    );
    expect(decision.result).toBe(AuthorizeResult.ALLOW);
    expectAuditorLogForPermission(
      userEntity,
      'catalog.entity.read',
      'catalog-entity',
      'read',
      AuthorizeResult.ALLOW,
    );
  });
});

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

function newConfig(permFile?: string): Config {
  const adminUsers = [
    {
      name: 'user:default/admin',
    },
    {
      name: 'group:default/admin',
    },
  ];

  const superUser = [
    {
      name: 'user:default/super_user',
    },
  ];

  return mockServices.rootConfig({
    data: {
      permission: {
        rbac: {
          'policies-csv-file': permFile || csvPermFile,
          policyFileReload: false,
          admin: {
            users: adminUsers,
            superUsers: superUser,
          },
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

function convertGroupsToEntity(): GroupEntityV1alpha1[] {
  const groupsMocked = GROUPS_FOR_TESTS.map(group => {
    const entityMock: GroupEntityV1alpha1 = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: {
        name: group.name,
        namespace: 'default',
        title: group.title,
      },
      spec: {
        children: group.children,
        parent: group.parent!,
        type: 'team',
      },
    };
    return entityMock;
  });
  return groupsMocked;
}

function convertUsersToEntity(): UserEntityV1alpha1[] {
  const usersMocked = USERS_FOR_TEST.map(user => {
    const entityMock: UserEntityV1alpha1 = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: user.name,
        namespace: 'default',
      },
      spec: {
        memberOf: user.memberOf,
        profile: {
          displayName: user.displayName,
          email: user.email,
        },
      },
    };
    return entityMock;
  });
  return usersMocked;
}
