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

import { ActionType, ConditionEvents } from '../auditor/auditor';
import { DataBaseConditionalStorage } from '../database/conditional-storage';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { RoleEventEmitter, RoleEvents } from '../service/enforcer-delegate';
import { PluginPermissionMetadataCollector } from '../service/plugin-endpoints';
import { YamlConditinalPoliciesFileWatcher } from './yaml-conditional-file-watcher'; // Adjust the import path as necessary
import { mockAuditorService } from '../../__fixtures__/mock-utils';
import { expectAuditorLog } from '../../__fixtures__/auditor-test-utils';
import {
  PermissionInfo,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';
import { JsonObject } from '@backstage/types';
import { NotFoundError } from '@backstage/errors';

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

const conditionToStore1: Partial<
  RoleConditionalPolicyDecision<PermissionInfo>
> &
  Required<
    Pick<RoleConditionalPolicyDecision<PermissionInfo>, 'permissionMapping'>
  > = {
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

const conditionToStore2: Partial<
  RoleConditionalPolicyDecision<PermissionInfo>
> &
  Required<
    Pick<RoleConditionalPolicyDecision<PermissionInfo>, 'permissionMapping'>
  > = {
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

const conditionToRemove: Partial<
  RoleConditionalPolicyDecision<PermissionInfo>
> &
  Required<
    Pick<RoleConditionalPolicyDecision<PermissionInfo>, 'permissionMapping'>
  > = {
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
  filterForOwnerRoleMetadata: jest.fn().mockImplementation(),
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

    conditionalStorageMock.createCondition = jest.fn().mockImplementation();
    conditionalStorageMock.deleteCondition = jest.fn().mockImplementation();
    jest.clearAllMocks();
  });

  function createWatcher(filePath?: string): YamlConditinalPoliciesFileWatcher {
    return new YamlConditinalPoliciesFileWatcher(
      filePath,
      false,
      mockLoggerService,
      conditionalStorageMock as DataBaseConditionalStorage,
      mockAuditorService,
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

    expectAuditorLog([
      {
        event: { eventId: ConditionEvents.CONDITIONAL_POLICIES_FILE_NOT_FOUND },
        fail: { error: new Error(`File '${invalidFilePath}' was not found`) },
      },
    ]);
  });

  test('handles error on parse invalid yaml file', async () => {
    const invalidFilePath = resolve(
      __dirname,
      '../../__fixtures__/data/invalid-conditions/invalid-yaml.yaml',
    );
    const watcher = createWatcher(invalidFilePath);
    await watcher.initialize();

    expectAuditorLog([
      {
        event: { eventId: ConditionEvents.CONDITIONAL_POLICIES_FILE_CHANGE },
        fail: {
          error: new Error(
            `'roleEntityRef' must be specified in the role condition`,
          ),
        },
      },
    ]);
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
      .mockImplementationOnce(() => {
        throw new Error('unknown error message 1');
      })
      .mockImplementationOnce(() => {
        throw new Error('unknown error message 2');
      });

    const watcher = createWatcher(csvFileName);
    await watcher.initialize();

    expect(conditionalStorageMock.createCondition).toHaveBeenCalled();
    expectAuditorLog([
      {
        event: {
          eventId: ConditionEvents.CONDITION_WRITE,
          meta: { actionType: ActionType.CREATE },
        },
        fail: {
          error: new Error('unknown error message 1'),
          ...mappedConditionMeta(conditionToStore1),
        },
      },
      {
        event: {
          eventId: ConditionEvents.CONDITION_WRITE,
          meta: { actionType: ActionType.CREATE },
        },
        fail: {
          error: new Error('unknown error message 2'),
          ...mappedConditionMeta(conditionToStore2),
        },
      },
    ]);
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
    expectAuditorLog([
      {
        event: {
          eventId: ConditionEvents.CONDITION_WRITE,
          meta: { actionType: ActionType.CREATE },
        },
        success: { ...mappedConditionMeta(conditionToStore1) },
      },
      {
        event: {
          eventId: ConditionEvents.CONDITION_WRITE,
          meta: { actionType: ActionType.CREATE },
        },
        success: { ...mappedConditionMeta(conditionToStore2) },
      },
    ]);
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
    expectAuditorLog([]);
  });

  test('should not fail on initialization, when conditional policies file contains extra delimiter', async () => {
    conditionalStorageMock.filterConditions = jest
      .fn()
      .mockImplementation(() => []);
    roleMetadataStorageMock.filterRoleMetadata = jest
      .fn()
      .mockImplementation(() => [
        {
          roleEntityRef: 'role:default/test-2',
          source: 'csv-file',
          author: 'user:default/tom',
          modifiedBy: 'user:default/tom',
          createdAt: '2021-09-01T00:00:00Z',
        },
        {
          roleEntityRef: 'role:default/test-3',
          source: 'csv-file',
          author: 'user:default/tom',
          modifiedBy: 'user:default/tom',
          createdAt: '2021-09-01T00:00:00Z',
        },
      ]);

    csvFileName = resolve(
      __dirname,
      '../../__fixtures__/data/valid-conditions/extra-delimiter-conditions.yaml',
    );
    const watcher = createWatcher(csvFileName);
    await watcher.initialize();
    const expectedCondition1 = {
      result: AuthorizeResult.CONDITIONAL,
      roleEntityRef: 'role:default/test-2',
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
    const expectedCondition2 = {
      result: AuthorizeResult.CONDITIONAL,
      roleEntityRef: 'role:default/test-3',
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

    expect(conditionalStorageMock.createCondition).toHaveBeenCalledWith(
      expectedCondition1,
    );
    expect(conditionalStorageMock.createCondition).toHaveBeenCalledWith(
      expectedCondition2,
    );
    expectAuditorLog([
      {
        event: {
          eventId: ConditionEvents.CONDITION_WRITE,
          meta: { actionType: ActionType.CREATE },
        },
        success: { ...mappedConditionMeta(expectedCondition1 as any) },
      },
      {
        event: {
          eventId: ConditionEvents.CONDITION_WRITE,
          meta: { actionType: ActionType.CREATE },
        },
        success: { ...mappedConditionMeta(expectedCondition2 as any) },
      },
    ]);
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

    expectAuditorLog([]);
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

    expectAuditorLog([]);
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

    expectAuditorLog([
      {
        event: {
          eventId: ConditionEvents.CONDITION_WRITE,
          meta: { actionType: ActionType.DELETE },
        },
        success: { ...mappedConditionMeta(conditionToRemove) },
      },
    ]);
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
        throw new NotFoundError('Condition was not found');
      });

    const watcher = createWatcher(csvFileName);
    await watcher.initialize();

    expect(conditionalStorageMock.createCondition).not.toHaveBeenCalled();

    expect(conditionalStorageMock.deleteCondition).toHaveBeenCalled();
    expectAuditorLog([
      {
        event: {
          eventId: ConditionEvents.CONDITION_WRITE,
          meta: { actionType: ActionType.DELETE },
        },
        fail: {
          error: new NotFoundError('Condition was not found'),
          ...mappedConditionMeta(conditionToRemove),
        },
      },
    ]);
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
    expectAuditorLog([
      {
        event: {
          eventId: ConditionEvents.CONDITION_WRITE,
          meta: { actionType: ActionType.DELETE },
        },
        success: { ...mappedConditionMeta(conditionToRemove) },
      },
    ]);
    expect(conditionalStorageMock.deleteCondition).toHaveBeenNthCalledWith(
      1,
      2,
    );
  });

  test('should not clean up conditions if list conditions is empty', async () => {
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
    expectAuditorLog([]);
    expect(conditionalStorageMock.deleteCondition).not.toHaveBeenCalled();
  });
});

function mappedConditionMeta(
  condition: Required<
    Pick<RoleConditionalPolicyDecision<PermissionInfo>, 'permissionMapping'>
  >,
): JsonObject {
  return {
    meta: {
      condition: {
        ...condition,
        permissionMapping: condition.permissionMapping.map(pm => pm.action),
      },
    },
  };
}
