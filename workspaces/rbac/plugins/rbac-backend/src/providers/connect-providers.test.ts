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
  Adapter,
  Enforcer,
  Model,
  newEnforcer,
  newModelFromString,
} from 'casbin';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';

import type {
  RBACProvider,
  RBACProviderConnection,
} from '@backstage-community/plugin-rbac-node';

import { CasbinDBAdapterFactory } from '../database/casbin-adapter-factory';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from '../service/enforcer-delegate';
import { MODEL } from '../service/permission-model';
import { Connection, connectRBACProviders } from './connect-providers';
import { mockAuditorService } from '../../__fixtures__/mock-utils';
import {
  clearAuditorMock,
  expectAuditorLog,
} from '../../__fixtures__/auditor-test-utils';
import { ActionType, PermissionEvents } from '../auditor/auditor';
import { conditionalStorageMock } from '../../__fixtures__/mock-utils';

const mockLoggerService = mockServices.logger.mock();

const roleMetadataStorageMock: RoleMetadataStorage = {
  filterRoleMetadata: jest
    .fn()
    .mockImplementation(
      async (
        _roleEntityRef: string,
        _trx: Knex.Knex.Transaction,
      ): Promise<RoleMetadataDao[]> => {
        return [
          {
            roleEntityRef: 'role:default/old-provider-role',
            source: 'test',
            modifiedBy: 'test',
          },
          {
            roleEntityRef: 'role:default/existing-provider-role',
            source: 'test',
            modifiedBy: 'test',
          },
        ];
      },
    ),
  findRoleMetadata: jest
    .fn()
    .mockImplementation(
      async (
        roleEntityRef: string,
        _trx: Knex.Knex.Transaction,
      ): Promise<RoleMetadataDao | undefined> => {
        if (roleEntityRef === 'role:default/old-provider-role') {
          return {
            roleEntityRef: 'role:default/old-provider-role',
            source: 'test',
            modifiedBy: 'test',
          };
        } else if (roleEntityRef === 'role:default/existing-provider-role') {
          return {
            roleEntityRef: 'role:default/existing-provider-role',
            source: 'test',
            modifiedBy: 'test',
          };
        } else if (roleEntityRef === 'role:default/csv-role') {
          return {
            roleEntityRef: 'role:default/csv-role',
            source: 'csv-file',
            modifiedBy: 'csv-file',
          };
        }
        return undefined;
      },
    ),
  filterForOwnerRoleMetadata: jest.fn().mockImplementation(),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
};

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

const mockAuthService = mockServices.auth();

const mockClientKnex = Knex.knex({ client: MockClient });

const providerMock: RBACProvider = {
  getProviderName: jest.fn().mockImplementation(),
  connect: jest.fn().mockImplementation(),
  refresh: jest.fn().mockImplementation(),
};

const roleToBeRemoved = ['user:default/old', 'role:default/old-provider-role'];
const roleMetaToBeRemoved = {
  modifiedBy: 'test',
  source: 'test',
  roleEntityRef: roleToBeRemoved[1],
};

const existingRoles = [
  ['user:default/bruce', 'role:default/existing-provider-role'],
  ['user:default/tony', 'role:default/existing-provider-role'],
];
const existingRoleMetadata = {
  modifiedBy: 'test',
  source: 'test',
  roleEntityRef: existingRoles[0][1],
};
const existingPolicy = [
  ['role:default/existing-provider-role', 'catalog-entity', 'read', 'allow'],
];

const config = mockServices.rootConfig({
  data: {
    permission: {
      rbac: {},
    },
    backend: {
      database: {
        client: 'better-sqlite3',
        connection: ':memory:',
      },
    },
  },
});

