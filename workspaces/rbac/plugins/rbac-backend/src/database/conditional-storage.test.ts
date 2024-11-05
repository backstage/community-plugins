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
  mockServices,
  TestDatabaseId,
  TestDatabases,
} from '@backstage/backend-test-utils';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import * as Knex from 'knex';
import { createTracker, MockClient } from 'knex-mock-client';

import type {
  PermissionInfo,
  RoleConditionalPolicyDecision,
} from '@backstage-community/plugin-rbac-common';

import {
  CONDITIONAL_TABLE,
  ConditionalPolicyDecisionDAO,
  DataBaseConditionalStorage,
} from './conditional-storage';
import { migrate } from './migration';

jest.setTimeout(60000);

describe('DataBaseConditionalStorage', () => {
  const databases = TestDatabases.create({
    ids: ['POSTGRES_13', 'SQLITE_3'],
  });

  const conditionDao1: ConditionalPolicyDecisionDAO = {
    pluginId: 'catalog',
    resourceType: 'catalog-entity',
    permissions: '[{"action":"read","name":"catalog.entity.read"}]',
    roleEntityRef: 'role:default/test',
    result: AuthorizeResult.CONDITIONAL,
    conditionsJson:
      `{` +
      `"rule":"IS_ENTITY_OWNER",` +
      `"resourceType":"catalog-entity",` +
      `"params":{"claims":["group:default/test-group"]}` +
      `}`,
  };
  const conditionDao2: ConditionalPolicyDecisionDAO = {
    pluginId: 'test',
    resourceType: 'test-entity',
    permissions: '[{"action": "delete", "name": "catalog.entity.delete"}]',
    roleEntityRef: 'role:default/test-2',
    result: AuthorizeResult.CONDITIONAL,
    conditionsJson:
      `{` +
      `"rule": "IS_ENTITY_OWNER",` +
      `"resourceType": "test-entity",` +
      `"params": {"claims": ["group:default/test-group"]}` +
      `}`,
  };
  const condition1: RoleConditionalPolicyDecision<PermissionInfo> = {
    id: 1,
    pluginId: 'catalog',
    resourceType: 'catalog-entity',
    permissionMapping: [{ action: 'read', name: 'catalog.entity.read' }],
    roleEntityRef: 'role:default/test',
    result: AuthorizeResult.CONDITIONAL,
    conditions: {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'catalog-entity',
      params: {
        claims: ['group:default/test-group'],
      },
    },
  };
  const condition2: RoleConditionalPolicyDecision<PermissionInfo> = {
    id: 2,
    pluginId: 'test',
    resourceType: 'test-entity',
    permissionMapping: [{ action: 'delete', name: 'catalog.entity.delete' }],
    roleEntityRef: 'role:default/test-2',
    result: AuthorizeResult.CONDITIONAL,
    conditions: {
      rule: 'IS_ENTITY_OWNER',
      resourceType: 'test-entity',
      params: {
        claims: ['group:default/test-group'],
      },
    },
  };

  async function createDatabase(databaseId: TestDatabaseId) {
    const knex = await databases.init(databaseId);
    const mockDatabaseService = mockServices.database.mock({
      getClient: async () => knex,
      migrations: { skip: false },
    });

    await migrate(mockDatabaseService);
    return {
      knex,
      db: new DataBaseConditionalStorage(knex),
    };
  }

  describe('filterConditions', () => {
    it.each(databases.eachSupportedId())(
      'should return all conditions',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions();
        expect(conditions.length).toEqual(2);

        expect(conditions[0]).toEqual(condition1);
        expect(conditions[1]).toEqual(condition2);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by roleEntityRef',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(`role:default/test`);
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by pluginId',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(undefined, 'catalog');
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by pluginId',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(
          undefined,
          undefined,
          'catalog-entity',
        );
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by action',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(
          undefined,
          undefined,
          undefined,
          ['read'],
        );
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by permission name',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(
          undefined,
          undefined,
          undefined,
          undefined,
          ['catalog.entity.read'],
        );
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should return condition by all arguments',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao2,
        );

        const conditions = await db.filterConditions(
          'role:default/test',
          'catalog',
          'catalog-entity',
          ['read'],
          ['catalog.entity.read'],
        );
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );
  });

  describe('createCondition', () => {
    it.each(databases.eachSupportedId())(
      'should successfully create new conditional policy',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        const id = await db.createCondition(condition1);

        const condition = await knex<ConditionalPolicyDecisionDAO>(
          CONDITIONAL_TABLE,
        ).where('id', id);
        expect(condition.length).toEqual(1);
        expect(condition[0]).toEqual({
          id: 1,
          ...conditionDao1,
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should throw conflict error',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        await expect(async () => {
          await db.createCondition(condition1);
        }).rejects.toThrow(
          `Found condition with conflicted permission action '["read"]'. Role could have multiple conditions for the same resource type 'catalog-entity', but with different permission action sets.`,
        );
      },
    );

    it('should throw failed to create metadata error, because inserted result is undefined', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(CONDITIONAL_TABLE).response(undefined);
      tracker.on.insert(CONDITIONAL_TABLE).response(undefined);

      const db = new DataBaseConditionalStorage(knex);

      await expect(async () => {
        await db.createCondition(condition1);
      }).rejects.toThrow(`Failed to create the condition.`);
    });
  });

  describe('checkConflictedConditions', () => {
    it.each(databases.eachSupportedId())(
      'should check conflicted condition',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        await expect(async () => {
          await db.checkConflictedConditions(
            'role:default/test',
            'catalog-entity',
            'catalog',
            ['read'],
          );
        }).rejects.toThrow(
          `Found condition with conflicted permission action '["read"]'. Role could have multiple conditions for the same resource type 'catalog-entity', but with different permission action sets.`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail check, when there is condition with one conflicted action "read"',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const conditionDaoWithFewActions = {
          ...conditionDao1,
          permissions:
            '[{"action":"read","name":"catalog.entity.read"}, {"action":"delete","name":"catalog.entity.delete"}]',
        };
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDaoWithFewActions,
        );

        await expect(async () => {
          await db.checkConflictedConditions(
            'role:default/test',
            'catalog-entity',
            'catalog',
            ['read'],
          );
        }).rejects.toThrow(
          `Found condition with conflicted permission action '["read"]'. Role could have multiple conditions for the same resource type 'catalog-entity', but with different permission action sets.`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail check, when there is one condition with two conflicted actions "read" and "update"',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const conditionDaoWithFewActions = {
          ...conditionDao1,
          permissions:
            '[{"action":"read","name":"catalog.entity.read"}, {"action":"delete","name":"catalog.entity.delete"}, {"action":"update","name":"catalog.entity.update"}]',
        };
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDaoWithFewActions,
        );

        await expect(async () => {
          await db.checkConflictedConditions(
            'role:default/test',
            'catalog-entity',
            'catalog',
            ['read', 'update'],
          );
        }).rejects.toThrow(
          `Found condition with conflicted permission action '["read","update"]'. Role could have multiple conditions for the same resource type 'catalog-entity', but with different permission action sets.`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail check, when there is condition with three conflicted actions "read", "update", "delete"',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const conditionDaoWithFewActions = {
          ...conditionDao1,
          permissions:
            '[{"action":"read","name":"catalog.entity.read"}, {"action":"delete","name":"catalog.entity.delete"}, {"action":"update","name":"catalog.entity.update"}]',
        };
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDaoWithFewActions,
        );

        await expect(async () => {
          await db.checkConflictedConditions(
            'role:default/test',
            'catalog-entity',
            'catalog',
            ['read', 'update', 'delete'],
          );
        }).rejects.toThrow(
          `Found condition with conflicted permission action '["read","update","delete"]'. Role could have multiple conditions for the same resource type 'catalog-entity', but with different permission action sets.`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should pass check, when there is one non conflicted condition',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const filterConditionsSpy = jest.spyOn(db, 'filterConditions');

        const conditionDaoWithFewActions = {
          ...conditionDao1,
          permissions:
            '[{"action":"read","name":"catalog.entity.read"}, {"action":"update","name":"catalog.entity.update"}]',
        };
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDaoWithFewActions,
        );

        await db.checkConflictedConditions(
          'role:default/test',
          'catalog-entity',
          'catalog',
          ['delete'],
        );

        expect(filterConditionsSpy).toHaveBeenCalledTimes(1);
        const result = await filterConditionsSpy.mock.results[0].value;
        expect(result).toEqual([
          {
            ...condition1,
            permissionMapping: [
              { name: 'catalog.entity.read', action: 'read' },
              { name: 'catalog.entity.update', action: 'update' },
            ],
          },
        ]);
      },
    );

    it.each(databases.eachSupportedId())(
      'should pass check, when there are no conditions',
      async databasesId => {
        const { db } = await createDatabase(databasesId);
        const filterConditionsSpy = jest.spyOn(db, 'filterConditions');

        await db.checkConflictedConditions(
          'role:default/test',
          'catalog-entity',
          'catalog',
          ['read'],
        );

        expect(filterConditionsSpy).toHaveBeenCalledTimes(1);
        const result = await filterConditionsSpy.mock.results[0].value;
        expect(result).toEqual([]);
      },
    );
  });

  describe('getCondition', () => {
    it.each(databases.eachSupportedId())(
      'should return condition by id',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        const condition = await db.getCondition(1);

        expect(condition).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should not find condition',
      async databasesId => {
        const { db } = await createDatabase(databasesId);

        const condition = await db.getCondition(1);

        expect(condition).toBeUndefined();
      },
    );
  });

  describe('deleteCondition', () => {
    it.each(databases.eachSupportedId())(
      'should delete condition by id',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        await db.deleteCondition(1);

        const conditions = await knex
          .table(CONDITIONAL_TABLE)
          .select<ConditionalPolicyDecisionDAO[]>();
        expect(conditions.length).toEqual(0);
      },
    );

    it.each(databases.eachSupportedId())(
      'should not find condition',
      async databasesId => {
        const { db } = await createDatabase(databasesId);

        await expect(async () => {
          await db.deleteCondition(1);
        }).rejects.toThrow('Condition with id 1 was not found');
      },
    );
  });

  describe('updateCondition', () => {
    it.each(databases.eachSupportedId())(
      'should update condition with added new action',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        const updateCondition: RoleConditionalPolicyDecision<PermissionInfo> = {
          ...condition1,
          permissionMapping: [
            { name: 'catalog.entity.read', action: 'read' },
            { name: 'catalog.entity.delete', action: 'delete' },
          ],
        };
        await db.updateCondition(1, updateCondition);

        const condition = await knex
          .table(CONDITIONAL_TABLE)
          .select<ConditionalPolicyDecisionDAO[]>()
          .where('id', 1);
        expect(condition).toEqual([
          {
            ...conditionDao1,
            permissions:
              '[{"name":"catalog.entity.read","action":"read"},{"name":"catalog.entity.delete","action":"delete"}]',
            id: 1,
          },
        ]);
      },
    );

    it.each(databases.eachSupportedId())(
      'should update condition with removed one action',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions:
            '[{"action":"read","name":"catalog.entity.read"}, {"action":"delete","name":"catalog.entity.delete"}]',
        });

        const updateCondition: RoleConditionalPolicyDecision<PermissionInfo> = {
          ...condition1,
          permissionMapping: [{ name: 'catalog.entity.read', action: 'read' }],
        };
        await db.updateCondition(1, updateCondition);

        const condition = await knex
          .table(CONDITIONAL_TABLE)
          .select<ConditionalPolicyDecisionDAO[]>()
          .where('id', 1);
        expect(condition).toEqual([
          {
            ...conditionDao1,
            permissions: '[{"name":"catalog.entity.read","action":"read"}]',
            id: 1,
          },
        ]);
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update condition, because condition not found',
      async databasesId => {
        const { db } = await createDatabase(databasesId);

        const updateCondition: RoleConditionalPolicyDecision<PermissionInfo> = {
          ...condition1,
          permissionMapping: [
            { name: 'catalog.entity.name', action: 'read' },
            { name: 'catalog.entity.delete', action: 'delete' },
          ],
        };
        await expect(async () => {
          await db.updateCondition(1, updateCondition);
        }).rejects.toThrow('Condition with id 1 was not found');
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update condition, because found condition with conflict',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions:
            '[{"name": "catalog.entity.delete", "action": "delete"}]',
        });

        const updateCondition: RoleConditionalPolicyDecision<PermissionInfo> = {
          ...condition1,
          permissionMapping: [
            { name: 'catalog.entity.read', action: 'read' },
            { name: 'catalog.entity.delete', action: 'delete' },
          ],
        };
        await expect(async () => {
          await db.updateCondition(1, updateCondition);
        }).rejects.toThrow(
          `Found condition with conflicted permission action '["delete"]'. Role could have multiple conditions for the same resource type 'catalog-entity', but with different permission action sets.`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update condition, because found condition with two conflicted actions',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions:
            '[{"name": "catalog.entity.delete", "action": "delete"}, {"name": "catalog.entity.read", "action": "read"}]',
        });

        const updateCondition: RoleConditionalPolicyDecision<PermissionInfo> = {
          ...condition1,
          permissionMapping: [
            { name: 'catalog.entity.read', action: 'read' },
            { name: 'catalog.entity.delete', action: 'delete' },
          ],
        };
        await expect(async () => {
          await db.updateCondition(1, updateCondition);
        }).rejects.toThrow(
          `Found condition with conflicted permission action '["read","delete"]'. Role could have multiple ` +
            `conditions for the same resource type 'catalog-entity', but with different permission action sets.`,
        );
      },
    );
  });
});
