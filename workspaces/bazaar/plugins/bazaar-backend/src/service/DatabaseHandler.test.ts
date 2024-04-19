/*
 * Copyright 2021 The Backstage Authors
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

import { DatabaseHandler } from './DatabaseHandler';
import { TestDatabaseId, TestDatabases } from '@backstage/backend-test-utils';
import { Knex as KnexType } from 'knex';

const bazaarProject: any = {
  title: 'n1',
  entityRef: 'ref1',
  community: '',
  status: 'proposed',
  description: 'a',
  membersCount: 0,
  startDate: '2021-11-07T13:27:00.000Z',
  endDate: null,
  size: 'small',
  responsible: 'r',
  docs: '',
};

jest.setTimeout(60_000);

describe('DatabaseHandler', () => {
  const databases = TestDatabases.create({
    ids: ['POSTGRES_16', 'POSTGRES_12', 'SQLITE_3', 'MYSQL_8'],
  });

  function createDatabaseManager(
    client: KnexType,
    skipMigrations: boolean = false,
  ) {
    return {
      getClient: async () => client,
      migrations: {
        skip: skipMigrations,
      },
    };
  }

  async function createDatabaseHandler(databaseId: TestDatabaseId) {
    const knex = await databases.init(databaseId);
    const databaseManager = createDatabaseManager(knex);
    return {
      knex,
      dbHandler: await DatabaseHandler.create({ database: databaseManager }),
    };
  }

  it.each(databases.eachSupportedId())(
    'should insert and get entity, %p',
    async databaseId => {
      const { knex, dbHandler } = await createDatabaseHandler(databaseId);

      await knex('metadata').insert({
        entity_ref: bazaarProject.entityRef,
        title: bazaarProject.title,
        description: bazaarProject.description,
        community: bazaarProject.community,
        status: bazaarProject.status,
        updated_at: new Date().toISOString(),
        start_date: bazaarProject.startDate,
        end_date: bazaarProject.endDate,
        size: bazaarProject.size,
        responsible: bazaarProject.responsible,
        docs: bazaarProject.docs,
      });

      // Add a member to the project
      await knex('members').insert({
        item_id: 1,
        user_ref: 'user:default/thehulk',
        user_id: 'Bruce Banner',
      });

      const res = await dbHandler.getMetadataByRef('ref1');

      expect(res).toHaveLength(1);
      expect(res[0].description).toEqual('a');
      expect(res[0].community).toEqual('');
      expect(res[0].status).toEqual('proposed');
      expect(res[0].start_date).toEqual('2021-11-07T13:27:00.000Z');
      expect(res[0].end_date).toEqual(null);
      expect(res[0].size).toEqual('small');
      expect(res[0].responsible).toEqual('r');
      expect(res[0].docs).toEqual('');
      expect(
        res[0].members_count === '1' || res[0].members_count === 1,
      ).toBeTruthy();
    },
  );
});
