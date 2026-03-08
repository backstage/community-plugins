/*
 * Copyright 2025 The Backstage Authors
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

import knex, { type Knex } from 'knex';
import { mockServices } from '@backstage/backend-test-utils';
import { AdminConfigService } from './AdminConfigService';

const TABLE_NAME = 'agentic_chat_admin_config';

let db: Knex;
let adminConfig: AdminConfigService;

beforeEach(async () => {
  db = knex({
    client: 'better-sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
  });
  const mockDatabase = { getClient: jest.fn().mockResolvedValue(db) };
  adminConfig = new AdminConfigService(
    mockDatabase as import('@backstage/backend-plugin-api').DatabaseService,
    mockServices.logger.mock(),
  );
  await adminConfig.initialize();
});

afterEach(async () => {
  await db.destroy();
});

describe('AdminConfigService scoped key resolution and migration', () => {
  describe('resolveStorageKey', () => {
    it('returns provider-scoped key for model', () => {
      expect(adminConfig.resolveStorageKey('model', 'llamastack')).toBe(
        'llamastack::model',
      );
    });

    it('returns global key for branding', () => {
      expect(adminConfig.resolveStorageKey('branding', 'llamastack')).toBe(
        'branding',
      );
    });

    it('returns activeProvider as-is', () => {
      expect(
        adminConfig.resolveStorageKey('activeProvider', 'llamastack'),
      ).toBe('activeProvider');
    });
  });

  describe('scoped CRUD', () => {
    it('setScopedValue stores under scoped key', async () => {
      await adminConfig.setScopedValue(
        'model',
        'test-model',
        'llamastack',
        'user:default/admin',
      );
      const value = await adminConfig.getScopedValue('model', 'llamastack');
      expect(value).toBe('test-model');
    });

    it('getScopedValue returns undefined for different provider', async () => {
      await adminConfig.setScopedValue(
        'model',
        'test-model',
        'llamastack',
        'user:default/admin',
      );
      const value = await adminConfig.getScopedValue('model', 'googleadk');
      expect(value).toBeUndefined();
    });

    it('deleteScopedValue removes the scoped key', async () => {
      await adminConfig.setScopedValue(
        'model',
        'test-model',
        'llamastack',
        'user:default/admin',
      );
      const deleted = await adminConfig.deleteScopedValue(
        'model',
        'llamastack',
      );
      expect(deleted).toBe(true);
      expect(
        await adminConfig.getScopedValue('model', 'llamastack'),
      ).toBeUndefined();
    });
  });

  describe('migration: flat to scoped keys', () => {
    it('migrates flat keys to scoped format and is idempotent', async () => {
      const now = new Date().toISOString();
      await db(TABLE_NAME).insert([
        {
          config_key: 'model',
          config_value: JSON.stringify('legacy-model'),
          updated_at: now,
          updated_by: 'legacy',
        },
        {
          config_key: 'baseUrl',
          config_value: JSON.stringify('https://legacy.example.com'),
          updated_at: now,
          updated_by: 'legacy',
        },
      ]);

      const adminConfig2 = new AdminConfigService(
        {
          getClient: jest.fn().mockResolvedValue(db),
        } as import('@backstage/backend-plugin-api').DatabaseService,
        mockServices.logger.mock(),
      );
      await adminConfig2.initialize();

      expect(await adminConfig2.getRawValue('model')).toBeUndefined();
      expect(await adminConfig2.getRawValue('baseUrl')).toBeUndefined();
      expect(await adminConfig2.getRawValue('llamastack::model')).toBe(
        'legacy-model',
      );
      expect(await adminConfig2.getRawValue('llamastack::baseUrl')).toBe(
        'https://legacy.example.com',
      );

      await adminConfig2.initialize();
      expect(await adminConfig2.getRawValue('llamastack::model')).toBe(
        'legacy-model',
      );
      expect(await adminConfig2.getRawValue('llamastack::baseUrl')).toBe(
        'https://legacy.example.com',
      );
    });
  });
});
