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
import {
  mockCredentials,
  mockServices,
  ServiceMock,
} from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { AuditorService } from '@backstage/backend-plugin-api';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import type { Enforcer } from 'casbin';
import * as Knex from 'knex';
import { createTracker, MockClient } from 'knex-mock-client';
import { resolve } from 'path';

import type { RBACProvider } from '@backstage-community/plugin-rbac-node';

import type { CasbinKnexAdapter } from '../src/database/casbin-knex-adapter';
import { ConditionalStorage } from '../src/database/conditional-storage';
import { RoleMetadataStorage } from '../src/database/role-metadata';
import {
  EnforcerDelegate,
  RoleEventEmitter,
  RoleEvents,
} from '../src/service/enforcer-delegate';
import { PluginPermissionMetadataCollector } from '../src/service/plugin-endpoints';
import { PermissionDependentPluginStore } from '../src/database/extra-permission-enabled-plugins-storage';
import { ExtendablePluginIdProvider } from '../src/service/extendable-id-provider';
import { convertGroupsToEntity, convertUsersToEntity } from './test-utils';

export const conditionalStorageMock: ConditionalStorage = {
  filterConditions: jest.fn().mockImplementation(() => []),
  createCondition: jest.fn().mockImplementation(),
  checkConflictedConditions: jest.fn().mockImplementation(),
  getCondition: jest.fn().mockImplementation(),
  deleteCondition: jest.fn().mockImplementation(),
  updateCondition: jest.fn().mockImplementation(),
};

export const roleMetadataStorageMock: RoleMetadataStorage = {
  filterRoleMetadata: jest.fn().mockImplementation(() => []),
  filterForOwnerRoleMetadata: jest.fn().mockImplementation(),
  findRoleMetadata: jest.fn().mockImplementation(),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
  getCachedDefaultRoleMetadata: jest.fn().mockImplementation(() => undefined),
  getDefaultRole: jest.fn().mockResolvedValue(undefined),
  syncDefaultRoleMetadata: jest.fn().mockResolvedValue(undefined),
};

export const pluginMetadataCollectorMock: Partial<PluginPermissionMetadataCollector> =
  {
    getPluginConditionRules: jest.fn().mockImplementation(),
    getPluginPolicies: jest.fn().mockImplementation(),
    getMetadataByPluginId: jest.fn().mockImplementation(),
  };

export const permissionDependentPluginStoreMock: PermissionDependentPluginStore =
  {
    getPlugins: jest
      .fn()
      .mockImplementation(async () => [
        { pluginId: 'jenkins' },
        { pluginId: 'sonarqube' },
      ]),
    addPlugins: jest.fn().mockImplementation(),
    deletePlugins: jest.fn().mockImplementation(),
  };

export const pluginIdProviderMock = {
  getPluginIds: jest.fn().mockImplementation(() => []),
};

export const extendablePluginIdProviderMock: Partial<ExtendablePluginIdProvider> =
  {
    isConfiguredPluginId: jest.fn().mockImplementation(),
    getPluginIds: jest.fn().mockImplementation(async () => ['catalog']),
    handleConflictedPluginIds: jest.fn().mockImplementation(),
  };

export const roleEventEmitterMock: RoleEventEmitter<RoleEvents> = {
  on: jest.fn().mockImplementation(),
};

export const enforcerMock: Partial<Enforcer> = {
  loadPolicy: jest.fn().mockImplementation(async () => {}),
  enableAutoSave: jest.fn().mockImplementation(() => {}),
  setRoleManager: jest.fn().mockImplementation(() => {}),
  enableAutoBuildRoleLinks: jest.fn().mockImplementation(() => {}),
  buildRoleLinks: jest.fn().mockImplementation(() => {}),
};

export const enforcerDelegateMock: Partial<EnforcerDelegate> = {
  hasPolicy: jest.fn().mockImplementation(),
  hasGroupingPolicy: jest.fn().mockImplementation(),
  getPolicy: jest.fn().mockImplementation(),
  getGroupingPolicy: jest.fn().mockImplementation(),
  getFilteredPolicy: jest.fn().mockImplementation(),
  getFilteredGroupingPolicy: jest.fn().mockImplementation(),
  addPolicy: jest.fn().mockImplementation(),
  addPolicies: jest.fn().mockImplementation(),
  addGroupingPolicies: jest.fn().mockImplementation(),
  removePolicy: jest.fn().mockImplementation(),
  removePolicies: jest.fn().mockImplementation(),
  removeGroupingPolicy: jest.fn().mockImplementation(),
  removeGroupingPolicies: jest.fn().mockImplementation(),
  updatePolicies: jest.fn().mockImplementation(),
  updateGroupingPolicies: jest.fn().mockImplementation(),
};

export const casbinKnexAdapterMock = {
  newAdapter: jest.fn((): Promise<CasbinKnexAdapter> => {
    return Promise.resolve({} as CasbinKnexAdapter);
  }),
};

export const providerMock: RBACProvider = {
  getProviderName: jest.fn().mockImplementation(() => `testProvider`),
  connect: jest.fn().mockImplementation(),
  refresh: jest.fn().mockImplementation(),
};

export const mockClientKnex = Knex.knex({ client: MockClient });

export function setupMockCasbinRuleTracker(): ReturnType<typeof createTracker> {
  const tracker = createTracker(mockClientKnex);
  tracker.on.select('casbin_rule').response([]);
  tracker.on.insert('casbin_rule').response([]);
  tracker.on.delete('casbin_rule').response(0);
  return tracker;
}

export async function createTestCasbinKnex(): Promise<Knex.Knex> {
  const testKnex = Knex.knex({
    client: 'better-sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
  });
  await testKnex.schema.createTable('casbin_rule', table => {
    table.increments('id').primary();
    table.string('ptype').nullable();
    table.string('v0').nullable();
    table.string('v1').nullable();
    table.string('v2').nullable();
    table.string('v3').nullable();
    table.string('v4').nullable();
    table.string('v5').nullable();
  });
  return testKnex;
}

export const mockHttpAuth = mockServices.httpAuth();
export const mockAuthService = mockServices.auth();
export const mockUserInfoService = mockServices.userInfo.mock();

export const createEventMock = {
  success: jest.fn(),
  fail: jest.fn(),
};
export const mockAuditorService: ServiceMock<AuditorService> =
  mockServices.auditor.mock({
    createEvent: jest.fn(async _ => {
      return createEventMock;
    }),
  });

export const credentials = mockCredentials.user();
export const mockLoggerService = mockServices.logger.mock();
export const mockPermissionRegistry = mockServices.permissionsRegistry.mock({
  getPermissionRuleset: jest.fn(resourceRef => {
    return {
      getRules: () => [
        {
          resourceRef,
          rules: [],
        },
      ],
      getRuleByName: jest.fn(),
    };
  }),
});

export const mockedAuthorize = jest.fn().mockImplementation(async () => [
  {
    result: AuthorizeResult.ALLOW,
  },
]);

export const mockedAuthorizeConditional = jest
  .fn()
  .mockImplementation(async () => [
    {
      result: AuthorizeResult.ALLOW,
    },
  ]);

export const mockPermissionEvaluator = {
  authorize: mockedAuthorize,
  authorizeConditional: mockedAuthorizeConditional,
};

export const testUsers = convertUsersToEntity();
export const testGroups = convertGroupsToEntity();
export const catalogMock = catalogServiceMock({
  entities: [...testGroups, ...testUsers],
});

export const csvPermFile = resolve(
  __dirname,
  './../__fixtures__/data/valid-csv/rbac-policy.csv',
);
