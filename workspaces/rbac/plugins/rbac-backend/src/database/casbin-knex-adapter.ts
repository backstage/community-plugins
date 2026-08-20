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
import type { BatchAdapter, FilteredAdapter, Model } from 'casbin';
import { knex as knexFactory, type Knex } from 'knex';

const TABLE_NAME = 'casbin_rule';

const POLICY_COLUMNS = ['ptype', 'v0', 'v1', 'v2', 'v3', 'v4', 'v5'] as const;

const SELECT_COLS = POLICY_COLUMNS.join(', ');
const SELECT_ALL = `SELECT ${SELECT_COLS} FROM "${TABLE_NAME}"`;

interface CasbinRule {
  ptype: string;
  v0: string | null;
  v1: string | null;
  v2: string | null;
  v3: string | null;
  v4: string | null;
  v5: string | null;
}

export type CasbinPolicyFilter = Array<Partial<CasbinRule>>;

function loadRowIntoModel(row: CasbinRule, model: Model): void {
  const sec = row.ptype.substring(0, 1);
  const ast = model.model.get(sec)?.get(row.ptype);
  if (!ast) return;

  let len: number;
  if (row.v5) len = 6;
  else if (row.v4) len = 5;
  else if (row.v3) len = 4;
  else if (row.v2) len = 3;
  else if (row.v1) len = 2;
  else if (row.v0) len = 1;
  else return;

  const rule: string[] = new Array(len);
  if (len >= 1) rule[0] = row.v0 ?? '';
  if (len >= 2) rule[1] = row.v1 ?? '';
  if (len >= 3) rule[2] = row.v2 ?? '';
  if (len >= 4) rule[3] = row.v3 ?? '';
  if (len >= 5) rule[4] = row.v4 ?? '';
  if (len >= 6) rule[5] = row.v5 ?? '';

  ast.policy.push(rule);
}

function ruleToRow(ptype: string, rule: string[]): CasbinRule {
  return {
    ptype,
    v0: rule[0] ?? null,
    v1: rule[1] ?? null,
    v2: rule[2] ?? null,
    v3: rule[3] ?? null,
    v4: rule[4] ?? null,
    v5: rule[5] ?? null,
  };
}

export class CasbinKnexAdapter implements FilteredAdapter, BatchAdapter {
  private filtered = false;
  private activeTrx?: Knex.Transaction;
  private dedicatedPool?: Knex;

  private readonly sqlCache = new Map<string, string>();

  private constructor(private readonly knex: Knex) {}

  static async newAdapter(knex: Knex): Promise<CasbinKnexAdapter> {
    return new CasbinKnexAdapter(knex);
  }

  static async newAdapterWithDedicatedPool(
    parentKnex: Knex,
    poolConfig?: { min?: number; max?: number },
  ): Promise<CasbinKnexAdapter> {
    const cfg = parentKnex.client.config;
    const dedicatedKnex = knexFactory({
      client: cfg.client,
      connection: cfg.connection,
      pool: poolConfig ?? { min: 2, max: 10 },
      searchPath: cfg.searchPath,
    });
    const adapter = new CasbinKnexAdapter(dedicatedKnex);
    adapter.dedicatedPool = dedicatedKnex;
    return adapter;
  }

  async destroy(): Promise<void> {
    if (this.dedicatedPool) {
      await this.dedicatedPool.destroy();
      this.dedicatedPool = undefined;
    }
  }

  async runWithTransaction<T>(
    trx: Knex.Transaction,
    fn: () => Promise<T>,
  ): Promise<T> {
    const previous = this.activeTrx;
    this.activeTrx = trx;
    try {
      return await fn();
    } finally {
      this.activeTrx = previous;
    }
  }

  isSameClient(trx: Knex.Transaction): boolean {
    return trx.client.config === this.knex.client.config;
  }

  private db(): Knex | Knex.Transaction {
    return this.activeTrx ?? this.knex;
  }

  isFiltered(): boolean {
    return this.filtered;
  }

  async loadPolicy(model: Model): Promise<void> {
    const result = await this.db().raw(SELECT_ALL);
    const rows: CasbinRule[] = Array.isArray(result) ? result : result.rows;
    for (const row of rows) {
      loadRowIntoModel(row, model);
    }
    this.filtered = false;
  }

