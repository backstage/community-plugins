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
import { mockCredentials, mockServices } from '@backstage/backend-test-utils';

import type { Enforcer } from 'casbin';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';
import type TypeORMAdapter from 'typeorm-adapter';

import type { RBACProvider } from '@backstage-community/plugin-rbac-node';

import { resolve } from 'path';

import { CasbinDBAdapterFactory } from '../src/database/casbin-adapter-factory';
import { ConditionalStorage } from '../src/database/conditional-storage';
import { RoleMetadataStorage } from '../src/database/role-metadata';
import {
  EnforcerDelegate,
  RoleEventEmitter,
  RoleEvents,
} from '../src/service/enforcer-delegate';
import { PluginPermissionMetadataCollector } from '../src/service/plugin-endpoints';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

// TODO: Move to 'catalogServiceMock' from '@backstage/plugin-catalog-node/testUtils'
// once '@backstage/plugin-catalog-node' is upgraded
export const catalogApiMock = {
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
};

export const pluginMetadataCollectorMock: Partial<PluginPermissionMetadataCollector> =
  {
    getPluginConditionRules: jest.fn().mockImplementation(),
    getPluginPolicies: jest.fn().mockImplementation(),
    getMetadataByPluginId: jest.fn().mockImplementation(),
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

export const dataBaseAdapterFactoryMock: Partial<CasbinDBAdapterFactory> = {
  createAdapter: jest.fn((): Promise<TypeORMAdapter> => {
    return Promise.resolve({} as TypeORMAdapter);
  }),
};

export const providerMock: RBACProvider = {
  getProviderName: jest.fn().mockImplementation(() => `testProvider`),
  connect: jest.fn().mockImplementation(),
  refresh: jest.fn().mockImplementation(),
};

export const mockClientKnex = Knex.knex({ client: MockClient });

export const mockHttpAuth = mockServices.httpAuth();
export const mockAuthService = mockServices.auth();

export const createEventMock = {
  success: jest.fn(),
  fail: jest.fn(),
};
export const mockAuditorService = mockServices.auditor.mock({
  createEvent: jest.fn(async _ => {
    return createEventMock;
  }),
});

export const credentials = mockCredentials.user();
export const mockLoggerService = mockServices.logger.mock();
export const mockUserInfoService = mockServices.userInfo();
export const mockDiscovery = mockServices.discovery.mock();
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

export const csvPermFile = resolve(
  __dirname,
  './../__fixtures__/data/valid-csv/rbac-policy.csv',
);
