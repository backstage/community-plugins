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
import { TestDatabases } from '@backstage/backend-test-utils';
import {
  AnnouncementsDatabase,
  timestampToDateTime,
} from './AnnouncementsDatabase';
import { Knex } from 'knex';
import { initializePersistenceContext } from './persistenceContext';
import { DateTime } from 'luxon';

function createDatabaseManager(client: Knex, skipMigrations: boolean = false) {
  return {
    getClient: async () => client,
    migrations: {
      skip: skipMigrations,
    },
  };
}

describe('AnnouncementsDatabase', () => {
  const databases = TestDatabases.create();
  let store: AnnouncementsDatabase;
  let testDbClient: Knex<any, unknown[]>;
  let database;

  beforeAll(async () => {
    testDbClient = await databases.init('SQLITE_3');
    database = createDatabaseManager(testDbClient);
    store = (await initializePersistenceContext(database)).announcementsStore;
  });

  afterEach(async () => {
    await testDbClient('announcements').delete();
  });

  it('should return an empty array when there are no announcements', async () => {
    const announcements = await store.announcements({});
    expect(announcements).toEqual({
      count: 0,
      results: [],
    });
  });

  it('should return an announcement by id', async () => {
    await store.insertAnnouncement({
      id: 'id',
      publisher: 'publisher',
      title: 'title',
      excerpt: 'excerpt',
      body: 'body',
      created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
      active: true,
      start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
      on_behalf_of: 'group:default/team-a',
    });

    const announcement = await store.announcementByID('id');

    expect(announcement).toEqual({
      id: 'id',
      publisher: 'publisher',
      title: 'title',
      excerpt: 'excerpt',
      body: 'body',
      category: undefined,
      tags: [],
      created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
      active: 1,
      start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
      on_behalf_of: 'group:default/team-a',
    });
  });

  it('should insert a new announcement', async () => {
    await store.insertAnnouncement({
      id: 'id',
      publisher: 'publisher',
      title: 'title',
      excerpt: 'excerpt',
      body: 'body',
      created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
      active: true,
      start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
      on_behalf_of: 'group:default/team-a',
    });

    const announcements = await store.announcements({});

    expect(announcements).toEqual({
      count: 1,
      results: [
        {
          id: 'id',
          publisher: 'publisher',
          title: 'title',
          excerpt: 'excerpt',
          body: 'body',
          category: undefined,
          tags: [],
          created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
          active: 1,
          start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
          on_behalf_of: 'group:default/team-a',
        },
      ],
    });
  });

  it('should update an existing announcement', async () => {
    await store.insertAnnouncement({
      id: 'id',
      publisher: 'publisher',
      title: 'title',
      excerpt: 'excerpt',
      body: 'body',
      created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
      active: true,
      start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
      on_behalf_of: 'group:default/team-a',
    });

    await store.updateAnnouncement({
      id: 'id',
      publisher: 'publisher',
      title: 'title2',
      excerpt: 'excerpt2',
      body: 'body2',
      created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
      active: false,
      start_at: DateTime.fromISO('2025-02-01T13:00:00.708Z'),
      on_behalf_of: 'group:default/team-a',
    });

    const announcements = await store.announcements({});

    expect(announcements).toEqual({
      count: 1,
      results: [
        {
          id: 'id',
          publisher: 'publisher',
          title: 'title2',
          excerpt: 'excerpt2',
          body: 'body2',
          category: undefined,
          tags: [],
          created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
          active: 0,
          start_at: timestampToDateTime('2025-02-01T13:00:00.708Z'),
          on_behalf_of: 'group:default/team-a',
        },
      ],
    });
  });

  it('should delete an existing announcement', async () => {
    await store.insertAnnouncement({
      id: 'id',
      publisher: 'publisher',
      title: 'title',
      excerpt: 'excerpt',
      body: 'body',
      created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
      active: true,
      start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
      on_behalf_of: 'group:default/team-a',
    });

    expect((await store.announcements({})).count).toBe(1);

    await store.deleteAnnouncementByID('id');

    const announcements = await store.announcements({});

    expect(announcements).toEqual({
      count: 0,
      results: [],
    });
  });

  it('handles not finding an announcement', async () => {
    expect(await store.announcementByID('id')).toBeUndefined();
  });

  describe('filters', () => {
    it('categories', async () => {
      database = createDatabaseManager(testDbClient);
      const categoryStore = (await initializePersistenceContext(database))
        .categoriesStore;

      await categoryStore.insert({
        slug: 'category',
        title: 'Category',
      });

      await categoryStore.insert({
        slug: 'different',
        title: 'A different category',
      });

      await store.insertAnnouncement({
        id: 'id',
        publisher: 'publisher',
        title: 'title',
        excerpt: 'excerpt',
        body: 'body',
        category: 'category',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id2',
        publisher: 'publisher2',
        title: 'title2',
        excerpt: 'excerpt2',
        body: 'body2',
        category: 'category',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id3',
        publisher: 'publisher3',
        title: 'title3',
        excerpt: 'excerpt3',
        body: 'body3',
        category: 'different',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      const announcements = await store.announcements({
        category: 'category',
      });

      expect(announcements).toEqual({
        count: 2,
        results: [
          {
            id: 'id2',
            publisher: 'publisher2',
            title: 'title2',
            excerpt: 'excerpt2',
            body: 'body2',
            category: {
              slug: 'category',
              title: 'Category',
            },
            tags: [],
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
          {
            id: 'id',
            publisher: 'publisher',
            title: 'title',
            excerpt: 'excerpt',
            body: 'body',
            category: {
              slug: 'category',
              title: 'Category',
            },
            tags: [],
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
        ],
      });
    });

    it('offset', async () => {
      await store.insertAnnouncement({
        id: 'id',
        publisher: 'publisher',
        title: 'title',
        excerpt: 'excerpt',
        body: 'body',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id2',
        publisher: 'publisher2',
        title: 'title2',
        excerpt: 'excerpt2',
        body: 'body2',
        created_at: DateTime.fromISO('2023-10-26T15:28:09.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      const announcements = await store.announcements({
        offset: 1,
      });

      expect(announcements).toEqual({
        count: 2,
        results: [
          {
            id: 'id',
            publisher: 'publisher',
            title: 'title',
            excerpt: 'excerpt',
            body: 'body',
            category: undefined,
            tags: [],
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
        ],
      });
    });

    it('max', async () => {
      await store.insertAnnouncement({
        id: 'id',
        publisher: 'publisher',
        title: 'title',
        excerpt: 'excerpt',
        body: 'body',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id2',
        publisher: 'publisher2',
        title: 'title2',
        excerpt: 'excerpt2',
        body: 'body2',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id3',
        publisher: 'publisher3',
        title: 'title3',
        excerpt: 'excerpt3',
        body: 'body3',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id4',
        publisher: 'publisher4',
        title: 'title4',
        excerpt: 'excerpt4',
        body: 'body4',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      const announcements = await store.announcements({
        max: 1,
      });

      expect(announcements).toEqual({
        count: 4,
        results: [
          {
            id: 'id4',
            publisher: 'publisher4',
            title: 'title4',
            excerpt: 'excerpt4',
            body: 'body4',
            category: undefined,
            tags: [],
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
        ],
      });
    });

    it('active', async () => {
      await store.insertAnnouncement({
        id: 'id',
        publisher: 'publisher',
        title: 'title',
        excerpt: 'excerpt',
        body: 'body',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: false,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id2',
        publisher: 'publisher2',
        title: 'title2',
        excerpt: 'excerpt2',
        body: 'body2',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id3',
        publisher: 'publisher3',
        title: 'title3',
        excerpt: 'excerpt3',
        body: 'body3',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: false,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id4',
        publisher: 'publisher4',
        title: 'title4',
        excerpt: 'excerpt4',
        body: 'body4',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      const announcements = await store.announcements({
        active: true,
      });

      expect(announcements).toEqual({
        count: 2,
        results: [
          {
            id: 'id4',
            publisher: 'publisher4',
            title: 'title4',
            excerpt: 'excerpt4',
            body: 'body4',
            category: undefined,
            tags: [],
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
          {
            id: 'id2',
            publisher: 'publisher2',
            title: 'title2',
            excerpt: 'excerpt2',
            body: 'body2',
            category: undefined,
            tags: [],
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
        ],
      });
    });

    it('sortBy start_at desc', async () => {
      await store.insertAnnouncement({
        id: 'id1',
        publisher: 'publisher1',
        title: 'title1',
        excerpt: 'excerpt1',
        body: 'body1',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id2',
        publisher: 'publisher2',
        title: 'title2',
        excerpt: 'excerpt2',
        body: 'body2',
        created_at: DateTime.fromISO('2023-10-27T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-19T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      const announcements = await store.announcements({
        sortBy: 'start_at',
        order: 'desc',
      });

      expect(announcements).toEqual({
        count: 2,
        results: [
          {
            id: 'id2',
            publisher: 'publisher2',
            title: 'title2',
            excerpt: 'excerpt2',
            body: 'body2',
            category: undefined,
            tags: [],
            created_at: timestampToDateTime('2023-10-27T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-19T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
          {
            id: 'id1',
            publisher: 'publisher1',
            title: 'title1',
            excerpt: 'excerpt1',
            body: 'body1',
            category: undefined,
            tags: [],
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
        ],
      });
    });

    it('sortBy start_at asc', async () => {
      await store.insertAnnouncement({
        id: 'id1',
        publisher: 'publisher1',
        title: 'title1',
        excerpt: 'excerpt1',
        body: 'body1',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id2',
        publisher: 'publisher2',
        title: 'title2',
        excerpt: 'excerpt2',
        body: 'body2',
        created_at: DateTime.fromISO('2023-10-27T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-19T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      const announcements = await store.announcements({
        sortBy: 'start_at',
        order: 'asc',
      });

      expect(announcements).toEqual({
        count: 2,
        results: [
          {
            id: 'id1',
            publisher: 'publisher1',
            title: 'title1',
            excerpt: 'excerpt1',
            body: 'body1',
            category: undefined,
            tags: [],
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
          {
            id: 'id2',
            publisher: 'publisher2',
            title: 'title2',
            excerpt: 'excerpt2',
            body: 'body2',
            category: undefined,
            tags: [],
            created_at: timestampToDateTime('2023-10-27T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-19T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
        ],
      });
    });

    it('sortBy created_at desc', async () => {
      await store.insertAnnouncement({
        id: 'id1',
        publisher: 'publisher1',
        title: 'title1',
        excerpt: 'excerpt1',
        body: 'body1',
        created_at: DateTime.fromISO('2023-10-25T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-17T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      await store.insertAnnouncement({
        id: 'id2',
        publisher: 'publisher2',
        title: 'title2',
        excerpt: 'excerpt2',
        body: 'body2',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
        active: true,
        start_at: DateTime.fromISO('2025-01-18T13:00:00.708Z'),
        on_behalf_of: 'group:default/team-a',
      });

      const announcements = await store.announcements({
        sortBy: 'created_at',
        order: 'desc',
      });

      expect(announcements).toEqual({
        count: 2,
        results: [
          {
            id: 'id2',
            publisher: 'publisher2',
            title: 'title2',
            excerpt: 'excerpt2',
            body: 'body2',
            category: undefined,
            tags: [],
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-18T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
          {
            id: 'id1',
            publisher: 'publisher1',
            title: 'title1',
            excerpt: 'excerpt1',
            body: 'body1',
            category: undefined,
            tags: [],
            created_at: timestampToDateTime('2023-10-25T15:28:08.539Z'),
            active: 1,
            start_at: timestampToDateTime('2025-01-17T13:00:00.708Z'),
            on_behalf_of: 'group:default/team-a',
          },
        ],
      });
    });
  });
});
