import { AnnouncementsDatabase } from './AnnouncementsDatabase';
import { CategoriesDatabase } from './CategoriesDatabase';
import {
  PersistenceContext,
  initializePersistenceContext,
} from './persistenceContext';
import { TestDatabases } from '@backstage/backend-test-utils';

describe('initializePersistenceContext', () => {
  const databases = TestDatabases.create();
  const dbClient = databases.init('SQLITE_3');
  const mockedDb = {
    getClient: async () => dbClient,
    migrations: {
      skip: false,
    },
  };

  let context: PersistenceContext;

  beforeEach(async () => {
    context = await initializePersistenceContext(mockedDb);
  });

  it('initializes the announcements store', async () => {
    expect(context.announcementsStore).toBeInstanceOf(AnnouncementsDatabase);
  });

  it('initializes the categories store', async () => {
    expect(context.categoriesStore).toBeInstanceOf(CategoriesDatabase);
  });
});
