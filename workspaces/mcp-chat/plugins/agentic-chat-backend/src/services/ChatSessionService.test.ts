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
import knex, { type Knex } from 'knex';
import { ChatSessionService } from './ChatSessionService';

function createMockLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
}

describe('ChatSessionService', () => {
  const mockLogger = createMockLogger();

  describe('before initialization', () => {
    it('throws on createSession when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new ChatSessionService(mockDb, mockLogger);
      await expect(service.createSession('user:default/test')).rejects.toThrow(
        'Database not initialized',
      );
    });

    it('throws on listSessions when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new ChatSessionService(mockDb, mockLogger);
      await expect(service.listSessions('user:default/test')).rejects.toThrow(
        'Database not initialized',
      );
    });

    it('throws on getSession when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new ChatSessionService(mockDb, mockLogger);
      await expect(
        service.getSession('session-1', 'user:default/test'),
      ).rejects.toThrow('Database not initialized');
    });

    it('throws on deleteSession when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new ChatSessionService(mockDb, mockLogger);
      await expect(
        service.deleteSession('session-1', 'user:default/test'),
      ).rejects.toThrow('Database not initialized');
    });

    it('throws on setConversationId when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new ChatSessionService(mockDb, mockLogger);
      await expect(
        service.setConversationId('s1', 'user:default/test', 'conv1'),
      ).rejects.toThrow('Database not initialized');
    });

    it('throws on updateTitle when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new ChatSessionService(mockDb, mockLogger);
      await expect(
        service.updateTitle('s1', 'user:default/test', 'new title'),
      ).rejects.toThrow('Database not initialized');
    });

    it('throws on touch when not initialized', async () => {
      const mockDb = { getClient: jest.fn() };
      const service = new ChatSessionService(mockDb, mockLogger);
      await expect(service.touch('s1', 'user:default/test')).rejects.toThrow(
        'Database not initialized',
      );
    });
  });

  describe('initialize', () => {
    it('propagates database errors', async () => {
      const mockDb = {
        getClient: jest.fn().mockRejectedValue(new Error('DB unavailable')),
      };
      const service = new ChatSessionService(mockDb, mockLogger);

      await expect(service.initialize()).rejects.toThrow('DB unavailable');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('DB unavailable'),
      );
    });
  });
});

