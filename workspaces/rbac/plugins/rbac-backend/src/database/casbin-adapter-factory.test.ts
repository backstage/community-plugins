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
import { mockServices } from '@backstage/backend-test-utils';

import knex, { Knex } from 'knex';
import TypeORMAdapter from 'typeorm-adapter';

import { CasbinDBAdapterFactory } from './casbin-adapter-factory';

jest.mock('typeorm-adapter', () => {
  return {
    newAdapter: jest.fn((): Promise<TypeORMAdapter> => {
      return Promise.resolve({} as TypeORMAdapter);
    }),
  };
});

describe('CasbinAdapterFactory', () => {
  let newAdapterMock: jest.Mock<Promise<TypeORMAdapter>>;
  let db: Knex;

  beforeEach(() => {
    newAdapterMock = TypeORMAdapter.newAdapter as jest.Mock<
      Promise<TypeORMAdapter>
    >;
    jest.clearAllMocks();
  });

  it('test building an adapter using a better-sqlite3 configuration.', async () => {
    db = knex.knex({
      client: 'better-sqlite3',
      connection: ':memory',
    });
    const config = mockServices.rootConfig({
      data: {
        backend: {
          database: {
            client: 'better-sqlite3',
            connection: ':memory:',
          },
        },
      },
    });
    const adapterFactory = new CasbinDBAdapterFactory(config, db);
    const adapter = adapterFactory.createAdapter();
    expect(adapter).not.toBeNull();
    expect(newAdapterMock).toHaveBeenCalled();
  });

  describe('build adapter with postgres configuration', () => {
    beforeEach(() => {
      db = knex.knex({
        client: 'pg',
        connection: {
          database: 'test-database',
        },
      });
      process.env.TEST = 'test';
    });

    it('test building an adapter using a PostgreSQL configuration.', async () => {
      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                host: 'localhost',
                port: '5432',
                schema: 'public',
                user: 'postgresUser',
                password: process.env.TEST,
              },
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
        username: 'postgresUser',
        password: process.env.TEST,
        database: 'test-database',
        ssl: undefined,
      });
    });

    it('test building an adapter using a PostgreSQL configuration with enabled ssl.', async () => {
      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                host: 'localhost',
                port: '5432',
                schema: 'public',
                user: 'postgresUser',
                password: process.env.TEST,
                ssl: true,
              },
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
        username: 'postgresUser',
        password: process.env.TEST,
        database: 'test-database',
        ssl: true,
      });
    });

    it('test building an adapter using a PostgreSQL configuration without explicit credentials.', async () => {
      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                host: 'localhost',
                port: '5432',
                schema: 'public',
              },
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
        username: undefined,
        password: undefined,
        database: 'test-database',
        ssl: undefined,
      });
    });

    it('test building an adapter using a PostgreSQL configuration with intentionally disabled ssl.', async () => {
      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                host: 'localhost',
                port: '5432',
                schema: 'public',
                user: 'postgresUser',
                password: process.env.TEST,
                ssl: false,
              },
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
        username: 'postgresUser',
        password: process.env.TEST,
        database: 'test-database',
        ssl: false,
      });
    });

    it('test building an adapter using a PostgreSQL configuration with intentionally ssl and ca cert.', async () => {
      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                host: 'localhost',
                port: '5432',
                schema: 'public',
                user: 'postgresUser',
                password: process.env.TEST,
                ssl: {
                  ca: 'abc',
                },
              },
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
        username: 'postgresUser',
        password: process.env.TEST,
        database: 'test-database',
        ssl: {
          ca: 'abc',
        },
      });
    });

    it('test building an adapter using a PostgreSQL configuration with intentionally ssl and TLS options.', async () => {
      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                host: 'localhost',
                port: '5432',
                user: 'postgresUser',
                password: process.env.TEST,
                ssl: {
                  ca: 'abc',
                  rejectUnauthorized: false,
                },
              },
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
        username: 'postgresUser',
        password: process.env.TEST,
        database: 'test-database',
        ssl: {
          ca: 'abc',
          rejectUnauthorized: false,
        },
      });
    });

    it('test building an adapter using a PostgreSQL configuration with intentionally ssl without CA.', async () => {
      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                host: 'localhost',
                port: '5432',
                user: 'postgresUser',
                password: process.env.TEST,
                ssl: {
                  rejectUnauthorized: false,
                },
              },
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
        username: 'postgresUser',
        password: process.env.TEST,
        database: 'test-database',
        ssl: {
          rejectUnauthorized: false,
        },
      });
    });
  });

  describe('build adapter with dynamic Knex connection resolvers', () => {
    it('should resolve database name when knex connection is a dynamic resolver function', async () => {
      const dynamicConnectionDb = knex.knex({
        client: 'pg',
        connection: async () => ({
          host: 'myserver.postgres.database.azure.com',
          port: 5432,
          user: 'myuser@myserver',
          password: 'mock-azure-token-1234567890',
          database: 'backstage_plugin_permission',
          ssl: { rejectUnauthorized: false },
        }),
      });

      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                type: 'azure',
                host: 'myserver.postgres.database.azure.com',
                port: '5432',
                user: 'myuser@myserver',
                ssl: {
                  rejectUnauthorized: false,
                },
              },
            },
          },
        },
      });

      const factory = new CasbinDBAdapterFactory(config, dynamicConnectionDb);
      await factory.createAdapter();

      expect(newAdapterMock).toHaveBeenCalled();
      const adapterConfig = newAdapterMock.mock.calls[0][0];
      expect(adapterConfig.database).toBe('backstage_plugin_permission');
      expect(adapterConfig.host).toBe('myserver.postgres.database.azure.com');
      expect(adapterConfig.username).toBe('myuser@myserver');
      expect(adapterConfig.ssl).toEqual({ rejectUnauthorized: false });
      expect(typeof adapterConfig.password).toBe('function');

      await dynamicConnectionDb.destroy();
    });

    it('should call the dynamic resolver on each password function invocation', async () => {
      const connectionResolver = jest.fn(async () => ({
        host: 'myserver.postgres.database.azure.com',
        port: 5432,
        user: 'myuser@myserver',
        password: 'mock-azure-token-1234567890',
        database: 'test-database',
        ssl: { rejectUnauthorized: false },
      }));

      const dynamicConnectionDb = knex.knex({
        client: 'pg',
        connection: connectionResolver,
      });

      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                type: 'azure',
                host: 'myserver.postgres.database.azure.com',
                port: '5432',
                user: 'myuser@myserver',
              },
            },
          },
        },
      });

      const factory = new CasbinDBAdapterFactory(config, dynamicConnectionDb);
      await factory.createAdapter();

      connectionResolver.mockClear();

      const adapterConfig = newAdapterMock.mock.calls[0][0];
      const passwordFn = adapterConfig.password;
      const tokenResult = await passwordFn();

      expect(connectionResolver).toHaveBeenCalledTimes(1);
      expect(tokenResult).toBe('mock-azure-token-1234567890');

      connectionResolver.mockResolvedValueOnce({
        host: 'myserver.postgres.database.azure.com',
        port: 5432,
        user: 'myuser@myserver',
        password: 'new-token-different',
        database: 'test-database',
        ssl: { rejectUnauthorized: false },
      });

      const tokenResult2 = await passwordFn();
      expect(tokenResult2).toBe('new-token-different');
      expect(connectionResolver).toHaveBeenCalledTimes(2);

      await dynamicConnectionDb.destroy();
    });

    it('should support RDS-style dynamic connection resolvers', async () => {
      const dynamicConnectionDb = knex.knex({
        client: 'pg',
        connection: async () => ({
          host: 'mydb.abc123.us-east-1.rds.amazonaws.com',
          port: 5432,
          user: 'backstage',
          password: 'mock-rds-iam-token',
          database: 'backstage_plugin_permission',
          ssl: { rejectUnauthorized: true },
        }),
      });

      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                type: 'rds',
                host: 'mydb.abc123.us-east-1.rds.amazonaws.com',
                port: '5432',
                user: 'backstage',
                region: 'us-east-1',
              },
            },
          },
        },
      });

      const factory = new CasbinDBAdapterFactory(config, dynamicConnectionDb);
      await factory.createAdapter();

      expect(newAdapterMock).toHaveBeenCalled();
      const adapterConfig = newAdapterMock.mock.calls[0][0];
      expect(adapterConfig.database).toBe('backstage_plugin_permission');
      expect(adapterConfig.host).toBe(
        'mydb.abc123.us-east-1.rds.amazonaws.com',
      );
      expect(typeof adapterConfig.password).toBe('function');

      const tokenResult = await adapterConfig.password();
      expect(tokenResult).toBe('mock-rds-iam-token');

      await dynamicConnectionDb.destroy();
    });

    it('should throw error when dynamic resolver returns no password', async () => {
      const dynamicConnectionDb = knex.knex({
        client: 'pg',
        connection: async () => ({
          host: 'myserver.postgres.database.azure.com',
          port: 5432,
          user: 'myuser@myserver',
          database: 'test-database',
        }),
      });

      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                type: 'azure',
                host: 'myserver.postgres.database.azure.com',
                port: '5432',
                user: 'myuser@myserver',
              },
            },
          },
        },
      });

      const factory = new CasbinDBAdapterFactory(config, dynamicConnectionDb);
      await factory.createAdapter();

      const adapterConfig = newAdapterMock.mock.calls[0][0];
      await expect(adapterConfig.password()).rejects.toThrow(
        'missing password on resolved Knex connection',
      );

      await dynamicConnectionDb.destroy();
    });

    it('should throw error when dynamic resolver returns no database name', async () => {
      const dynamicConnectionDb = knex.knex({
        client: 'pg',
        connection: async () => ({
          host: 'myserver.postgres.database.azure.com',
          port: 5432,
          user: 'myuser@myserver',
          password: 'mock-azure-token',
        }),
      });

      const config = mockServices.rootConfig({
        data: {
          backend: {
            database: {
              client: 'pg',
              connection: {
                type: 'azure',
                host: 'myserver.postgres.database.azure.com',
                port: '5432',
                user: 'myuser@myserver',
              },
            },
          },
        },
      });

      const factory = new CasbinDBAdapterFactory(config, dynamicConnectionDb);
      await expect(factory.createAdapter()).rejects.toThrow(
        'missing database name on Knex connection',
      );

      await dynamicConnectionDb.destroy();
    });
  });

  it('ensure that building an adapter with an unknown configuration fails.', async () => {
    const client = 'unknown-db';
    const expectedError = new Error(`Unsupported database client ${client}`);
    const config = mockServices.rootConfig({
      data: {
        backend: {
          database: {
            client,
          },
        },
      },
    });
    const adapterFactory = new CasbinDBAdapterFactory(config, db);

    await expect(adapterFactory.createAdapter()).rejects.toStrictEqual(
      expectedError,
    );
    expect(newAdapterMock).not.toHaveBeenCalled();
  });
});
