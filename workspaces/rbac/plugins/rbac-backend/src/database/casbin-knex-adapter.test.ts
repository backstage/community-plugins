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
import { Helper, newModelFromString } from 'casbin';
import knex, { Knex } from 'knex';

import { CasbinKnexAdapter } from './casbin-knex-adapter';

const MODEL = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act, eft

[policy_effect]
e = some(where (p.eft == allow)) && !some(where (p.eft == deny))

[role_definition]
g = _, _

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
`;

const TABLE = 'casbin_rule';

async function createTable(db: Knex) {
  await db.schema.createTable(TABLE, table => {
    table.increments('id').primary();
    table.string('ptype').nullable();
    table.string('v0').nullable();
    table.string('v1').nullable();
    table.string('v2').nullable();
    table.string('v3').nullable();
    table.string('v4').nullable();
    table.string('v5').nullable();
  });
}

async function seedRules(
  db: Knex,
  rows: Array<{
    ptype: string;
    v0?: string;
    v1?: string;
    v2?: string;
    v3?: string;
    v4?: string;
    v5?: string;
  }>,
) {
  await db(TABLE).insert(
    rows.map(r => ({
      ptype: r.ptype,
      v0: r.v0 ?? null,
      v1: r.v1 ?? null,
      v2: r.v2 ?? null,
      v3: r.v3 ?? null,
      v4: r.v4 ?? null,
      v5: r.v5 ?? null,
    })),
  );
}

async function allRows(db: Knex) {
  return db(TABLE).select('*').orderBy('id');
}

describe('CasbinKnexAdapter', () => {
  let db: Knex;
  let adapter: CasbinKnexAdapter;

  beforeAll(async () => {
    db = knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    if (await db.schema.hasTable(TABLE)) {
      await db.schema.dropTable(TABLE);
    }
    await createTable(db);
    adapter = await CasbinKnexAdapter.newAdapter(db);
  });

  describe('isFiltered', () => {
    it('should return false initially', () => {
      expect(adapter.isFiltered()).toBe(false);
    });

    it('should return true after loadFilteredPolicy', async () => {
      await adapter.loadFilteredPolicy(newModelFromString(MODEL), [
        { ptype: 'p' },
      ]);
      expect(adapter.isFiltered()).toBe(true);
    });

    it('should reset to false after loadPolicy', async () => {
      await adapter.loadFilteredPolicy(newModelFromString(MODEL), [
        { ptype: 'p' },
      ]);
      await adapter.loadPolicy(newModelFromString(MODEL));
      expect(adapter.isFiltered()).toBe(false);
    });
  });

  describe('loadPolicy', () => {
    it('should load nothing from empty table', async () => {
      const model = newModelFromString(MODEL);
      await adapter.loadPolicy(model);
      expect(model.getPolicy('p', 'p')).toEqual([]);
      expect(model.getPolicy('g', 'g')).toEqual([]);
    });

    it('should load p-type policies', async () => {
      await seedRules(db, [
        { ptype: 'p', v0: 'alice', v1: 'data1', v2: 'read', v3: 'allow' },
        { ptype: 'p', v0: 'bob', v1: 'data1', v2: 'write', v3: 'deny' },
      ]);

      const model = newModelFromString(MODEL);
      await adapter.loadPolicy(model);
      expect(model.getPolicy('p', 'p')).toHaveLength(2);
    });

    it('should load g-type policies', async () => {
      await seedRules(db, [{ ptype: 'g', v0: 'alice', v1: 'role:admin' }]);

      const model = newModelFromString(MODEL);
      await adapter.loadPolicy(model);
      expect(model.getPolicy('g', 'g')).toHaveLength(1);
      expect(model.getPolicy('g', 'g')[0]).toEqual(['alice', 'role:admin']);
    });

    it('should load both p and g policies', async () => {
      await seedRules(db, [
        { ptype: 'p', v0: 'alice', v1: 'data1', v2: 'read', v3: 'allow' },
        { ptype: 'g', v0: 'alice', v1: 'role:admin' },
      ]);

      const model = newModelFromString(MODEL);
      await adapter.loadPolicy(model);
      expect(model.getPolicy('p', 'p')).toHaveLength(1);
      expect(model.getPolicy('g', 'g')).toHaveLength(1);
    });
  });

  describe('loadFilteredPolicy', () => {
    beforeEach(async () => {
      await seedRules(db, [
        { ptype: 'p', v0: 'alice', v1: 'data1', v2: 'read', v3: 'allow' },
        { ptype: 'p', v0: 'bob', v1: 'data1', v2: 'write', v3: 'deny' },
        { ptype: 'p', v0: 'admin', v1: 'data2', v2: 'read', v3: 'allow' },
        { ptype: 'g', v0: 'alice', v1: 'role:admin' },
        { ptype: 'g', v0: 'bob', v1: 'role:viewer' },
      ]);
    });

    it('should filter by ptype', async () => {
      const model = newModelFromString(MODEL);
      await adapter.loadFilteredPolicy(model, [{ ptype: 'p' }]);
      expect(model.getPolicy('p', 'p')).toHaveLength(3);
      expect(model.getPolicy('g', 'g')).toHaveLength(0);
    });

    it('should filter by ptype and v0', async () => {
      const model = newModelFromString(MODEL);
      await adapter.loadFilteredPolicy(model, [{ ptype: 'p', v0: 'alice' }]);
      expect(model.getPolicy('p', 'p')).toHaveLength(1);
      expect(model.getPolicy('p', 'p')[0][0]).toBe('alice');
    });

    it('should OR multiple filter objects', async () => {
      const model = newModelFromString(MODEL);
      await adapter.loadFilteredPolicy(model, [
        { ptype: 'p', v0: 'alice' },
        { ptype: 'p', v0: 'bob' },
      ]);
      expect(model.getPolicy('p', 'p')).toHaveLength(2);
    });

    it('should load all on empty filter', async () => {
      const model = newModelFromString(MODEL);
      await adapter.loadFilteredPolicy(model, []);
      expect(model.getPolicy('p', 'p')).toHaveLength(3);
      expect(model.getPolicy('g', 'g')).toHaveLength(2);
    });

    it('should set isFiltered to true', async () => {
      const model = newModelFromString(MODEL);
      await adapter.loadFilteredPolicy(model, [{ ptype: 'p' }]);
      expect(adapter.isFiltered()).toBe(true);
    });
  });

  describe('savePolicy', () => {
    it('should save model to database', async () => {
      const model = newModelFromString(MODEL);
      Helper.loadPolicyLine('p, alice, data1, read, allow', model);
      Helper.loadPolicyLine('g, alice, role:admin', model);

      const result = await adapter.savePolicy(model);
      expect(result).toBe(true);

      const rows = await allRows(db);
      expect(rows).toHaveLength(2);
    });

    it('should replace existing rules', async () => {
      await seedRules(db, [
        { ptype: 'p', v0: 'old', v1: 'data', v2: 'read', v3: 'allow' },
      ]);

      const model = newModelFromString(MODEL);
      Helper.loadPolicyLine('p, new, data, write, deny', model);
      await adapter.savePolicy(model);

      const rows = await allRows(db);
      expect(rows).toHaveLength(1);
      expect(rows[0].v0).toBe('new');
    });

    it('should clear table for empty model', async () => {
      await seedRules(db, [
        { ptype: 'p', v0: 'alice', v1: 'data1', v2: 'read', v3: 'allow' },
      ]);

      await adapter.savePolicy(newModelFromString(MODEL));
      expect(await allRows(db)).toHaveLength(0);
    });
  });

  describe('addPolicy', () => {
    it('should insert a policy', async () => {
      await adapter.addPolicy('p', 'p', ['alice', 'data1', 'read', 'allow']);
      const rows = await allRows(db);
      expect(rows).toHaveLength(1);
      expect(rows[0].ptype).toBe('p');
      expect(rows[0].v0).toBe('alice');
    });

    it('should insert a grouping policy', async () => {
      await adapter.addPolicy('g', 'g', ['alice', 'role:admin']);
      const rows = await allRows(db);
      expect(rows).toHaveLength(1);
      expect(rows[0].ptype).toBe('g');
    });

    it('should store null for missing trailing values', async () => {
      await adapter.addPolicy('g', 'g', ['alice', 'role:viewer']);
      const rows = await allRows(db);
      expect(rows[0].v2).toBeNull();
      expect(rows[0].v5).toBeNull();
    });
  });

  describe('addPolicies', () => {
    it('should batch insert', async () => {
      await adapter.addPolicies('p', 'p', [
        ['alice', 'data1', 'read', 'allow'],
        ['bob', 'data1', 'write', 'deny'],
      ]);
      expect(await allRows(db)).toHaveLength(2);
    });

    it('should handle empty array', async () => {
      await adapter.addPolicies('p', 'p', []);
      expect(await allRows(db)).toHaveLength(0);
    });
  });

  describe('removePolicy', () => {
    beforeEach(async () => {
      await seedRules(db, [
        { ptype: 'p', v0: 'alice', v1: 'data1', v2: 'read', v3: 'allow' },
        { ptype: 'p', v0: 'bob', v1: 'data1', v2: 'write', v3: 'deny' },
        { ptype: 'g', v0: 'alice', v1: 'role:admin' },
      ]);
    });

    it('should remove matching rule', async () => {
      await adapter.removePolicy('p', 'p', ['alice', 'data1', 'read', 'allow']);
      const rows = await allRows(db);
      expect(rows).toHaveLength(2);
      expect(
        rows.find(r => r.v0 === 'alice' && r.ptype === 'p'),
      ).toBeUndefined();
    });

    it('should not remove when no match', async () => {
      await adapter.removePolicy('p', 'p', [
        'nonexistent',
        'data1',
        'read',
        'allow',
      ]);
      expect(await allRows(db)).toHaveLength(3);
    });
  });

  describe('removePolicies', () => {
    beforeEach(async () => {
      await seedRules(db, [
        { ptype: 'p', v0: 'alice', v1: 'data1', v2: 'read', v3: 'allow' },
        { ptype: 'p', v0: 'bob', v1: 'data1', v2: 'write', v3: 'deny' },
      ]);
    });

    it('should batch remove', async () => {
      await adapter.removePolicies('p', 'p', [
        ['alice', 'data1', 'read', 'allow'],
        ['bob', 'data1', 'write', 'deny'],
      ]);
      expect(await allRows(db)).toHaveLength(0);
    });

    it('should handle empty array', async () => {
      await adapter.removePolicies('p', 'p', []);
      expect(await allRows(db)).toHaveLength(2);
    });
  });

  describe('removeFilteredPolicy', () => {
    beforeEach(async () => {
      await seedRules(db, [
        { ptype: 'p', v0: 'alice', v1: 'data1', v2: 'read', v3: 'allow' },
        { ptype: 'p', v0: 'alice', v1: 'data1', v2: 'write', v3: 'deny' },
        { ptype: 'p', v0: 'bob', v1: 'data1', v2: 'read', v3: 'allow' },
        { ptype: 'g', v0: 'alice', v1: 'role:admin' },
      ]);
    });

    it('should remove by fieldIndex=0', async () => {
      await adapter.removeFilteredPolicy('p', 'p', 0, 'alice');
      const rows = (await allRows(db)).filter((r: any) => r.ptype === 'p');
      expect(rows).toHaveLength(1);
      expect(rows[0].v0).toBe('bob');
    });

    it('should remove by multiple field values', async () => {
      await adapter.removeFilteredPolicy('p', 'p', 0, 'alice', 'data1', 'read');
      const rows = (await allRows(db)).filter((r: any) => r.ptype === 'p');
      expect(rows).toHaveLength(2);
    });

    it('should skip empty field values', async () => {
      await adapter.removeFilteredPolicy('p', 'p', 0, '', 'data1');
      const rows = (await allRows(db)).filter((r: any) => r.ptype === 'p');
      expect(rows).toHaveLength(0);
    });

    it('should not affect other ptypes', async () => {
      await adapter.removeFilteredPolicy('p', 'p', 0, 'alice');
      const gRows = (await allRows(db)).filter((r: any) => r.ptype === 'g');
      expect(gRows).toHaveLength(1);
    });
  });

  describe('round-trip', () => {
    it('should add then load', async () => {
      await adapter.addPolicy('p', 'p', ['alice', 'data1', 'read', 'allow']);

      const model = newModelFromString(MODEL);
      await adapter.loadPolicy(model);
      expect(model.getPolicy('p', 'p')).toEqual([
        ['alice', 'data1', 'read', 'allow'],
      ]);
    });

    it('should savePolicy then loadPolicy', async () => {
      const saveModel = newModelFromString(MODEL);
      Helper.loadPolicyLine('p, admin, data1, read, allow', saveModel);
      Helper.loadPolicyLine('g, alice, role:admin', saveModel);
      await adapter.savePolicy(saveModel);

      const loadModel = newModelFromString(MODEL);
      await adapter.loadPolicy(loadModel);
      expect(loadModel.getPolicy('p', 'p')).toHaveLength(1);
      expect(loadModel.getPolicy('g', 'g')).toHaveLength(1);
    });

    it('should add, filter, remove, verify', async () => {
      await adapter.addPolicies('p', 'p', [
        ['alice', 'data1', 'read', 'allow'],
        ['bob', 'data1', 'write', 'deny'],
      ]);
      await adapter.addPolicy('g', 'g', ['alice', 'role:admin']);

      const filtered = newModelFromString(MODEL);
      await adapter.loadFilteredPolicy(filtered, [{ ptype: 'p', v0: 'alice' }]);
      expect(filtered.getPolicy('p', 'p')).toHaveLength(1);

      await adapter.removePolicy('p', 'p', ['alice', 'data1', 'read', 'allow']);

      const after = newModelFromString(MODEL);
      await adapter.loadPolicy(after);
      expect(after.getPolicy('p', 'p')).toHaveLength(1);
      expect(after.getPolicy('g', 'g')).toHaveLength(1);
    });
  });
});
