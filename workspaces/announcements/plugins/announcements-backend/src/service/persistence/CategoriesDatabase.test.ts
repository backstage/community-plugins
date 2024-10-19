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
import { Knex } from 'knex';
import { CategoriesDatabase } from './CategoriesDatabase';
import { TestDatabases } from '@backstage/backend-test-utils';
import { initializePersistenceContext } from './persistenceContext';
import { Category } from '@backstage-community/plugin-announcements-common';

function createDatabaseManager(client: Knex, skipMigrations: boolean = false) {
  return {
    getClient: async () => client,
    migrations: {
      skip: skipMigrations,
    },
  };
}

describe('categories', () => {
  const databases = TestDatabases.create();
  let store: CategoriesDatabase;
  let testDbClient: Knex<any, unknown[]>;
  let database;

  beforeAll(async () => {
    testDbClient = await databases.init('SQLITE_3');
    database = createDatabaseManager(testDbClient);
    store = (await initializePersistenceContext(database)).categoriesStore;
  });

  afterEach(async () => {
    await testDbClient('categories').delete();
  });

  it('should return an empty array when there are no categories', async () => {
    const categories = await store.categories();
    expect(categories).toEqual([]);
  });

  it('should return all categories in ascending order by title', async () => {
    const category1: Category = { slug: 'category-1', title: 'Category 1' };
    const category2: Category = { slug: 'category-2', title: 'Category 2' };
    store.insert(category2);
    store.insert(category1);

    const categories = await store.categories();
    expect(categories).toEqual([category1, category2]);
  });

  it('should delete a category', async () => {
    const category: Category = { slug: 'category-1', title: 'Category 1' };
    store.insert(category);

    expect(await store.categories()).toEqual([category]);
    await store.delete(category.slug);
    expect(await store.categories()).toEqual([]);
  });

  it('should update a category', async () => {
    const category: Category = { slug: 'category-1', title: 'Category 1' };
    store.insert(category);

    await store.update({ ...category, title: 'New Title' });
    expect(await store.categories()).toEqual([
      { slug: 'category-1', title: 'New Title' },
    ]);
  });
});
