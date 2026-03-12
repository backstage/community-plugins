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
import type {
  DatabaseService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import knex, { type Knex } from 'knex';
import { AdminConfigService } from './AdminConfigService';

function createMockLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
}

describe('AdminConfigService', () => {
  const mockLogger = createMockLogger();

  describe('before initialization', () => {
    it('throws on get when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new AdminConfigService(mockDb, mockLogger);
      await expect(service.get('swimLanes')).rejects.toThrow(
        'AdminConfigService not initialized',
      );
    });

    it('throws on set when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new AdminConfigService(mockDb, mockLogger);
      await expect(
        service.set('swimLanes', [], 'user:default/test'),
      ).rejects.toThrow('AdminConfigService not initialized');
    });

    it('throws on delete when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new AdminConfigService(mockDb, mockLogger);
      await expect(service.delete('swimLanes')).rejects.toThrow(
        'AdminConfigService not initialized',
      );
    });

    it('throws on listAll when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new AdminConfigService(mockDb, mockLogger);
      await expect(service.listAll()).rejects.toThrow(
        'AdminConfigService not initialized',
      );
    });
  });

  describe('initialize', () => {
    it('propagates database errors', async () => {
      const mockDb = {
        getClient: jest.fn().mockRejectedValue(new Error('DB unavailable')),
      };
      const service = new AdminConfigService(mockDb, mockLogger);

      await expect(service.initialize()).rejects.toThrow('DB unavailable');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('DB unavailable'),
      );
    });
  });

  describe('validateKey', () => {
    it('accepts valid keys', () => {
      expect(AdminConfigService.validateKey('swimLanes')).toBe('swimLanes');
      expect(AdminConfigService.validateKey('systemPrompt')).toBe(
        'systemPrompt',
      );
      expect(AdminConfigService.validateKey('branding')).toBe('branding');
      expect(AdminConfigService.validateKey('safetyPatterns')).toBe(
        'safetyPatterns',
      );
      expect(AdminConfigService.validateKey('vectorStoreConfig')).toBe(
        'vectorStoreConfig',
      );
    });

    it('rejects invalid keys with InputError', () => {
      expect(() => AdminConfigService.validateKey('invalid')).toThrow(
        InputError,
      );
      expect(() => AdminConfigService.validateKey('')).toThrow(InputError);
      expect(() => AdminConfigService.validateKey('DROP TABLE')).toThrow(
        InputError,
      );
    });
  });
});

