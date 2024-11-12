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
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import type { MetadataResponse } from '@backstage/plugin-permission-node';

import { resolve } from 'path';

import { ConditionEvents } from '../audit-log/audit-logger';
import { DataBaseConditionalStorage } from '../database/conditional-storage';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { RoleEventEmitter, RoleEvents } from '../service/enforcer-delegate';
import { PluginPermissionMetadataCollector } from '../service/plugin-endpoints';
import { YamlConditinalPoliciesFileWatcher } from './yaml-conditional-file-watcher'; // Adjust the import path as necessary

const mockLoggerService = mockServices.logger.mock();

let loggerWarnSpy: jest.SpyInstance;

const conditionalStorageMock: Partial<DataBaseConditionalStorage> = {
  filterConditions: jest.fn().mockImplementation(),
  createCondition: jest.fn().mockImplementation(),
  checkConflictedConditions: jest.fn().mockImplementation(),
  getCondition: jest.fn().mockImplementation(),
  deleteCondition: jest.fn().mockImplementation(),
  updateCondition: jest.fn().mockImplementation(),
};

const auditLoggerMock = {
  getActorId: jest.fn().mockImplementation(),
  createAuditLogDetails: jest.fn().mockImplementation(),
  auditLog: jest.fn().mockImplementation(),
};

const mockAuthService = mockServices.auth();

const testPluginMetadataResp: MetadataResponse = {
  permissions: [
    {
      type: 'resource',
      name: 'catalog.entity.read',
      attributes: {
        action: 'read',
      },
      resourceType: 'catalog-entity',
    },
    {
      type: 'basic',
      name: 'catalog.entity.create',
      attributes: {
        action: 'create',
      },
    },
    {
      type: 'resource',
      name: 'catalog.entity.delete',
      attributes: {
        action: 'delete',
      },
      resourceType: 'catalog-entity',
    },
    {
      type: 'resource',
      name: 'catalog.entity.refresh',
      attributes: {
        action: 'update',
      },
      resourceType: 'catalog-entity',
    },
  ],
  rules: [
    {
      name: 'IS_ENTITY_OWNER',
      description: 'Allow entities owned by a specified claim',
      resourceType: 'catalog-entity',
      paramsSchema: {
        type: 'object',
        properties: {
          claims: {
            type: 'array',
            items: {
              type: 'string',
            },
            description:
              'List of claims to match at least one on within ownedBy',
          },
        },
        required: ['claims'],
        additionalProperties: false,
        $schema: 'http://json-schema.org/draft-07/schema#',
      },
    },
  ],
};

const conditionToStore1 = {
  result: AuthorizeResult.CONDITIONAL,
  roleEntityRef: 'role:default/test',
  pluginId: 'catalog',
  resourceType: 'catalog-entity',
  permissionMapping: [{ name: 'catalog.entity.refresh', action: 'update' }],
  conditions: {
    rule: 'IS_ENTITY_OWNER',
    resourceType: 'catalog-entity',
    params: {
      claims: ['group:default/team-a'],
    },
  },
};

const conditionToStore2 = {
  result: AuthorizeResult.CONDITIONAL,
  roleEntityRef: 'role:default/test',
  pluginId: 'catalog',
  resourceType: 'catalog-entity',
  permissionMapping: [
    { name: 'catalog.entity.read', action: 'read' },
    { name: 'catalog.entity.delete', action: 'delete' },
  ],
  conditions: {
    rule: 'IS_ENTITY_OWNER',
    resourceType: 'catalog-entity',
    params: {
      claims: ['group:default/team-a', 'group:default/team-b'],
    },
  },
};

const conditionToRemove = {
  id: 2,
  result: AuthorizeResult.CONDITIONAL,
  roleEntityRef: 'role:default/dev',
  pluginId: 'catalog',
  resourceType: 'catalog-entity',
  permissionMapping: [{ name: 'catalog.entity.read', action: 'read' }],
  conditions: {
    rule: 'IS_ENTITY_OWNER',
    resourceType: 'catalog-entity',
    params: {
      claims: ['group:default/team-dev'],
    },
  },
};

const pluginMetadataCollectorMock: Partial<PluginPermissionMetadataCollector> =
  {
    getPluginConditionRules: jest.fn().mockImplementation(),
    getPluginPolicies: jest.fn().mockImplementation(),
    getMetadataByPluginId: jest
      .fn()
      .mockImplementation(async () => testPluginMetadataResp),
  };

