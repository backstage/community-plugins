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
