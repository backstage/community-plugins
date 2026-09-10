/*
 * Copyright 2026 The Backstage Authors
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

import { Enforcer, newEnforcer, newModelFromString } from 'casbin';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';

import {
  catalogMock,
  conditionalStorageMock,
  mockAuditorService,
} from '../../__fixtures__/mock-utils';
import { CasbinKnexAdapter } from '../database/casbin-knex-adapter';
import { migrate } from '../database/migration';
import {
  DataBaseRoleMetadataStorage,
  ROLE_METADATA_TABLE,
} from '../database/role-metadata';
import { DefaultPermissionsReader } from '../default-permissions/default-permissions';
import { BackstageRoleManager } from '../role-manager/role-manager';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';

jest.setTimeout(60000);

const groupingPolicy = ['user:default/tom', 'role:default/dev-team'];
const modifiedBy = 'user:default/some-admin';

describe('EnforcerDelegate Casbin + role-metadata transactions', () => {
  async function createHarness(): Promise<{
    knex: Knex.Knex;
    mockClient: Knex.Knex;
    enf: Enforcer;
    delegate: EnforcerDelegate;
  }> {
    const knex = Knex.knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });
    const mockClient = Knex.knex({ client: MockClient });

    await migrate(
      mockServices.database.mock({
        getClient: async () => knex,
        migrations: { skip: false },
      }),
      knex,
    );

    const adapter = await CasbinKnexAdapter.newAdapter(knex);
    const enf = await newEnforcer(newModelFromString(MODEL), adapter);
    const rm = new BackstageRoleManager(
      catalogMock,
      mockServices.logger.mock(),
      mockClient,
      mockClient,
      mockServices.rootConfig({
        data: {
          permission: { rbac: {} },
        },
      }),
      mockServices.auth(),
      new DefaultPermissionsReader(
        mockServices.rootConfig({ data: { permission: { rbac: {} } } }),
      ),
    );
    enf.setRoleManager(rm);
    enf.enableAutoBuildRoleLinks(false);
    await enf.buildRoleLinks();

    const delegate = new EnforcerDelegate(
      enf,
      mockAuditorService,
      conditionalStorageMock,
      new DataBaseRoleMetadataStorage(knex),
      knex,
    );

    return { knex, mockClient, enf, delegate };
  }

  async function rowCounts(knex: Knex.Knex): Promise<{
    casbin: number;
    metadata: number;
  }> {
    const casbin = await knex('casbin_rule').count('id as c').first();
    const metadata = await knex(ROLE_METADATA_TABLE).count('id as c').first();
    return {
      casbin: Number(casbin?.c ?? 0),
      metadata: Number(metadata?.c ?? 0),
    };
  }

  it('commits grouping policy and role metadata together', async () => {
    const { knex, mockClient, delegate } = await createHarness();
    try {
      await delegate.addGroupingPolicy(groupingPolicy, {
        source: 'rest',
        roleEntityRef: 'role:default/dev-team',
        author: modifiedBy,
        modifiedBy,
      });

      const counts = await rowCounts(knex);
      expect(counts.casbin).toBe(1);
      expect(counts.metadata).toBe(1);

      const rule = await knex('casbin_rule').first();
      expect(rule).toMatchObject({
        ptype: 'g',
        v0: 'user:default/tom',
        v1: 'role:default/dev-team',
      });
      const meta = await knex(ROLE_METADATA_TABLE).first();
      expect(meta?.roleEntityRef).toBe('role:default/dev-team');
      expect(meta?.source).toBe('rest');
    } finally {
      await knex.destroy();
      await mockClient.destroy();
    }
  });

  it('rolls back casbin_rule and role-metadata when the caller rolls back an external transaction', async () => {
    const { knex, mockClient, delegate } = await createHarness();
    try {
      const trx = await knex.transaction();
      await delegate.addGroupingPolicy(
        groupingPolicy,
        {
          source: 'rest',
          roleEntityRef: 'role:default/dev-team',
          author: modifiedBy,
          modifiedBy,
        },
        trx,
      );

      const inside = await rowCounts(trx);
      expect(inside.casbin).toBe(1);
      expect(inside.metadata).toBe(1);

      await trx.rollback();

      const after = await rowCounts(knex);
      expect(after.casbin).toBe(0);
      expect(after.metadata).toBe(0);
    } finally {
      await knex.destroy();
      await mockClient.destroy();
    }
  });

  it('rolls back casbin_rule and role-metadata when Casbin write fails after metadata insert', async () => {
    const { knex, mockClient, enf, delegate } = await createHarness();
    try {
      const original = enf.addGroupingPolicy.bind(enf);
      jest
        .spyOn(enf, 'addGroupingPolicy')
        .mockImplementation(async (...args: string[]) => {
          await original(...args);
          throw new Error('casbin write failed');
        });

      await expect(
        delegate.addGroupingPolicy(groupingPolicy, {
          source: 'rest',
          roleEntityRef: 'role:default/dev-team',
          author: modifiedBy,
          modifiedBy,
        }),
      ).rejects.toThrow('casbin write failed');

      const after = await rowCounts(knex);
      expect(after.casbin).toBe(0);
      expect(after.metadata).toBe(0);
    } finally {
      await knex.destroy();
      await mockClient.destroy();
    }
  });
});