const roleMetadataStorageMock: RoleMetadataStorage = {
  filterRoleMetadata: jest.fn().mockImplementation(() => []),
  findRoleMetadata: jest.fn().mockImplementation(),
  createRoleMetadata: jest.fn().mockImplementation(),
  updateRoleMetadata: jest.fn().mockImplementation(),
  removeRoleMetadata: jest.fn().mockImplementation(),
};

const roleEventEmitterMock: RoleEventEmitter<RoleEvents> = {
  on: jest.fn().mockImplementation(),
};

describe('YamlConditionalFileWatcher', () => {
  let csvFileName: string;

  const csvFileRoles: RoleMetadataDao[] = [
    {
      roleEntityRef: 'role:default/test',
      source: 'csv-file',
      author: 'user:default/tom',
      modifiedBy: 'user:default/tom',
      createdAt: '2021-09-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    csvFileName = resolve(
      __dirname,
      '../../__fixtures__/data/valid-conditions/conditions.yaml',
    );

    loggerWarnSpy = jest.spyOn(mockLoggerService, 'warn');

    auditLoggerMock.auditLog.mockClear();
    conditionalStorageMock.createCondition = jest.fn().mockImplementation();
    conditionalStorageMock.deleteCondition = jest.fn().mockImplementation();
    loggerWarnSpy.mockClear();
  });

  function createWatcher(filePath?: string): YamlConditinalPoliciesFileWatcher {
    return new YamlConditinalPoliciesFileWatcher(
      filePath,
      false,
      mockLoggerService,
      conditionalStorageMock as DataBaseConditionalStorage,
      auditLoggerMock,
      mockAuthService,
      pluginMetadataCollectorMock as PluginPermissionMetadataCollector,
      roleMetadataStorageMock,
      roleEventEmitterMock,
    );
  }

  test('handles errors for invalid file paths', async () => {
    const invalidFilePath = 'invalid-file-path.yaml';
    const watcher = createWatcher(invalidFilePath);
    await watcher.initialize();

    const auditEvents = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(1);
    expect(auditEvents[0][0].message).toBe(
      `File '${invalidFilePath}' was not found`,
    );
  });

  test('handles error on parse invalid yaml file', async () => {
    const invalidFilePath = resolve(
      __dirname,
      '../../__fixtures__/data/invalid-conditions/invalid-yaml.yaml',
    );
    const watcher = createWatcher(invalidFilePath);
    await watcher.initialize();

    const auditEvents = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(1);
    expect(auditEvents[0][0].message).toBe(
      `Error handling changes from conditional policies file ${invalidFilePath}`,
    );
    expect(auditEvents[0][0].errors[0].message).toBe(
      `'roleEntityRef' must be specified in the role condition`,
    );
  });

  test('should handle error on create condition', async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(() => []);
    roleMetadataStorageMock.filterRoleMetadata = jest
      .fn()
      .mockImplementation(() => csvFileRoles);
    conditionalStorageMock.createCondition = jest
      .fn()
      .mockImplementation(() => {
        throw new Error('unknow error message');
      });

    const watcher = createWatcher(csvFileName);
    await watcher.initialize();

    expect(conditionalStorageMock.createCondition).toHaveBeenCalled();

    const auditEvents: any[] = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(1);
    expect(auditEvents[0][0].eventName).toBe(
      ConditionEvents.CREATE_CONDITION_ERROR,
    );
    expect(auditEvents[0][0].message).toBe(`Failed to create condition`);
  });

  test('should add conditional policies from the file on initialization', async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(() => []);
    roleMetadataStorageMock.filterRoleMetadata = jest
      .fn()
      .mockImplementation(() => csvFileRoles);

    const watcher = createWatcher(csvFileName);
    await watcher.initialize();

    expect(conditionalStorageMock.createCondition).toHaveBeenCalledWith(
      conditionToStore1,
    );
    expect(conditionalStorageMock.createCondition).toHaveBeenCalledWith(
      conditionToStore2,
    );
    const auditEvents: any[] = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(2);
    expect(auditEvents[0][0].eventName).toBe(ConditionEvents.CREATE_CONDITION);
    expect(auditEvents[1][0].eventName).toBe(ConditionEvents.CREATE_CONDITION);
  });

  test('should not fail on initialization, when conditional policies contains empty array', async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(() => []);
    roleMetadataStorageMock.filterRoleMetadata = jest
      .fn()
      .mockImplementation(() => csvFileRoles);

    csvFileName = resolve(
      __dirname,
      '../../__fixtures__/data/valid-conditions/empty-conditions.yaml',
    );
    const watcher = createWatcher(csvFileName);
    await watcher.initialize();

    expect(conditionalStorageMock.createCondition).not.toHaveBeenCalled();
    const auditEvents: any[] = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(0);
  });

  test(`should not apply conditions if corresponding role is present, but with non 'csv-file' source`, async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(() => []);
    roleMetadataStorageMock.filterRoleMetadata = jest
      .fn()
      .mockImplementation(() => [
        {
          ...csvFileRoles[0],
          source: 'rest',
        },
      ]);

    const watcher = createWatcher(csvFileName);
    await watcher.initialize();

    expect(conditionalStorageMock.createCondition).not.toHaveBeenCalled();

    const auditEvents: any[] = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(0);
    expect(loggerWarnSpy).toHaveBeenNthCalledWith(
      1,
      `skip to add condition for role 'role:default/test'. Role is not from csv-file`,
    );
    expect(loggerWarnSpy).toHaveBeenNthCalledWith(
      2,
      `skip to add condition for role 'role:default/test'. Role is not from csv-file`,
    );
  });

  test('should not apply conditions if corresponding role is absent', async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(() => []);
    roleMetadataStorageMock.filterRoleMetadata = jest
      .fn()
      .mockImplementation(() => []);

    const watcher = createWatcher(csvFileName);
    await watcher.initialize();

    expect(conditionalStorageMock.createCondition).not.toHaveBeenCalled();

    const auditEvents: any[] = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(0);
    expect(loggerWarnSpy).toHaveBeenNthCalledWith(
      1,
      `skip to add condition for role 'role:default/test'. The role either does not exist or was not created from a CSV file.`,
    );
    expect(loggerWarnSpy).toHaveBeenNthCalledWith(
      2,
      `skip to add condition for role 'role:default/test'. The role either does not exist or was not created from a CSV file.`,
    );
  });

  test('should remove conditions, which is not included to yaml any more', async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(() => [conditionToRemove]);
    roleMetadataStorageMock.filterRoleMetadata = jest
      .fn()
      .mockImplementation(() => []);

    const watcher = createWatcher(csvFileName);
    await watcher.initialize();

    expect(conditionalStorageMock.createCondition).not.toHaveBeenCalled();

    const auditEvents: any[] = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(1);
    expect(auditEvents[0][0].eventName).toBe(ConditionEvents.DELETE_CONDITION);
    expect(auditEvents[0][0].message).toBe(
      `Deleted conditional permission policy`,
    );
    expect(conditionalStorageMock.deleteCondition).toHaveBeenCalledWith(2);
  });

  test('should handle error on delete condition', async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(() => [conditionToRemove]);
    roleMetadataStorageMock.filterRoleMetadata = jest
      .fn()
      .mockImplementation(() => []);
    conditionalStorageMock.deleteCondition = jest
      .fn()
      .mockImplementation(() => {
        throw new Error('unknow error message');
      });

    const watcher = createWatcher(csvFileName);
    await watcher.initialize();

    expect(conditionalStorageMock.createCondition).not.toHaveBeenCalled();

    expect(conditionalStorageMock.deleteCondition).toHaveBeenCalled();
    const auditEvents: any[] = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(1);
    expect(auditEvents[0][0].eventName).toBe(
      ConditionEvents.DELETE_CONDITION_ERROR,
    );
    expect(auditEvents[0][0].message).toBe(`Failed to delete condition by id`);
  });

  test('should clean up conditions if conditional file was not specified', async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(() => [conditionToRemove]);
    roleMetadataStorageMock.filterRoleMetadata = jest
      .fn()
      .mockImplementation(() => csvFileRoles);

    const watcher = createWatcher();
    await watcher.initialize();
    await watcher.cleanUpConditionalPolicies();

    expect(conditionalStorageMock.createCondition).not.toHaveBeenCalled();

    const auditEvents: any[] = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(1);
    expect(auditEvents[0][0].eventName).toBe(ConditionEvents.DELETE_CONDITION);
    expect(auditEvents[0][0].message).toBe(
      `Deleted conditional permission policy`,
    );
    expect(conditionalStorageMock.deleteCondition).toHaveBeenNthCalledWith(
      1,
      2,
    );
  });

  test('should not clean up conditions if list contidions is empty', async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(() => []);
    roleMetadataStorageMock.filterRoleMetadata = jest
      .fn()
      .mockImplementation(() => csvFileRoles);

    const watcher = createWatcher();
    await watcher.initialize();
    await watcher.cleanUpConditionalPolicies();

    expect(conditionalStorageMock.createCondition).not.toHaveBeenCalled();

    const auditEvents: any[] = auditLoggerMock.auditLog.mock.calls;
    expect(auditEvents.length).toBe(0);

    expect(conditionalStorageMock.deleteCondition).not.toHaveBeenCalled();
  });
});
