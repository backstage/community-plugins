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
import {
  mockServices,
  TestDatabaseId,
  TestDatabases,
} from '@backstage/backend-test-utils';

import * as Knex from 'knex';
import { createTracker, MockClient } from 'knex-mock-client';

import { migrate } from './migration';
import {
  DataBaseRoleMetadataStorage,
  ROLE_METADATA_TABLE,
  RoleMetadataDao,
} from './role-metadata';

jest.setTimeout(60000);

describe('role-metadata-db-table', () => {
  const databases = TestDatabases.create({
    ids: ['POSTGRES_13', 'SQLITE_3'],
  });
  const modifiedBy = 'user:default/some-user';

  async function createDatabase(databaseId: TestDatabaseId) {
    const knex = await databases.init(databaseId);
    const mockDatabaseService = mockServices.database.mock({
      getClient: async () => knex,
      migrations: { skip: false },
    });

    await migrate(mockDatabaseService);
    return {
      knex,
      db: new DataBaseRoleMetadataStorage(knex),
    };
  }

  describe('findRoleMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should return undefined',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const trx = await knex.transaction();
        try {
          const roleMetadata = await db.findRoleMetadata(
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
          expect(roleMetadata).toBeUndefined();
        } catch (err) {
          await trx.rollback();
          throw err;
        }
      },
    );

    it.each(databases.eachSupportedId())(
      'should return found metadata',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'rest',
          modifiedBy,
        });

        const trx = await knex.transaction();
        try {
          const roleMetadata = await db.findRoleMetadata(
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
          expect(roleMetadata).toEqual({
            author: null,
            createdAt: null,
            description: null,
            id: 1,
            lastModified: null,
            modifiedBy,
            owner: null,
            roleEntityRef: 'role:default/some-super-important-role',
            source: 'rest',
          });
        } catch (err) {
          await trx.rollback();
          throw err;
        }
      },
    );
  });

  describe('createRoleMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should successfully create new role metadata',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        const trx = await knex.transaction();
        let id;
        try {
          id = await db.createRoleMetadata(
            {
              source: 'configuration',
              roleEntityRef: 'role:default/some-super-important-role',
              modifiedBy,
            },
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback();
          throw err;
        }

        const metadata = await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).where(
          'id',
          id,
        );
        expect(metadata.length).toEqual(1);
        expect(metadata[0]).toEqual({
          author: null,
          createdAt: null,
          roleEntityRef: 'role:default/some-super-important-role',
          description: null,
          id: 1,
          lastModified: null,
          modifiedBy,
          owner: null,
          source: 'configuration',
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should throw conflict error',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'configuration',
        });

        const trx = await knex.transaction();
        await expect(async () => {
          try {
            await db.createRoleMetadata(
              {
                source: 'configuration',
                roleEntityRef: 'role:default/some-super-important-role',
                modifiedBy,
              },

              trx,
            );
            await trx.commit();
          } catch (err) {
            await trx.rollback();
            throw err;
          }
        }).rejects.toThrow(
          `A metadata for role role:default/some-super-important-role has already been stored`,
        );
      },
    );

    it('should throw failed to create metadata error, because inserted result is an empty array.', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response(undefined);
      tracker.on.insert(ROLE_METADATA_TABLE).response([]);

      const db = new DataBaseRoleMetadataStorage(knex);
      const trx = await knex.transaction();

      await expect(
        db.createRoleMetadata(
          {
            source: 'configuration',
            roleEntityRef: 'role:default/some-super-important-role',
            modifiedBy,
          },
          trx,
        ),
      ).rejects.toThrow(
        `Failed to create the role metadata: '{"source":"configuration","roleEntityRef":"role:default/some-super-important-role","modifiedBy":"user:default/some-user"}'.`,
      );
    });

    it('should throw failed to create metadata error, because inserted result is undefined.', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response(undefined);
      tracker.on.insert(ROLE_METADATA_TABLE).response(undefined);

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.createRoleMetadata(
            {
              source: 'configuration',
              roleEntityRef: 'role:default/some-super-important-role',
              modifiedBy,
            },
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow(
        `Failed to create the role metadata: '{"source":"configuration","roleEntityRef":"role:default/some-super-important-role","modifiedBy":"user:default/some-user"}'.`,
      );
    });

    it('should throw an error on insert metadata operation', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response(undefined);
      tracker.on
        .insert(ROLE_METADATA_TABLE)
        .simulateError('connection refused error');

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.createRoleMetadata(
            {
              source: 'configuration',
              roleEntityRef: 'role:default/some-super-important-role',
              modifiedBy,
            },
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow('connection refused error');
    });
  });

  describe('updateRoleMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should successfully update role metadata from legacy source to new value',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'legacy',
        });

        const trx = await knex.transaction();
        try {
          await db.updateRoleMetadata(
            {
              roleEntityRef: 'role:default/some-super-important-role',
              source: 'rest',
              modifiedBy,
            },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback();
          throw err;
        }

        const metadata = await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).where(
          'id',
          1,
        );
        expect(metadata.length).toEqual(1);
        expect(metadata[0]).toEqual({
          author: null,
          createdAt: null,
          description: null,
          source: 'rest',
          roleEntityRef: 'role:default/some-super-important-role',
          id: 1,
          lastModified: null,
          modifiedBy,
          owner: null,
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update role metadata source to new value, because source is not legacy',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'rest',
        });

        await expect(async () => {
          const trx = await knex.transaction();
          try {
            await db.updateRoleMetadata(
              {
                roleEntityRef: 'role:default/some-super-important-role',
                source: 'configuration',
                modifiedBy,
              },
              'role:default/some-super-important-role',
              trx,
            );
            await trx.commit();
          } catch (err) {
            await trx.rollback();
            throw err;
          }
        }).rejects.toThrow(`The RoleMetadata.source field is 'read-only'`);
      },
    );

    it.each(databases.eachSupportedId())(
      'should successfully update role metadata with the new name',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'configuration',
        });

        const trx = await knex.transaction();
        try {
          await db.updateRoleMetadata(
            {
              roleEntityRef: 'role:default/important-role',
              source: 'configuration',
              modifiedBy,
            },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback();
          throw err;
        }

        const metadata = await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).where(
          'id',
          1,
        );
        expect(metadata.length).toEqual(1);
        expect(metadata[0]).toEqual({
          author: null,
          createdAt: null,
          description: null,
          source: 'configuration',
          roleEntityRef: 'role:default/important-role',
          id: 1,
          lastModified: null,
          modifiedBy,
          owner: null,
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update role metadata, because role metadata was not found',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await expect(async () => {
          const trx = await knex.transaction();
          try {
            await db.updateRoleMetadata(
              {
                roleEntityRef: 'role:default/important-role',
                source: 'configuration',
                modifiedBy,
              },
              'role:default/some-super-important-role',
              trx,
            );
            await trx.commit();
          } catch (err) {
            await trx.rollback();
            throw err;
          }
        }).rejects.toThrow(
          `A metadata for role 'role:default/some-super-important-role' was not found`,
        );
      },
    );

    it('should throw failed to update metadata error, because update result is an empty array.', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response({
        roleEntityRef: 'role:default/some-super-important-role',
        source: 'configuration',
        id: 1,
      });
      tracker.on.update(ROLE_METADATA_TABLE).response([]);

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.updateRoleMetadata(
            {
              roleEntityRef: 'role:default/important-role',
              source: 'configuration',
              modifiedBy,
            },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow(
        `Failed to update the role metadata '{"roleEntityRef":"role:default/some-super-important-role","source":"configuration","id":1}' with new value: '{"roleEntityRef":"role:default/important-role","source":"configuration","modifiedBy":"user:default/some-user"}'.`,
      );
    });

    it('should throw failed to update metadata error, because update result is undefined.', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response({
        roleEntityRef: 'role:default/some-super-important-role',
        source: 'configuration',
        id: 1,
      });
      tracker.on.update(ROLE_METADATA_TABLE).response(undefined);

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.updateRoleMetadata(
            {
              roleEntityRef: 'role:default/important-role',
              source: 'configuration',
              modifiedBy,
            },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow(
        `Failed to update the role metadata '{"roleEntityRef":"role:default/some-super-important-role","source":"configuration","id":1}' with new value: '{"roleEntityRef":"role:default/important-role","source":"configuration","modifiedBy":"user:default/some-user"}'.`,
      );
    });

    it('should throw on insert metadata operation', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response({
        roleEntityRef: 'role:default/some-super-important-role',
        source: 'configuration',
        id: 1,
      });
      tracker.on
        .update(ROLE_METADATA_TABLE)
        .simulateError('connection refused error');

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.updateRoleMetadata(
            {
              roleEntityRef: 'role:default/important-role',
              source: 'configuration',
              modifiedBy,
            },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow('connection refused error');
    });
  });

  describe('removeRoleMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should successfully delete role metadata',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'legacy',
        });

        const trx = await knex.transaction();
        try {
          await db.removeRoleMetadata(
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback();
          throw err;
        }

        const metadata = await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).where(
          'id',
          1,
        );
        expect(metadata.length).toEqual(0);
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to delete role metadata, because nothing to delete',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        const trx = await knex.transaction();

        await expect(async () => {
          try {
            await db.removeRoleMetadata(
              'role:default/some-super-important-role',
              trx,
            );
            await trx.commit();
          } catch (err) {
            await trx.rollback();
            throw err;
          }
        }).rejects.toThrow(
          `A metadata for role 'role:default/some-super-important-role' was not found`,
        );
      },
    );

    it('should throw an error on delete metadata operation', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response({
        roleEntityRef: 'role:default/some-super-important-role',
        source: 'configuration',
        id: 1,
      });
      tracker.on
        .delete(ROLE_METADATA_TABLE)
        .simulateError('connection refused error');

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.removeRoleMetadata(
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow('connection refused error');
    });
  });
});
