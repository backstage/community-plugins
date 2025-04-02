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
import { TestDatabases } from '@backstage/backend-test-utils';
import { TagsDatabase } from './TagsDatabase';
import { Knex } from 'knex';
import { initializePersistenceContext } from './persistenceContext';

function createDatabaseManager(client: Knex, skipMigrations: boolean = false) {
  return {
    getClient: async () => client,
    migrations: {
      skip: skipMigrations,
    },
  };
}

describe('TagsDatabase', () => {
  const databases = TestDatabases.create();
  let tagsStore: TagsDatabase;
  let testDbClient: Knex<any, unknown[]>;
  let database;

  beforeAll(async () => {
    testDbClient = await databases.init('SQLITE_3');
    database = createDatabaseManager(testDbClient);
    tagsStore = (await initializePersistenceContext(database)).tagsStore;
  });

  afterEach(async () => {
    await testDbClient('announcements_tags').delete();
  });

  it('should return an empty array when there are no tags', async () => {
    const tags = await tagsStore.tags();
    expect(tags).toEqual([]);
  });

  it('should insert a new tag', async () => {
    await tagsStore.insert({
      slug: 'test-tag',
      title: 'Test Tag',
    });

    const tags = await tagsStore.tags();

    expect(tags).toEqual([
      {
        slug: 'test-tag',
        title: 'Test Tag',
      },
    ]);
  });

  it('should insert multiple tags and retrieve them all', async () => {
    await tagsStore.insert({
      slug: 'first-tag',
      title: 'First Tag',
    });

    await tagsStore.insert({
      slug: 'second-tag',
      title: 'Second Tag',
    });

    await tagsStore.insert({
      slug: 'third-tag',
      title: 'Third Tag',
    });

    const tags = await tagsStore.tags();

    expect(tags).toHaveLength(3);
    expect(tags).toEqual(
      expect.arrayContaining([
        { slug: 'first-tag', title: 'First Tag' },
        { slug: 'second-tag', title: 'Second Tag' },
        { slug: 'third-tag', title: 'Third Tag' },
      ]),
    );
  });

  it('should delete an existing tag', async () => {
    await tagsStore.insert({
      slug: 'test-tag',
      title: 'Test Tag',
    });

    await tagsStore.insert({
      slug: 'another-tag',
      title: 'Another Tag',
    });

    let tags = await tagsStore.tags();
    expect(tags).toHaveLength(2);

    await tagsStore.delete('test-tag');

    tags = await tagsStore.tags();
    expect(tags).toEqual([
      {
        slug: 'another-tag',
        title: 'Another Tag',
      },
    ]);
  });

  it('should not fail when deleting a non-existent tag', async () => {
    await expect(tagsStore.delete('non-existent-tag')).resolves.not.toThrow();

    const tags = await tagsStore.tags();
    expect(tags).toEqual([]);
  });

  it('should handle attempting to insert a duplicate tag gracefully', async () => {
    await tagsStore.insert({
      slug: 'unique-tag',
      title: 'Unique Tag',
    });

    await expect(
      tagsStore.insert({
        slug: 'unique-tag',
        title: 'Different Title',
      }),
    ).rejects.toThrow();

    const tags = await tagsStore.tags();
    expect(tags).toHaveLength(1);
    expect(tags[0].title).toBe('Unique Tag');
  });
});
