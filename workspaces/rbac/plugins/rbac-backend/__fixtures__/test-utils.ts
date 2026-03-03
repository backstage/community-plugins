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
  Adapter,
  Enforcer,
  Model,
  newEnforcer,
  newModelFromString,
} from 'casbin';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';

import { CasbinDBAdapterFactory } from '../src/database/casbin-adapter-factory';
import { RoleMetadataStorage } from '../src/database/role-metadata';
import { RBACPermissionPolicy } from '../src/policies/permission-policy';
import { BackstageRoleManager } from '../src/role-manager/role-manager';
import { EnforcerDelegate } from '../src/service/enforcer-delegate';
import { MODEL } from '../src/service/permission-model';
import { PluginPermissionMetadataCollector } from '../src/service/plugin-endpoints';
import {
  mockAuditorService,
  conditionalStorageMock,
  csvPermFile,
  mockAuthService,
  mockClientKnex,
  pluginMetadataCollectorMock,
  roleMetadataStorageMock,
} from './mock-utils';
import { clearAuditorMock } from './auditor-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { USERS_FOR_TEST } from './data/hierarchy/users';
import {
  Entity,
  GroupEntityV1alpha1,
  UserEntityV1alpha1,
} from '@backstage/catalog-model';
import { GROUPS_FOR_TESTS } from './data/hierarchy/groups';

export function newConfig(
  permFile?: string,
  users?: Array<{ name: string }>,
  superUsers?: Array<{ name: string }>,
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
          policyFileReload: true,
          admin: {
            users: users || testUsers,
            superUsers: superUsers,
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

export async function newAdapter(config: Config): Promise<Adapter> {
  return await new CasbinDBAdapterFactory(
    config,
    mockClientKnex,
  ).createAdapter();
}

export async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  logger: LoggerService,
  config: Config,
): Promise<Enforcer> {
  const catalogDBClient = Knex.knex({ client: MockClient });
  const rbacDBClient = Knex.knex({ client: MockClient });
  const enf = await newEnforcer(theModel, adapter);

  const rm = new BackstageRoleManager(
    catalogServiceMock.mock(),
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

export async function newEnforcerDelegate(
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

export async function newPermissionPolicy(
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

export function convertGroupsToEntity(
  groups?: {
    name: string;
    namespace?: string | null;
    title: string;
    children: never[];
    parent: string | null;
    hasMember: string[];
  }[],
): Entity[] {
  const groupsForTests = groups ?? GROUPS_FOR_TESTS;
  const groupsMocked = groupsForTests.map(group => {
    const entityMock: GroupEntityV1alpha1 = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: {
        name: group.name,
        namespace: group.namespace ?? 'default',
        title: group.title,
      },
      spec: {
        children: group.children,
        parent: group.parent!,
        type: 'team',
      },
      relations: [
        ...group.hasMember.map(member => ({
          type: 'hasMember',
          targetRef: member,
        })),
      ],
    };
    return entityMock;
  });
  return groupsMocked;
}

export function convertUsersToEntity(): Entity[] {
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
      relations: user.memberOf.map(member => ({
        type: 'memberOf',
        targetRef: member,
      })),
    };
    return entityMock;
  });
  return usersMocked;
}
