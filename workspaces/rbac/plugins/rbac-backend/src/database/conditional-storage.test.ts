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

import type { RoleConditionalPolicyDecision } from '@backstage-community/plugin-rbac-common';

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
    permissions: '["read"]',
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
    permissions: '["delete"]',
    roleEntityRef: 'role:default/test-2',
    result: AuthorizeResult.CONDITIONAL,
    conditionsJson:
      `{` +
      `"rule": "IS_ENTITY_OWNER",` +
      `"resourceType": "test-entity",` +
      `"params": {"claims": ["group:default/test-group"]}` +
      `}`,
  };
  const condition1: RoleConditionalPolicyDecision = {
    id: 1,
    pluginId: 'catalog',
    resourceType: 'catalog-entity',
    permissionMapping: ['read'],
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
  const condition2: RoleConditionalPolicyDecision = {
    id: 2,
    pluginId: 'test',
    resourceType: 'test-entity',
    permissionMapping: ['delete'],
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
        );
        expect(conditions.length).toEqual(1);

        expect(conditions[0]).toEqual(condition1);
      },
    );

    it.each(databases.eachSupportedId())(
      'should filter by permissionName matching named entries and broad action-only entries',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        const namedDao: ConditionalPolicyDecisionDAO = {
          ...conditionDao1,
          permissions: '[{"name":"catalog.entity.read","action":"read"}]',
        };
        const broadDao: ConditionalPolicyDecisionDAO = {
          ...conditionDao1,
          roleEntityRef: 'role:default/test-broad',
          permissions: '["read"]',
        };
        const otherNamedDao: ConditionalPolicyDecisionDAO = {
          ...conditionDao1,
          roleEntityRef: 'role:default/test-other',
          permissions: '[{"name":"catalog.location.read","action":"read"}]',
        };
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          namedDao,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          broadDao,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          otherNamedDao,
        );

        const conditions = await db.filterConditions(
          undefined,
          'catalog',
          'catalog-entity',
          ['read'],
          'catalog.entity.read',
        );

        expect(conditions).toHaveLength(2);
        const refs = conditions.map(c => c.roleEntityRef).sort();
        expect(refs).toEqual(['role:default/test', 'role:default/test-broad']);
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
          `Cannot create condition: permission mapping overlaps with existing condition (id: 1) for resource type 'catalog-entity'. Overlapping entries: action 'read'.`,
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
          `Condition cannot be saved: permission mapping overlaps with existing condition (id: 1) for resource type 'catalog-entity'. Overlapping entries: action 'read'.`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail check, when there is condition with one conflicted action "read"',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const conditionDaoWithFewActions = {
          ...conditionDao1,
          permissions: '["read","delete"]',
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
          `Condition cannot be saved: permission mapping overlaps with existing condition (id: 1) for resource type 'catalog-entity'. Overlapping entries: action 'read'.`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail check, when there is one condition with two conflicted actions "read" and "update"',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const conditionDaoWithFewActions = {
          ...conditionDao1,
          permissions: '["read","delete","update"]',
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
          /Condition cannot be saved: permission mapping overlaps with existing condition \(id: 1\) for resource type 'catalog-entity'. Overlapping entries: action 'read'; action 'update'/,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail check, when there is condition with three conflicted actions "read", "update", "delete"',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const conditionDaoWithFewActions = {
          ...conditionDao1,
          permissions: '["read","delete","update"]',
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
          /Condition cannot be saved: permission mapping overlaps with existing condition \(id: 1\) for resource type 'catalog-entity'/,
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
          permissions: '["read","update"]',
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
            permissionMapping: ['read', 'update'],
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

    it.each(databases.eachSupportedId())(
      'should not conflict when named entries have different permission names but the same action',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const storedDao: ConditionalPolicyDecisionDAO = {
          ...conditionDao1,
          permissions: '[{"name":"catalog.entity.read","action":"read"}]',
        };
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          storedDao,
        );

        await expect(
          db.checkConflictedConditions(
            'role:default/test',
            'catalog-entity',
            'catalog',
            [{ name: 'catalog.location.read', action: 'read' }],
          ),
        ).resolves.toBeUndefined();
      },
    );

    it.each(databases.eachSupportedId())(
      'should conflict when a broad action-only entry matches a stored named entry with the same action',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const storedDao: ConditionalPolicyDecisionDAO = {
          ...conditionDao1,
          permissions: '[{"name":"catalog.entity.read","action":"read"}]',
        };
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          storedDao,
        );

        await expect(
          db.checkConflictedConditions(
            'role:default/test',
            'catalog-entity',
            'catalog',
            ['read'],
          ),
        ).rejects.toThrow(
          `Condition cannot be saved: permission mapping overlaps with existing condition (id: 1) for resource type 'catalog-entity'. Overlapping entries: action 'read' (broad) overlaps with permission 'catalog.entity.read'.`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should conflict when a named entry matches a stored broad action-only entry with the same action',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );

        await expect(
          db.checkConflictedConditions(
            'role:default/test',
            'catalog-entity',
            'catalog',
            [{ name: 'catalog.entity.read', action: 'read' }],
          ),
        ).rejects.toThrow(
          `Condition cannot be saved: permission mapping overlaps with existing condition (id: 1) for resource type 'catalog-entity'. Overlapping entries: permission 'catalog.entity.read' overlaps with action 'read' (broad).`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should conflict when named entries have the same permission name and action',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const storedDao: ConditionalPolicyDecisionDAO = {
          ...conditionDao1,
          permissions: '[{"name":"catalog.entity.read","action":"read"}]',
        };
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          storedDao,
        );

        await expect(
          db.checkConflictedConditions(
            'role:default/test',
            'catalog-entity',
            'catalog',
            [{ name: 'catalog.entity.read', action: 'read' }],
          ),
        ).rejects.toThrow(
          `Condition cannot be saved: permission mapping overlaps with existing condition (id: 1) for resource type 'catalog-entity'. Overlapping entries: permission 'catalog.entity.read'.`,
        );
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

        const updateCondition: RoleConditionalPolicyDecision = {
          ...condition1,
          permissionMapping: ['read', 'delete'],
        };
        await db.updateCondition(1, updateCondition);

        const condition = await knex
          .table(CONDITIONAL_TABLE)
          .select<ConditionalPolicyDecisionDAO[]>()
          .where('id', 1);
        expect(condition).toEqual([
          {
            ...conditionDao1,
            permissions: '["read","delete"]',
            id: 1,
          },
        ]);
      },
    );

    it.each(databases.eachSupportedId())(
      'should update when idsToExclude includes pending sibling delete',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions: '["delete"]',
        });

        const updateCondition: RoleConditionalPolicyDecision = {
          ...condition1,
          permissionMapping: ['read', 'delete'],
        };

        await db.updateCondition(1, updateCondition, undefined, new Set([2]));

        const condition = await knex
          .table(CONDITIONAL_TABLE)
          .select<ConditionalPolicyDecisionDAO[]>()
          .where('id', 1);
        expect(condition[0].permissions).toBe('["read","delete"]');
      },
    );

    it.each(databases.eachSupportedId())(
      'should update condition with removed one action',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions: '["read","delete"]',
        });

        const updateCondition: RoleConditionalPolicyDecision = {
          ...condition1,
          permissionMapping: ['read'],
        };
        await db.updateCondition(1, updateCondition);

        const condition = await knex
          .table(CONDITIONAL_TABLE)
          .select<ConditionalPolicyDecisionDAO[]>()
          .where('id', 1);
        expect(condition).toEqual([
          {
            ...conditionDao1,
            permissions: '["read"]',
            id: 1,
          },
        ]);
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update condition, because condition not found',
      async databasesId => {
        const { db } = await createDatabase(databasesId);

        const updateCondition: RoleConditionalPolicyDecision = {
          ...condition1,
          permissionMapping: ['read', 'delete'],
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
          permissions: '["delete"]',
        });

        const updateCondition: RoleConditionalPolicyDecision = {
          ...condition1,
          permissionMapping: ['read', 'delete'],
        };
        await expect(async () => {
          await db.updateCondition(1, updateCondition);
        }).rejects.toThrow(
          `Cannot update condition 1: permission mapping overlaps with existing condition (id: 2) for resource type 'catalog-entity'. Overlapping entries: action 'delete'.`,
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
          permissions: '["delete","read"]',
        });

        const updateCondition: RoleConditionalPolicyDecision = {
          ...condition1,
          permissionMapping: ['read', 'delete'],
        };
        await expect(async () => {
          await db.updateCondition(1, updateCondition);
        }).rejects.toThrow(
          /Cannot update condition 1: permission mapping overlaps with existing condition \(id: 2\) for resource type 'catalog-entity'. Overlapping entries: action 'read'; action 'delete'/,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update when changing from named to broad that conflicts',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions: '[{"name":"catalog.entity.read","action":"read"}]',
        });
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions: '[{"name":"catalog.entity.read","action":"read"}]',
        });

        const updateCondition: RoleConditionalPolicyDecision = {
          ...condition1,
          permissionMapping: ['read'],
        };
        await expect(async () => {
          await db.updateCondition(1, updateCondition);
        }).rejects.toThrow(
          `Cannot update condition 1: permission mapping overlaps with existing condition (id: 2) for resource type 'catalog-entity'. Overlapping entries: action 'read' (broad) overlaps with permission 'catalog.entity.read'.`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should report correct conflicting condition when first condition does not conflict',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions: '["update"]',
        });
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions: '["delete"]',
        });

        const updateCondition: RoleConditionalPolicyDecision = {
          ...condition1,
          permissionMapping: ['delete'],
        };
        await expect(async () => {
          await db.updateCondition(1, updateCondition);
        }).rejects.toThrow(
          `Cannot update condition 1: permission mapping overlaps with existing condition (id: 3) for resource type 'catalog-entity'. Overlapping entries: action 'delete'.`,
        );
      },
    );

    it.each(databases.eachSupportedId())(
      'should report all conflicting conditions when update overlaps with multiple',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert(
          conditionDao1,
        );
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions: '["update"]',
        });
        await knex<ConditionalPolicyDecisionDAO>(CONDITIONAL_TABLE).insert({
          ...conditionDao1,
          permissions: '["delete"]',
        });

        const updateCondition: RoleConditionalPolicyDecision = {
          ...condition1,
          permissionMapping: ['update', 'delete'],
        };
        await expect(async () => {
          await db.updateCondition(1, updateCondition);
        }).rejects.toThrow(
          /Cannot update condition 1: permission mapping overlaps with 2 existing conditions for resource type 'catalog-entity'. Condition 2: action 'update'. Condition 3: action 'delete'/,
        );
      },
    );
  });
});