describe('ChatSessionService (with database)', () => {
  let db: Knex;
  let mockDatabase: { getClient: jest.Mock };
  let mockLogger: Record<string, jest.Mock>;
  let service: ChatSessionService;

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
    service = new ChatSessionService(
      mockDatabase as unknown as DatabaseService,
      mockLogger as unknown as LoggerService,
    );
    await service.initialize();
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('createSession', () => {
    it('creates session with default title', async () => {
      const session = await service.createSession('user:default/alice');
      expect(session.id).toBeDefined();
      expect(session.title).toMatch(/^Chat \d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
      expect(session.userRef).toBe('user:default/alice');
      expect(session.conversationId).toBeNull();
      expect(session.createdAt).toBeDefined();
      expect(session.updatedAt).toBeDefined();
    });

    it('creates session with custom title', async () => {
      const session = await service.createSession(
        'user:default/alice',
        'My custom chat',
      );
      expect(session.title).toBe('My custom chat');
      expect(session.userRef).toBe('user:default/alice');
    });

    it('different users get separate sessions', async () => {
      const aliceSession = await service.createSession(
        'user:default/alice',
        'Alice chat',
      );
      const bobSession = await service.createSession(
        'user:default/bob',
        'Bob chat',
      );
      expect(aliceSession.id).not.toBe(bobSession.id);
      expect(aliceSession.userRef).toBe('user:default/alice');
      expect(bobSession.userRef).toBe('user:default/bob');

      const aliceSessions = await service.listSessions('user:default/alice');
      const bobSessions = await service.listSessions('user:default/bob');
      expect(aliceSessions).toHaveLength(1);
      expect(bobSessions).toHaveLength(1);
      expect(aliceSessions[0].id).toBe(aliceSession.id);
      expect(bobSessions[0].id).toBe(bobSession.id);
    });
  });

  describe('listSessions', () => {
    it('lists user sessions in updated_at DESC order', async () => {
      const s1 = await service.createSession('user:default/alice', 'First');
      await new Promise(r => setTimeout(r, 5));
      const s2 = await service.createSession('user:default/alice', 'Second');
      await new Promise(r => setTimeout(r, 5));
      const s3 = await service.createSession('user:default/alice', 'Third');

      const sessions = await service.listSessions('user:default/alice');
      expect(sessions).toHaveLength(3);
      expect(sessions[0].id).toBe(s3.id);
      expect(sessions[1].id).toBe(s2.id);
      expect(sessions[2].id).toBe(s1.id);
    });

    it('respects limit param', async () => {
      await service.createSession('user:default/alice', '1');
      await service.createSession('user:default/alice', '2');
      await service.createSession('user:default/alice', '3');
      await service.createSession('user:default/alice', '4');
      await service.createSession('user:default/alice', '5');

      const sessions = await service.listSessions('user:default/alice', 2);
      expect(sessions).toHaveLength(2);
    });

    it('returns empty for unknown user', async () => {
      await service.createSession('user:default/alice', 'Alice chat');
      const sessions = await service.listSessions('user:default/unknown');
      expect(sessions).toEqual([]);
    });
  });

  describe('getSession', () => {
    it('returns matching session', async () => {
      const created = await service.createSession(
        'user:default/alice',
        'My session',
      );
      const found = await service.getSession(created.id, 'user:default/alice');
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.title).toBe('My session');
      expect(found!.userRef).toBe('user:default/alice');
    });

    it('returns null for wrong user', async () => {
      const created = await service.createSession(
        'user:default/alice',
        'Alice session',
      );
      const found = await service.getSession(created.id, 'user:default/bob');
      expect(found).toBeNull();
    });

    it('returns null for non-existent session', async () => {
      const found = await service.getSession(
        'non-existent-id',
        'user:default/alice',
      );
      expect(found).toBeNull();
    });
  });

  describe('deleteSession', () => {
    it('deletes session', async () => {
      const created = await service.createSession(
        'user:default/alice',
        'To delete',
      );
      const deleted = await service.deleteSession(
        created.id,
        'user:default/alice',
      );
      expect(deleted).toBe(true);

      const found = await service.getSession(created.id, 'user:default/alice');
      expect(found).toBeNull();
    });

    it('returns false if not found', async () => {
      const deleted = await service.deleteSession(
        'non-existent-id',
        'user:default/alice',
      );
      expect(deleted).toBe(false);
    });

    it("can't delete another user's session", async () => {
      const created = await service.createSession(
        'user:default/alice',
        'Alice session',
      );
      const deleted = await service.deleteSession(
        created.id,
        'user:default/bob',
      );
      expect(deleted).toBe(false);

      const found = await service.getSession(created.id, 'user:default/alice');
      expect(found).not.toBeNull();
    });
  });

  describe('setConversationId', () => {
    it('sets conversation ID on a session', async () => {
      const created = await service.createSession(
        'user:default/alice',
        'My chat',
      );
      expect(created.conversationId).toBeNull();

      await service.setConversationId(
        created.id,
        'user:default/alice',
        'conv-123',
      );

      const found = await service.getSession(created.id, 'user:default/alice');
      expect(found!.conversationId).toBe('conv-123');
    });
  });

  describe('updateTitle', () => {
    it('updates title', async () => {
      const created = await service.createSession(
        'user:default/alice',
        'Original title',
      );
      await service.updateTitle(
        created.id,
        'user:default/alice',
        'Updated title',
      );

      const found = await service.getSession(created.id, 'user:default/alice');
      expect(found!.title).toBe('Updated title');
    });
  });

  describe('touch', () => {
    it('updates the updated_at timestamp', async () => {
      const created = await service.createSession(
        'user:default/alice',
        'My chat',
      );
      const originalUpdatedAt = created.updatedAt;

      await new Promise(r => setTimeout(r, 10));
      await service.touch(created.id, 'user:default/alice');

      const found = await service.getSession(created.id, 'user:default/alice');
      expect(found!.updatedAt).not.toBe(originalUpdatedAt);
      expect(new Date(found!.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime(),
      );
    });
  });
});