  async loadFilteredPolicy(
    model: Model,
    filter: CasbinPolicyFilter,
  ): Promise<void> {
    if (!filter || filter.length === 0) {
      await this.loadPolicy(model);
      return;
    }

    const sql = this.getFilterSQL(filter);
    const bindings = this.getFilterBindings(filter);
    const result = await this.db().raw(sql, bindings);
    const rows: CasbinRule[] = Array.isArray(result) ? result : result.rows;

    for (const row of rows) {
      loadRowIntoModel(row, model);
    }
    this.filtered = true;
  }

  private getFilterSQL(filter: CasbinPolicyFilter): string {
    const cacheKey = this.buildCacheKey(filter);
    let sql = this.sqlCache.get(cacheKey);
    if (sql !== undefined) return sql;

    if (filter.length === 1) {
      const keys = Object.keys(filter[0]).sort();
      sql = `${SELECT_ALL} WHERE ${keys.map(k => `"${k}" = ?`).join(' AND ')}`;
    } else {
      const groups = filter.map(f => {
        const keys = Object.keys(f).sort();
        return `(${keys.map(k => `"${k}" = ?`).join(' AND ')})`;
      });
      sql = `${SELECT_ALL} WHERE ${groups.join(' OR ')}`;
    }

    this.sqlCache.set(cacheKey, sql);
    return sql;
  }

  private buildCacheKey(filter: CasbinPolicyFilter): string {
    return filter.map(f => Object.keys(f).sort().join(',')).join('|');
  }

  private getFilterBindings(filter: CasbinPolicyFilter): unknown[] {
    const bindings: unknown[] = [];
    for (const f of filter) {
      for (const key of Object.keys(f).sort()) {
        bindings.push((f as Record<string, unknown>)[key]);
      }
    }
    return bindings;
  }

  async savePolicy(model: Model): Promise<boolean> {
    const rows: CasbinRule[] = [];

    for (const [, policyMap] of model.model) {
      for (const [ptype, assertion] of policyMap) {
        for (const rule of assertion.policy) {
          rows.push(ruleToRow(ptype, rule));
        }
      }
    }

    await this.runInTransaction(async trx => {
      await trx(TABLE_NAME).del();
      if (rows.length > 0) {
        await trx.batchInsert(TABLE_NAME, rows, 50);
      }
    });

    return true;
  }

  async addPolicy(_sec: string, ptype: string, rule: string[]): Promise<void> {
    await this.db()(TABLE_NAME).insert(ruleToRow(ptype, rule));
  }

  async addPolicies(
    _sec: string,
    ptype: string,
    rules: string[][],
  ): Promise<void> {
    if (rules.length === 0) return;
    const rows = rules.map(rule => ruleToRow(ptype, rule));
    await this.runInTransaction(async trx => {
      await trx.batchInsert(TABLE_NAME, rows, 50);
    });
  }

  async removePolicy(
    _sec: string,
    ptype: string,
    rule: string[],
  ): Promise<void> {
    const where: Record<string, string> = { ptype };
    for (let i = 0; i < rule.length; i++) {
      where[`v${i}`] = rule[i];
    }
    await this.db()(TABLE_NAME).where(where).del();
  }

  async removePolicies(
    _sec: string,
    ptype: string,
    rules: string[][],
  ): Promise<void> {
    if (rules.length === 0) return;
    await this.runInTransaction(async trx => {
      for (const rule of rules) {
        const where: Record<string, string> = { ptype };
        for (let i = 0; i < rule.length; i++) {
          where[`v${i}`] = rule[i];
        }
        await trx(TABLE_NAME).where(where).del();
      }
    });
  }

  async removeFilteredPolicy(
    _sec: string,
    ptype: string,
    fieldIndex: number,
    ...fieldValues: string[]
  ): Promise<void> {
    const where: Record<string, string> = { ptype };
    for (let i = 0; i < fieldValues.length; i++) {
      if (fieldValues[i] !== '') {
        where[`v${fieldIndex + i}`] = fieldValues[i];
      }
    }
    await this.db()(TABLE_NAME).where(where).del();
  }

  private async runInTransaction(
    fn: (trx: Knex.Transaction) => Promise<void>,
  ): Promise<void> {
    if (this.activeTrx) {
      await fn(this.activeTrx);
      return;
    }
    await this.knex.transaction(fn);
  }
}
