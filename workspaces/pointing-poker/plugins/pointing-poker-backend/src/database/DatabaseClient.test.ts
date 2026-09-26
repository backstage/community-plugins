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
import { TestDatabases } from '@backstage/backend-test-utils';
import { DatabaseClient } from './DatabaseClient';

jest.setTimeout(60_000);

describe('DatabaseClient', () => {
  const databases = TestDatabases.create({ ids: ['SQLITE_3'] });

  it('reports the roles a user holds in sessions containing a ticket', async () => {
    const knex = await databases.init('SQLITE_3');
    const db = await DatabaseClient.create({ getClient: async () => knex });

    const session = await db.createSession({
      name: 'Refinement',
      teamRef: 'group:default/team-a',
      userId: 'alice',
      userName: 'Alice',
      stories: [{ title: 'Story', ticketKey: 'ABC-1' }],
    });
    await db.joinSession(session.id, {
      role: 'voter',
      userId: 'bob',
      userName: 'Bob',
    });

    expect(await db.getTicketRoles('alice', 'ABC-1')).toEqual(['host']);
    expect(await db.getTicketRoles('bob', 'ABC-1')).toEqual(['voter']);
    expect(await db.getTicketRoles('bob', 'ABC-2')).toEqual([]);
    expect(await db.getTicketRoles('mallory', 'ABC-1')).toEqual([]);
  });

  it('uses the configured story sort gap and rejects invalid settings', async () => {
    const knex = await databases.init('SQLITE_3');
    const getClient = async () => knex;

    const db = await DatabaseClient.create({ getClient }, { storySortGap: 10 });
    const session = await db.createSession({
      name: 'Refinement',
      teamRef: 'group:default/team-a',
      userId: 'alice',
      userName: 'Alice',
      stories: [{ title: 'A' }, { title: 'B' }],
    });
    expect(session.stories.map(s => s.sort)).toEqual([10, 20]);

    await expect(
      DatabaseClient.create({ getClient }, { storySortGap: 0 }),
    ).rejects.toThrow('storySortGap must be positive');
    await expect(
      DatabaseClient.create({ getClient }, { staleSessionHours: -1 }),
    ).rejects.toThrow('staleSessionHours must be positive');
  });
});
