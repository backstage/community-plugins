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
    });

    const announcement = await store.announcementByID('id');

    expect(announcement).toEqual({
      id: 'id',
      publisher: 'publisher',
      title: 'title',
      excerpt: 'excerpt',
      body: 'body',
      category: undefined,
      created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
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
          created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
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
    });

    await store.updateAnnouncement({
      id: 'id',
      publisher: 'publisher',
      title: 'title2',
      excerpt: 'excerpt2',
      body: 'body2',
      created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
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
          created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
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
      });

      await store.insertAnnouncement({
        id: 'id2',
        publisher: 'publisher2',
        title: 'title2',
        excerpt: 'excerpt2',
        body: 'body2',
        category: 'category',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
      });

      await store.insertAnnouncement({
        id: 'id3',
        publisher: 'publisher3',
        title: 'title3',
        excerpt: 'excerpt3',
        body: 'body3',
        category: 'different',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
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
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
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
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
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
      });

      await store.insertAnnouncement({
        id: 'id2',
        publisher: 'publisher2',
        title: 'title2',
        excerpt: 'excerpt2',
        body: 'body2',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
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
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
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
      });

      await store.insertAnnouncement({
        id: 'id2',
        publisher: 'publisher2',
        title: 'title2',
        excerpt: 'excerpt2',
        body: 'body2',
        created_at: DateTime.fromISO('2023-10-26T15:28:08.539Z'),
      });

      const announcements = await store.announcements({
        max: 1,
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
            created_at: timestampToDateTime('2023-10-26T15:28:08.539Z'),
          },
        ],
      });
    });
  });
});
