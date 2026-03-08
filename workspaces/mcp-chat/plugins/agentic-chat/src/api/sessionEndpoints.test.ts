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

import type { SessionApiDeps } from './sessionEndpoints';
import {
  listSessions,
  createSession,
  deleteSession,
  getSessionMessages,
  listAllSessions,
  getAdminSessionMessages,
} from './sessionEndpoints';
import { createMockResponse } from '../test-utils/factories';

describe('sessionEndpoints', () => {
  const baseUrl = 'http://localhost:7007/api/agentic-chat';

  function createDeps(overrides: Partial<SessionApiDeps> = {}): SessionApiDeps {
    return {
      fetchJson: jest.fn(),
      fetchJsonSafe: jest.fn(),
      discoveryApi: {
        getBaseUrl: jest.fn().mockResolvedValue(baseUrl),
      } as unknown as SessionApiDeps['discoveryApi'],
      fetchApi: {
        fetch: jest.fn(),
      } as unknown as SessionApiDeps['fetchApi'],
      ...overrides,
    };
  }

  describe('Chat Sessions', () => {
    describe('listSessions', () => {
      it('should fetch sessions with default params', async () => {
        const deps = createDeps();
        const mockSessions = [{ id: 's1', title: 'Session 1' }];
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          sessions: mockSessions,
        });

        const result = await listSessions(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/sessions');
        expect(result).toEqual(mockSessions);
      });

      it('should include limit and offset in query', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({ sessions: [] });

        await listSessions(deps, 10, 5);

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/sessions?limit=10&offset=5',
        );
      });

      it('should return empty array when sessions missing', async () => {
        const deps = createDeps();
        (deps.fetchJson as jest.Mock).mockResolvedValue({});

        const result = await listSessions(deps);

        expect(result).toEqual([]);
      });
    });

    describe('createSession', () => {
      it('should create session with title', async () => {
        const deps = createDeps();
        const mockSession = { id: 's1', title: 'New Session' };
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          session: mockSession,
        });

        const result = await createSession(deps, 'New Session');

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/sessions',
          expect.objectContaining({
            body: JSON.stringify({ title: 'New Session' }),
          }),
        );
        expect(result).toEqual(mockSession);
      });

      it('should create session without title', async () => {
        const deps = createDeps();
        const mockSession = { id: 's1', title: '' };
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          session: mockSession,
        });

        await createSession(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith(
          '/sessions',
          expect.objectContaining({
            body: JSON.stringify({ title: undefined }),
          }),
        );
      });
    });

    describe('deleteSession', () => {
      it('should DELETE session and return true on success', async () => {
        const deps = createDeps();
        (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({ success: true });

        const result = await deleteSession(deps, 'session-1');

        expect(deps.fetchJsonSafe).toHaveBeenCalledWith(
          '/sessions/session-1',
          { success: false },
          { method: 'DELETE' },
        );
        expect(result).toBe(true);
      });

      it('should return false when success is not true', async () => {
        const deps = createDeps();
        (deps.fetchJsonSafe as jest.Mock).mockResolvedValue({ success: false });

        const result = await deleteSession(deps, 'session-1');

        expect(result).toBe(false);
      });
    });

    describe('getSessionMessages', () => {
      it('should fetch session messages', async () => {
        const deps = createDeps();
        const mockData = {
          messages: [{ role: 'user', text: 'Hi' }],
          sessionCreatedAt: '2025-01-15',
        };
        (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
          createMockResponse({
            ok: true,
            json: jest.fn().mockResolvedValue(mockData),
          }),
        );

        const result = await getSessionMessages(deps, 'session-1');

        expect(deps.fetchApi.fetch).toHaveBeenCalledWith(
          `${baseUrl}/sessions/session-1/messages`,
        );
        expect(result.messages).toEqual(mockData.messages);
        expect(result.sessionCreatedAt).toBe('2025-01-15');
      });

      it('should return empty messages on 404', async () => {
        const deps = createDeps();
        (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
          createMockResponse({ ok: false, status: 404 }),
        );

        const result = await getSessionMessages(deps, 'nonexistent');

        expect(result.messages).toEqual([]);
      });
    });
  });

  describe('Admin Sessions', () => {
    describe('listAllSessions', () => {
      it('should fetch all sessions', async () => {
        const deps = createDeps();
        const mockSessions = [{ id: 's1', title: 'Session 1' }];
        (deps.fetchJson as jest.Mock).mockResolvedValue({
          sessions: mockSessions,
        });

        const result = await listAllSessions(deps);

        expect(deps.fetchJson).toHaveBeenCalledWith('/admin/sessions');
        expect(result).toEqual(mockSessions);
      });
    });

    describe('getAdminSessionMessages', () => {
      it('should fetch session messages', async () => {
        const deps = createDeps();
        const mockData = {
          messages: [{ role: 'user', text: 'Hi' }],
          sessionCreatedAt: '2025-01-15',
        };
        (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
          createMockResponse({
            ok: true,
            json: jest.fn().mockResolvedValue(mockData),
          }),
        );

        const result = await getAdminSessionMessages(deps, 'session-1');

        expect(deps.fetchApi.fetch).toHaveBeenCalledWith(
          `${baseUrl}/admin/sessions/session-1/messages`,
        );
        expect(result.messages).toEqual(mockData.messages);
        expect(result.sessionCreatedAt).toBe('2025-01-15');
      });

      it('should return empty messages on 404', async () => {
        const deps = createDeps();
        (deps.fetchApi.fetch as jest.Mock).mockResolvedValue(
          createMockResponse({ ok: false, status: 404 }),
        );

        const result = await getAdminSessionMessages(deps, 'nonexistent');

        expect(result.messages).toEqual([]);
      });
    });
  });
});