describe('Connection', () => {
  let provider: Connection;
  let enforcerDelegate: EnforcerDelegate;

  beforeEach(async () => {
    const id = 'test';
    const adapter = await new CasbinDBAdapterFactory(
      config,
      mockClientKnex,
    ).createAdapter();

    const stringModel = newModelFromString(MODEL);
    const enf = await createEnforcer(stringModel, adapter, mockLoggerService);

    const knex = Knex.knex({ client: MockClient });

    enforcerDelegate = new EnforcerDelegate(
      enf,
      mockAuditorService,
      conditionalStorageMock,
      roleMetadataStorageMock,
      knex,
    );

    await enforcerDelegate.addGroupingPolicy(
      roleToBeRemoved,
      roleMetaToBeRemoved,
    );

    await enforcerDelegate.addGroupingPolicies(
      existingRoles,
      existingRoleMetadata,
    );

    await enforcerDelegate.addPolicies(existingPolicy);

    provider = new Connection(
      id,
      enforcerDelegate,
      roleMetadataStorageMock,
      mockLoggerService,
      mockAuditorService,
    );

    clearAuditorMock();
  });

  it('should initialize', () => {
    expect(provider).toBeDefined();
  });

  describe('applyRoles', () => {
    let enfAddGroupingPolicySpy: jest.SpyInstance<
      Promise<void>,
      [
        policy: string[],
        roleMetadata: RoleMetadataDao,
        externalTrx?: Knex.Knex.Transaction<any, any[]> | undefined,
      ],
      any
    >;
    let enfRemoveGroupingPolicySpy: jest.SpyInstance<
      Promise<void>,
      [
        policy: string[],
        roleMetadata: RoleMetadataDao,
        isUpdate?: boolean | undefined,
        externalTrx?: Knex.Knex.Transaction<any, any[]> | undefined,
      ],
      any
    >;

    afterEach(() => {
      (mockLoggerService.warn as jest.Mock).mockReset();
    });

    it('should add the new roles', async () => {
      enfAddGroupingPolicySpy = jest.spyOn(
        enforcerDelegate,
        'addGroupingPolicy',
      );

      const roles = [
        ['user:default/test', 'role:default/test-provider'], // to add
        ['user:default/bruce', 'role:default/existing-provider-role'],
        ['user:default/tony', 'role:default/existing-provider-role'],
        ['user:default/Adam', 'role:default/test-provider'], // to add
      ];

      const roleMeta = {
        createdAt: new Date().toUTCString(),
        lastModified: new Date().toUTCString(),
        modifiedBy: 'test',
        source: 'test',
        roleEntityRef: roles[0][1],
      };

      await provider.applyRoles(roles);
      expect(enfAddGroupingPolicySpy).toHaveBeenNthCalledWith(
        1,
        ['user:default/test', 'role:default/test-provider'],
        roleMeta,
      );
      expect(enfAddGroupingPolicySpy).toHaveBeenNthCalledWith(
        2,
        ['user:default/adam', 'role:default/test-provider'],
        roleMeta,
      );
    });

    it('should remove the old roles', async () => {
      enfRemoveGroupingPolicySpy = jest.spyOn(
        enforcerDelegate,
        'removeGroupingPolicy',
      );

      await provider.applyRoles([
        ['user:default/bruce', 'role:default/existing-provider-role'],
        ['user:default/tony', 'role:default/existing-provider-role'],
      ]);
      expect(enfRemoveGroupingPolicySpy).toHaveBeenCalledWith(
        roleToBeRemoved,
        roleMetaToBeRemoved,
        false,
      );
    });

    it('should add a role to an already existing role', async () => {
      enfAddGroupingPolicySpy = jest.spyOn(
        enforcerDelegate,
        'addGroupingPolicy',
      );

      const roles = [
        ['user:default/peter', 'role:default/existing-provider-role'],
        ['user:default/bruce', 'role:default/existing-provider-role'],
        ['user:default/tony', 'role:default/existing-provider-role'],
      ];

      const roleToAdd = [
        ['user:default/peter', 'role:default/existing-provider-role'],
      ];
      const roleMeta = {
        modifiedBy: 'test',
        source: 'test',
        roleEntityRef: roleToAdd[0][1],
      };

      await provider.applyRoles(roles);
      expect(enfAddGroupingPolicySpy).toHaveBeenCalledWith(
        ...roleToAdd,
        roleMeta,
      );
    });

    it('should remove a role member from an already existing role', async () => {
      enfRemoveGroupingPolicySpy = jest.spyOn(
        enforcerDelegate,
        'removeGroupingPolicy',
      );

      await provider.applyRoles([
        ['user:default/tony', 'role:default/existing-provider-role'],
      ]);
      expect(enfRemoveGroupingPolicySpy).toHaveBeenNthCalledWith(
        1,
        roleToBeRemoved,
        roleMetaToBeRemoved,
        false,
      );
      expect(enfRemoveGroupingPolicySpy).toHaveBeenNthCalledWith(
        2,
        existingRoles[0],
        existingRoleMetadata,
        true,
      );
    });

    it('should log an error if a role is not valid', async () => {
      const roles = [
        ['user:default/test', 'role:default/'],
        ['user:default/bruce', 'role:default/existing-provider-role'],
        ['user:default/tony', 'role:default/existing-provider-role'],
      ];

      const roleToAdd = `user:default/test,role:default/`;

      await provider.applyRoles(roles);
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        `Failed to validate group policy ${roleToAdd}. Cause: Entity reference "role:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      );
    });

    it('should still add new role, even if there is an invalid role in array', async () => {
      enfAddGroupingPolicySpy = jest.spyOn(
        enforcerDelegate,
        'addGroupingPolicy',
      );

      const roles = [
        ['user:default/test', 'role:default/'],
        ['user:default/test', 'role:default/test-provider'],
        ['user:default/bruce', 'role:default/existing-provider-role'],
        ['user:default/tony', 'role:default/existing-provider-role'],
      ];

      const failingRoleToAdd = `user:default/test,role:default/`;
      const roleToAdd = [['user:default/test', 'role:default/test-provider']];
      const roleMeta = {
        createdAt: new Date().toUTCString(),
        lastModified: new Date().toUTCString(),
        modifiedBy: 'test',
        source: 'test',
        roleEntityRef: roleToAdd[0][1],
      };

      await provider.applyRoles(roles);
      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        `Failed to validate group policy ${failingRoleToAdd}. Cause: Entity reference "role:default/" was not on the form [<kind>:][<namespace>/]<name>`,
      );
      expect(enfAddGroupingPolicySpy).toHaveBeenCalledWith(
        ...roleToAdd,
        roleMeta,
      );
    });
  });

  describe('applyPermissions', () => {
    let enfAddPolicySpy: jest.SpyInstance<
      Promise<void>,
      [
        policy: string[],
        externalTrx?: Knex.Knex.Transaction<any, any[]> | undefined,
      ],
      any
    >;
    let enfRemovePolicySpy: jest.SpyInstance<
      Promise<void>,
      [
        policy: string[],
        externalTrx?: Knex.Knex.Transaction<any, any[]> | undefined,
      ],
      any
    >;

    afterEach(() => {
      (mockLoggerService.warn as jest.Mock).mockReset();
    });

    it('should add new permissions', async () => {
      enfAddPolicySpy = jest.spyOn(enforcerDelegate, 'addPolicy');

      const policies = [
        ['role:default/provider-role', 'catalog-entity', 'read', 'allow'],
      ];

      await provider.applyPermissions(policies);
      expect(enfAddPolicySpy).toHaveBeenCalledWith(...policies);
    });

    // TODO: Temporary workaround to prevent breakages after the removal of the resource type `policy-entity` from the permission `policy.entity.create`
    it('should add new permissions but log warning about `policy-entity, create` permission', async () => {
      enfAddPolicySpy = jest.spyOn(enforcerDelegate, 'addPolicy');

      const policies = [
        ['role:default/provider-role', 'policy-entity', 'create', 'allow'],
      ];

      await provider.applyPermissions(policies);
      expect(enfAddPolicySpy).toHaveBeenCalledWith(...policies);
      expect(mockLoggerService.warn).toHaveBeenNthCalledWith(
        1,
        `Permission policy with resource type 'policy-entity' and action 'create' has been removed. Please consider updating policy ${policies[0]} to use 'policy.entity.create' instead of 'policy-entity' from source test`,
      );
    });

    it('should remove old permissions', async () => {
      enfRemovePolicySpy = jest.spyOn(enforcerDelegate, 'removePolicy');

      const policies = [
        ['role:default/provider-role', 'catalog-entity', 'read', 'allow'],
      ];

      await provider.applyPermissions(policies);
      expect(enfRemovePolicySpy).toHaveBeenCalledWith(...existingPolicy);
    });

    it('should audit log an error for an invalid permission', async () => {
      enfAddPolicySpy = jest.spyOn(enforcerDelegate, 'addPolicy');

      const policies = [
        ...existingPolicy,
        ['role:default/provider-role', 'catalog-entity', 'read', 'temp'],
      ];

      await provider.applyPermissions(policies);
      expectAuditorLog([
        {
          event: {
            eventId: PermissionEvents.POLICY_WRITE,
            meta: { actionType: ActionType.CREATE, source: 'test' },
          },
          fail: {
            error: new Error(
              `'effect' has invalid value: 'temp'. It should be: 'allow' or 'deny'`,
            ),
            meta: {
              policies: [policies[1]],
            },
          },
        },
      ]);
    });

    it('should audit log an error for an invalid permission by source', async () => {
      enfAddPolicySpy = jest.spyOn(enforcerDelegate, 'addPolicy');

      const policies = [
        ...existingPolicy,
        ['role:default/csv-role', 'catalog-entity', 'read', 'allow'],
      ];

      await provider.applyPermissions(policies);
      expectAuditorLog([
        {
          event: {
            eventId: PermissionEvents.POLICY_WRITE,
            meta: { actionType: ActionType.CREATE, source: 'test' },
          },
          fail: {
            error: new Error(
              `source does not match originating role role:default/csv-role, consider making changes to the 'CSV-FILE'`,
            ),
            meta: {
              policies: [policies[1]],
            },
          },
        },
      ]);
    });

    it('should still add new permission, even if there is an invalid permission in array', () => {
      expect('').toEqual('');
    });
  });
});

describe('connectRBACProviders', () => {
  let connectSpy: jest.SpyInstance<
    Promise<void>,
    [connection: RBACProviderConnection],
    any
  >;
  it('should initialize rbac providers', async () => {
    connectSpy = jest.spyOn(providerMock, 'connect');

    const adapter = await new CasbinDBAdapterFactory(
      config,
      mockClientKnex,
    ).createAdapter();

    const stringModel = newModelFromString(MODEL);
    const enf = await createEnforcer(stringModel, adapter, mockLoggerService);

    const knex = Knex.knex({ client: MockClient });

    const enforcerDelegate = new EnforcerDelegate(
      enf,
      mockAuditorService,
      conditionalStorageMock,
      roleMetadataStorageMock,
      knex,
    );

    await connectRBACProviders(
      [providerMock],
      enforcerDelegate,
      roleMetadataStorageMock,
      mockLoggerService,
      mockAuditorService,
    );

    expect(connectSpy).toHaveBeenCalled();
  });
});

async function createEnforcer(
  theModel: Model,
  adapter: Adapter,
  logger: LoggerService,
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
