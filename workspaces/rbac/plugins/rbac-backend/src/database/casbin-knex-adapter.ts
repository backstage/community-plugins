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
import { Helper } from 'casbin';
import type { Knex } from 'knex';

const TABLE_NAME = 'casbin_rule';

const POLICY_COLUMNS = ['ptype', 'v0', 'v1', 'v2', 'v3', 'v4', 'v5'] as const;

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

function rowToLine(row: CasbinRule): string {
  const values = [row.v0, row.v1, row.v2, row.v3, row.v4, row.v5];
  while (values.length > 0 && !values[values.length - 1]) {
    values.pop();
  }
  return `${row.ptype}, ${values.join(', ')}`;
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

  private constructor(private readonly knex: Knex) {}

  static async newAdapter(knex: Knex): Promise<CasbinKnexAdapter> {
    return new CasbinKnexAdapter(knex);
  }

  isFiltered(): boolean {
    return this.filtered;
  }

  async loadPolicy(model: Model): Promise<void> {
    const rows: CasbinRule[] = await this.knex(TABLE_NAME).select(
      POLICY_COLUMNS as unknown as string[],
    );
    for (const row of rows) {
      Helper.loadPolicyLine(rowToLine(row), model);
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

    const query = this.knex(TABLE_NAME);

    if (filter.length === 1) {
      query.where(filter[0]);
    } else {
      query.where(function (builder) {
        for (const f of filter) {
          builder.orWhere(f);
        }
      });
    }

    const rows: CasbinRule[] = await query.select(
      POLICY_COLUMNS as unknown as string[],
    );
    for (const row of rows) {
      Helper.loadPolicyLine(rowToLine(row), model);
    }
    this.filtered = true;
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

    await this.knex.transaction(async trx => {
      await trx(TABLE_NAME).del();
      if (rows.length > 0) {
        await trx.batchInsert(TABLE_NAME, rows, 50);
      }
    });

    return true;
  }

  async addPolicy(_sec: string, ptype: string, rule: string[]): Promise<void> {
    await this.knex(TABLE_NAME).insert(ruleToRow(ptype, rule));
  }

  async addPolicies(
    _sec: string,
    ptype: string,
    rules: string[][],
  ): Promise<void> {
    if (rules.length === 0) return;
    const rows = rules.map(rule => ruleToRow(ptype, rule));
    await this.knex.transaction(async trx => {
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
    await this.knex(TABLE_NAME).where(where).del();
  }

  async removePolicies(
    _sec: string,
    ptype: string,
    rules: string[][],
  ): Promise<void> {
    if (rules.length === 0) return;
    await this.knex.transaction(async trx => {
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
    await this.knex(TABLE_NAME).where(where).del();
  }
}
