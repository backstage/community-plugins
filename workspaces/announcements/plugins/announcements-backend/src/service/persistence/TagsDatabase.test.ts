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

  beforeAll(async () => {
    testDbClient = await databases.init('SQLITE_3');
    const database = createDatabaseManager(testDbClient);
    const persistenceContext = await initializePersistenceContext(database);
    tagsStore = persistenceContext.tagsStore;
  });

  afterEach(async () => {
    await testDbClient('tags').delete();
    await testDbClient('announcements').delete();
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

  it('should insert multiple tags and retrieve them all sorted by title', async () => {
    await tagsStore.insert({
      slug: 'second-tag',
      title: 'Second Tag',
    });
    await tagsStore.insert({
      slug: 'first-tag',
      title: 'First Tag',
    });

    const tags = await tagsStore.tags();

    expect(tags).toEqual([
      {
        slug: 'first-tag',
        title: 'First Tag',
      },
      {
        slug: 'second-tag',
        title: 'Second Tag',
      },
    ]);
  });

  it('should not update an existing tag on insert conflict', async () => {
    const originalTag = {
      slug: 'test-tag',
      title: 'Original Title',
    };
    await tagsStore.insert(originalTag);

    await tagsStore.insert({
      slug: 'test-tag',
      title: 'A Different Title',
    });

    const tag = await tagsStore.tagBySlug('test-tag');
    expect(tag).toBeDefined();
    expect(tag!.title).toEqual(originalTag.title);
  });

  it('should update an existing tag', async () => {
    await tagsStore.insert({
      slug: 'tag-to-update',
      title: 'Original Title',
    });

    await tagsStore.update({
      slug: 'tag-to-update',
      title: 'Updated Title',
    });

    const updatedTag = await tagsStore.tagBySlug('tag-to-update');
    expect(updatedTag).toBeDefined();
    expect(updatedTag!.title).toEqual('Updated Title');
  });

  it('should delete a tag', async () => {
    await tagsStore.insert({
      slug: 'tag-to-delete',
      title: 'Tag to Delete',
    });

    await tagsStore.delete('tag-to-delete');

    const deletedTag = await tagsStore.tagBySlug('tag-to-delete');
    expect(deletedTag).toBeUndefined();
  });

  it('should not delete a tag that is in use', async () => {
    await tagsStore.insert({
      slug: 'used-tag',
      title: 'Used Tag',
    });

    await testDbClient('announcements').insert({
      id: 'announcement-1',
      title: 'Test Announcement',
      excerpt: '...',
      body: '...',
      publisher: 'user:default/test',
      created_at: new Date().toISOString(),
      start_at: new Date().toISOString(),
      tags: JSON.stringify(['used-tag']),
    });

    await expect(tagsStore.delete('used-tag')).rejects.toThrow(
      'Tag to delete is used in some announcements',
    );
  });
});
