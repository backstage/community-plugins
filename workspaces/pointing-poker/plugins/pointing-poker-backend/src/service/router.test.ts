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
import express from 'express';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { mockServices } from '@backstage/backend-test-utils';
import { AuthenticationError } from '@backstage/errors';
import { createRouter } from './router';

const session = {
  id: 'sess',
  createdBy: 'alice',
  teamRef: 'group:default/team-a',
  currentStoryId: 's1',
  participants: [
    { userId: 'alice', role: 'host' },
    { userId: 'bob', role: 'voter' },
    { userId: 'olivia', role: 'observer' },
  ],
  stories: [{ id: 's1', presenterUserId: 'bob' }, { id: 's2' }],
};

describe('createRouter', () => {
  let server: Server;
  let baseUrl: string;

  const db = {
    getSession: jest.fn(),
    getTicketRoles: jest.fn(),
    getLobbySessions: jest.fn(),
    getHistorySessions: jest.fn(),
    getTeamQuery: jest.fn(),
    saveTeamQuery: jest.fn(),
    getTeamCards: jest.fn(),
    saveTeamCards: jest.fn(),
    castVote: jest.fn(),
    unvote: jest.fn(),
    heartbeat: jest.fn(),
    leaveSession: jest.fn(),
    joinSession: jest.fn(),
    updateRole: jest.fn(),
    setRevealed: jest.fn(),
    acceptEstimate: jest.fn(),
    skipStory: jest.fn(),
    newRound: jest.fn(),
    activateStory: jest.fn(),
    setPresenter: jest.fn(),
    splitStory: jest.fn(),
    resolveSplit: jest.fn(),
    createSession: jest.fn(),
    saveAvatarPref: jest.fn(),
    getAvatarPref: jest.fn(),
    endSession: jest.fn(),
    reopenSession: jest.fn(),
    deleteSession: jest.fn(),
  };
  const provider = {
    providerId: 'test',
    postComment: jest.fn(),
    setEstimate: jest.fn(),
  };

  // Everyone is in team-a except mallory, who only belongs to team-b.
  const catalog = {
    getEntityByRef: async (ref: string) => ({
      relations: [
        {
          type: 'memberOf',
          targetRef:
            ref === 'user:default/mallory'
              ? 'group:default/team-b'
              : 'group:default/team-a',
        },
      ],
    }),
  };

  // Stands in for the real auth service: the caller is named in a header.
  const httpAuth = {
    credentials: async (req: express.Request) => {
      const user = req.header('x-test-user');
      if (!user) throw new AuthenticationError('Missing credentials');
      return {
        principal: { type: 'user', userEntityRef: `user:default/${user}` },
      };
    },
  };

  beforeAll(async () => {
    const app = express();
    app.use(
      createRouter({
        catalog: catalog as any,
        db: db as any,
        httpAuth: httpAuth as any,
        logger: mockServices.logger.mock(),
        ticketProvider: () => provider as any,
      }),
    );
    server = await new Promise<Server>(resolve => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise(resolve => server.close(resolve)));

  beforeEach(() => {
    jest.clearAllMocks();
    db.getSession.mockImplementation(async (id: string) =>
      id === 'sess' ? session : null,
    );
    Object.values(db).forEach(
      fn => fn !== db.getSession && fn.mockResolvedValue({}),
    );
    // alice hosts and bob votes in the sessions that contain ABC-1.
    const roles: Record<string, string[]> = { alice: ['host'], bob: ['voter'] };
    db.getTicketRoles.mockImplementation(async (user: string, key: string) =>
      key === 'ABC-1' ? roles[user] ?? [] : [],
    );
  });

  const call = async (
    method: string,
    path: string,
    user?: string,
    body?: unknown,
  ) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(user ? { 'x-test-user': user } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return res.status;
  };

  it('takes the caller identity from credentials, not the request body', async () => {
    expect(await call('POST', '/sessions/sess/vote')).toBe(401);

    // A forged userId in the body is replaced by the authenticated user.
    expect(
      await call('POST', '/sessions/sess/vote', 'bob', {
        userId: 'alice',
        userName: 'Bob',
        value: '5',
      }),
    ).toBe(200);
    expect(db.castVote).toHaveBeenCalledWith(
      'sess',
      expect.objectContaining({ userId: 'bob', value: '5' }),
    );

    expect(
      await call('POST', '/sessions/sess/heartbeat', 'bob', {
        userId: 'alice',
      }),
    ).toBe(204);
    expect(db.heartbeat).toHaveBeenCalledWith('sess', 'bob');

    expect(
      await call('POST', '/sessions', 'bob', {
        userId: 'alice',
        name: 'x',
        teamRef: 'group:default/team-a',
      }),
    ).toBe(201);
    expect(db.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'bob' }),
    );

    // Ticket comments are attributed to the verified user too.
    expect(
      await call('POST', '/tickets/ABC-1/comments', 'bob', {
        body: 'hi',
        author: 'alice',
      }),
    ).toBe(204);
    expect(provider.postComment).toHaveBeenCalledWith('ABC-1', 'hi', 'bob');

    // Observers cannot vote, and users who have not joined cannot either.
    expect(
      await call('POST', '/sessions/sess/vote', 'olivia', { value: '3' }),
    ).toBe(403);
    expect(
      await call('POST', '/sessions/sess/vote', 'mallory', { value: '3' }),
    ).toBe(403);

    // Avatar preferences are private to their owner.
    expect(await call('GET', '/avatar-pref?userId=alice', 'bob')).toBe(403);
    expect(await call('GET', '/avatar-pref?userId=bob', 'bob')).toBe(200);
    expect(await call('GET', '/avatar-pref', 'bob')).toBe(200);
    expect(db.getAvatarPref).toHaveBeenLastCalledWith('bob');
  });

  it('only lets the host drive the session', async () => {
    const hostOnly: Array<[string, unknown?]> = [
      ['/sessions/sess/reveal', { revealed: true }],
      ['/sessions/sess/accept', { estimate: '5' }],
      ['/sessions/sess/skip'],
      ['/sessions/sess/new-round'],
      ['/sessions/sess/stories/s2/activate'],
      ['/sessions/sess/stories/s1/split', { subtasks: [{ title: 'a' }] }],
      ['/sessions/sess/stories/s1/resolve-split', { mode: 'sum' }],
    ];

    for (const [path, body] of hostOnly) {
      expect(await call('POST', path, 'bob', body ?? {})).toBe(403);
      expect(await call('POST', path, 'olivia', body ?? {})).toBe(403);
      expect(await call('POST', path, 'alice', body ?? {})).toBe(200);
    }
    expect(db.setRevealed).toHaveBeenCalledTimes(1);
    expect(db.acceptEstimate).toHaveBeenCalledTimes(1);
    expect(db.activateStory).toHaveBeenCalledTimes(1);

    // Stories from another session cannot be targeted.
    expect(
      await call('POST', '/sessions/sess/stories/other/activate', 'alice', {}),
    ).toBe(404);
    expect(await call('POST', '/sessions/nope/skip', 'alice', {})).toBe(404);
  });

  it('restricts lifecycle, role and presenter changes', async () => {
    // Only the creator deletes or reopens; the creator or the host ends.
    expect(await call('DELETE', '/sessions/sess', 'bob')).toBe(403);
    expect(await call('DELETE', '/sessions/sess', 'alice')).toBe(204);
    expect(await call('POST', '/sessions/sess/reopen', 'bob', {})).toBe(403);
    expect(await call('POST', '/sessions/sess/reopen', 'alice', {})).toBe(204);
    expect(await call('POST', '/sessions/sess/end', 'bob', {})).toBe(403);
    expect(await call('POST', '/sessions/sess/end', 'alice', {})).toBe(204);
    expect(db.deleteSession).toHaveBeenCalledTimes(1);
    expect(db.endSession).toHaveBeenCalledTimes(1);

    // Roles: own role only, valid values only, a single host.
    const role = (user: string, body: unknown) =>
      call('POST', '/sessions/sess/role', user, body);
    expect(await role('bob', { userId: 'alice', role: 'observer' })).toBe(403);
    expect(await role('bob', { role: 'admin' })).toBe(400);
    expect(await role('bob', { role: 'host' })).toBe(409);
    expect(await role('mallory', { role: 'voter' })).toBe(403);
    expect(await role('bob', { role: 'observer' })).toBe(204);
    expect(db.updateRole).toHaveBeenCalledTimes(1);
    expect(db.updateRole).toHaveBeenCalledWith('sess', 'bob', 'observer');

    const join = (user: string, body: unknown) =>
      call('POST', '/sessions/sess/join', user, body);
    expect(await join('mallory', { role: 'voter', userName: 'M' })).toBe(403);
    expect(await join('carol', { role: 'host', userName: 'C' })).toBe(409);
    expect(await join('carol', { role: 'voter', userName: 'C' })).toBe(200);
    expect(db.joinSession).toHaveBeenCalledTimes(1);
    expect(db.joinSession).toHaveBeenCalledWith(
      'sess',
      expect.objectContaining({ userId: 'carol', role: 'voter' }),
    );

    // Presenter: the host assigns anyone; others only take or leave the stage.
    const present = (user: string, story: string, presenterUserId: unknown) =>
      call('POST', `/sessions/sess/stories/${story}/presenter`, user, {
        presenterUserId,
      });
    expect(await present('bob', 's2', 'bob')).toBe(200);
    expect(await present('bob', 's2', 'alice')).toBe(403);
    expect(await present('olivia', 's2', 'olivia')).toBe(403);
    expect(await present('bob', 's1', null)).toBe(200);
    expect(await present('bob', 's2', null)).toBe(403);
    expect(await present('alice', 's1', 'bob')).toBe(200);
    expect(await present('alice', 'other', 'bob')).toBe(404);
    expect(db.setPresenter).toHaveBeenCalledTimes(3);
  });

  it('scopes team data to team members and ticket writes to the session', async () => {
    const team = 'group:default/team-a';
    const other = 'group:default/team-b';

    // Team settings can only be read or changed by members of that team.
    expect(await call('GET', `/team-query?teamRef=${team}`, 'bob')).toBe(200);
    expect(await call('GET', `/team-query?teamRef=${team}`, 'mallory')).toBe(
      403,
    );
    expect(
      await call('POST', '/team-query', 'mallory', {
        teamRef: team,
        query: 'x',
      }),
    ).toBe(403);
    expect(
      await call('POST', '/team-query', 'bob', { teamRef: team, query: 'x' }),
    ).toBe(204);
    expect(await call('GET', `/team-cards?teamRef=${team}`, 'mallory')).toBe(
      403,
    );
    expect(
      await call('POST', '/team-cards', 'mallory', {
        teamRef: team,
        cards: [],
      }),
    ).toBe(403);
    expect(
      await call('POST', '/team-cards', 'bob', { teamRef: team, cards: ['1'] }),
    ).toBe(204);
    expect(db.saveTeamQuery).toHaveBeenCalledTimes(1);
    expect(db.saveTeamCards).toHaveBeenCalledTimes(1);

    // Sessions can only be created for, and listed from, the user's own teams.
    expect(
      await call('POST', '/sessions', 'mallory', { teamRef: team, name: 'x' }),
    ).toBe(403);
    expect(await call('POST', '/sessions', 'bob', { name: 'x' })).toBe(400);
    expect(db.createSession).not.toHaveBeenCalled();

    expect(
      await call('GET', `/sessions/lobby?teamRefs=${team},${other}`, 'bob'),
    ).toBe(200);
    expect(db.getLobbySessions).toHaveBeenLastCalledWith([team]);
    expect(
      await call('GET', `/sessions/history?teamRefs=${team}`, 'mallory'),
    ).toBe(200);
    expect(db.getHistorySessions).not.toHaveBeenCalled();

    // Only the host of a session with the ticket writes its estimate back.
    const estimate = (user: string, key: string) =>
      call('POST', `/tickets/${key}/estimate`, user, { value: 5 });
    expect(await estimate('alice', 'ABC-1')).toBe(204);
    expect(await estimate('bob', 'ABC-1')).toBe(403);
    expect(await estimate('alice', 'XYZ-9')).toBe(403);
    expect(provider.setEstimate).toHaveBeenCalledTimes(1);
    expect(provider.setEstimate).toHaveBeenCalledWith('ABC-1', 5);

    // Comments need a seat in a session that contains the ticket.
    const comment = (user: string, key: string) =>
      call('POST', `/tickets/${key}/comments`, user, { body: 'hi' });
    expect(await comment('bob', 'ABC-1')).toBe(204);
    expect(await comment('mallory', 'ABC-1')).toBe(403);
    expect(await comment('bob', 'XYZ-9')).toBe(403);
    expect(provider.postComment).toHaveBeenCalledTimes(1);
  });
});