describe('AdminConfigService (with database)', () => {
  let db: Knex;
  let mockDatabase: { getClient: jest.Mock };
  let mockLogger: Record<string, jest.Mock>;
  let service: AdminConfigService;

  beforeEach(async () => {
    db = knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });
    mockDatabase = {
      getClient: jest.fn().mockResolvedValue(db),
    } as { getClient: jest.Mock };
    mockLogger = createMockLogger();
    service = new AdminConfigService(
      mockDatabase as unknown as DatabaseService,
      mockLogger as unknown as LoggerService,
    );
    await service.initialize();
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('get', () => {
    it('returns undefined for a key that has not been set', async () => {
      const result = await service.get('swimLanes');
      expect(result).toBeUndefined();
    });

    it('returns the value after it has been set', async () => {
      const lanes = [{ id: 'lane-1', title: 'Test Lane', cards: [] }];
      await service.set('swimLanes', lanes, 'user:default/admin');
      const result = await service.get('swimLanes');
      expect(result).toEqual(lanes);
    });

    it('rejects invalid keys', async () => {
      await expect(
        service.get(
          'invalidKey' as import('@backstage-community/plugin-agentic-chat-common').AdminConfigKey,
        ),
      ).rejects.toThrow(InputError);
    });
  });

  describe('set', () => {
    it('inserts a new config entry', async () => {
      await service.set('systemPrompt', 'Hello world', 'user:default/admin');
      const result = await service.get('systemPrompt');
      expect(result).toBe('Hello world');
    });

    it('updates an existing config entry', async () => {
      await service.set('systemPrompt', 'Version 1', 'user:default/admin');
      await service.set('systemPrompt', 'Version 2', 'user:default/admin');
      const result = await service.get('systemPrompt');
      expect(result).toBe('Version 2');
    });

    it('tracks updated_by correctly', async () => {
      await service.set('branding', { appName: 'Test' }, 'user:default/alice');
      const entry = await service.getEntry('branding');
      expect(entry).toBeDefined();
      expect(entry!.updatedBy).toBe('user:default/alice');

      await service.set('branding', { appName: 'Test 2' }, 'user:default/bob');
      const updated = await service.getEntry('branding');
      expect(updated!.updatedBy).toBe('user:default/bob');
    });

    it('updates the updated_at timestamp on re-set', async () => {
      await service.set('safetyPatterns', ['delete'], 'user:default/admin');
      const first = await service.getEntry('safetyPatterns');

      await new Promise(r => setTimeout(r, 10));
      await service.set(
        'safetyPatterns',
        ['delete', 'remove'],
        'user:default/admin',
      );
      const second = await service.getEntry('safetyPatterns');

      expect(first!.updatedAt).not.toBe(second!.updatedAt);
    });

    it('handles complex JSON objects round-trip', async () => {
      const complex = {
        lanes: [
          {
            id: 'l1',
            title: 'Lane 1',
            color: '#ff0000',
            cards: [
              { title: 'Card 1', prompt: 'Do X', icon: 'search' },
              { title: 'Card 2', prompt: 'Do Y', description: 'Desc' },
            ],
          },
        ],
        nested: { deep: { value: [1, 2, 3] } },
      };
      await service.set('swimLanes', complex, 'user:default/admin');
      const result = await service.get('swimLanes');
      expect(result).toEqual(complex);
    });

    it('handles null and boolean values', async () => {
      await service.set('branding', null, 'user:default/admin');
      expect(await service.get('branding')).toBeNull();

      await service.set('branding', true, 'user:default/admin');
      expect(await service.get('branding')).toBe(true);

      await service.set('branding', false, 'user:default/admin');
      expect(await service.get('branding')).toBe(false);
    });

    it('rejects invalid keys', async () => {
      await expect(
        service.set(
          'badKey' as import('@backstage-community/plugin-agentic-chat-common').AdminConfigKey,
          'value',
          'user:default/admin',
        ),
      ).rejects.toThrow(InputError);
    });

    it('rejects undefined values', async () => {
      await expect(
        service.set('systemPrompt', undefined, 'user:default/admin'),
      ).rejects.toThrow(InputError);
    });

    it('handles concurrent upserts for the same key without error', async () => {
      const writes = Array.from({ length: 10 }, (_, i) =>
        service.set('systemPrompt', `Version ${i}`, 'user:default/admin'),
      );
      await expect(Promise.all(writes)).resolves.not.toThrow();
      const result = await service.get('systemPrompt');
      expect(typeof result).toBe('string');
    });
  });

  describe('delete', () => {
    it('returns true when deleting an existing entry', async () => {
      await service.set('swimLanes', [], 'user:default/admin');
      const deleted = await service.delete('swimLanes');
      expect(deleted).toBe(true);

      const result = await service.get('swimLanes');
      expect(result).toBeUndefined();
    });

    it('returns false when key does not exist in DB', async () => {
      const deleted = await service.delete('swimLanes');
      expect(deleted).toBe(false);
    });

    it('rejects invalid keys', async () => {
      await expect(
        service.delete(
          'badKey' as import('@backstage-community/plugin-agentic-chat-common').AdminConfigKey,
        ),
      ).rejects.toThrow(InputError);
    });
  });

  describe('getEntry', () => {
    it('returns full entry with metadata', async () => {
      await service.set(
        'branding',
        { appName: 'Test App' },
        'user:default/alice',
      );
      const entry = await service.getEntry('branding');

      expect(entry).toBeDefined();
      expect(entry!.configKey).toBe('branding');
      expect(entry!.configValue).toEqual({ appName: 'Test App' });
      expect(entry!.updatedBy).toBe('user:default/alice');
      expect(entry!.updatedAt).toBeDefined();
    });

    it('returns undefined for missing entry', async () => {
      const entry = await service.getEntry('branding');
      expect(entry).toBeUndefined();
    });
  });

  describe('listAll', () => {
    it('returns empty array when no entries exist', async () => {
      const entries = await service.listAll();
      expect(entries).toEqual([]);
    });

    it('returns all entries sorted by key', async () => {
      await service.set('swimLanes', [], 'user:default/admin');
      await service.set('branding', {}, 'user:default/admin');
      await service.set('systemPrompt', 'hello', 'user:default/admin');

      const entries = await service.listAll();
      expect(entries).toHaveLength(3);
      expect(entries[0].configKey).toBe('branding');
      expect(entries[1].configKey).toBe('swimLanes');
      expect(entries[2].configKey).toBe('systemPrompt');
    });

    it('reflects deletions', async () => {
      await service.set('swimLanes', [], 'user:default/admin');
      await service.set('branding', {}, 'user:default/admin');
      await service.delete('swimLanes');

      const entries = await service.listAll();
      expect(entries).toHaveLength(1);
      expect(entries[0].configKey).toBe('branding');
    });
  });

  describe('multiple keys isolation', () => {
    it('setting one key does not affect another', async () => {
      await service.set('swimLanes', [{ id: 'l1' }], 'user:default/admin');
      await service.set('branding', { appName: 'Test' }, 'user:default/admin');

      expect(await service.get('swimLanes')).toEqual([{ id: 'l1' }]);
      expect(await service.get('branding')).toEqual({ appName: 'Test' });

      await service.set('swimLanes', [{ id: 'l2' }], 'user:default/admin');
      expect(await service.get('branding')).toEqual({ appName: 'Test' });
    });
  });
});
