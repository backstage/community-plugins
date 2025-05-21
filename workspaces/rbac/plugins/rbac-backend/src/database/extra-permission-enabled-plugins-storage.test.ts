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

import {
  mockServices,
  TestDatabaseId,
  TestDatabases,
} from '@backstage/backend-test-utils';
import { migrate } from './migration';
import {
  PermissionDependentPluginDatabaseStore,
  PermissionDependentPluginDTO,
  PLUGINS_TABLE,
} from './extra-permission-enabled-plugins-storage';

describe('PermissionDependentPluginDatabaseStore', () => {
  const databases = TestDatabases.create({
    ids: ['POSTGRES_13', 'SQLITE_3'],
  });

  async function createDatabase(databaseId: TestDatabaseId) {
    const knex = await databases.init(databaseId);
    const mockDatabaseService = mockServices.database.mock({
      getClient: async () => knex,
      migrations: { skip: false },
    });

    await migrate(mockDatabaseService);
    return {
      knex,
      db: new PermissionDependentPluginDatabaseStore(knex),
    };
  }

  it.each(databases.eachSupportedId())(
    'should return list plugins',
    async databasesId => {
      const { knex, db } = await createDatabase(databasesId);
      const expectedPlugin = { pluginId: 'catalog' };
      await knex<PermissionDependentPluginDTO>(PLUGINS_TABLE).insert(
        expectedPlugin,
      );

      const plugins = await db.getPlugins();

      expect(plugins).toEqual([expectedPlugin]);
    },
  );

  it.each(databases.eachSupportedId())(
    'should delete plugin',
    async databasesId => {
      const { knex, db } = await createDatabase(databasesId);
      const expectedPlugin = { pluginId: 'catalog' };
      await knex<PermissionDependentPluginDTO>(PLUGINS_TABLE).insert(
        expectedPlugin,
      );

      await db.deletePlugins(['catalog']);
      const plugins = await db.getPlugins();

      expect(plugins).toEqual([]);
    },
  );

  it.each(databases.eachSupportedId())(
    'should add plugin',
    async databasesId => {
      const { db } = await createDatabase(databasesId);
      const expectedPlugin = { pluginId: 'catalog' };

      await db.addPlugins([expectedPlugin]);

      const plugins = await db.getPlugins();

      expect(plugins).toEqual([expectedPlugin]);
    },
  );
});
