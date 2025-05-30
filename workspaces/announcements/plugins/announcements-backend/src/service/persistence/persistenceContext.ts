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
import { TagsDatabase } from './TagsDatabase';
import {
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-announcements-backend',
  'db/migrations',
);

/**
 * A Container for persistence related components in Announcements
 *
 * @public
 */
export type PersistenceContext = {
  announcementsStore: AnnouncementsDatabase;
  categoriesStore: CategoriesDatabase;
  tagsStore: TagsDatabase;
};

/**
 * A factory method to construct persistence context.
 *
 * @public
 */
export const initializePersistenceContext = async (
  database: DatabaseService,
): Promise<PersistenceContext> => {
  const client = await database.getClient();

  if (!database.migrations?.skip) {
    await client.migrate.latest({
      directory: migrationsDir,
    });
  }

  return {
    announcementsStore: new AnnouncementsDatabase(client),
    categoriesStore: new CategoriesDatabase(client),
    tagsStore: new TagsDatabase(client),
  };
};
