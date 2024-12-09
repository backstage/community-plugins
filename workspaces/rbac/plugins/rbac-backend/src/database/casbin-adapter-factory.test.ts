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
