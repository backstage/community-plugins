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

// Mock Azure Identity
const mockGetToken = jest.fn();

jest.mock('@azure/identity', () => {
  const mockDefaultAzureCredential = jest.fn();
  const mockManagedIdentityCredential = jest.fn();
  const mockClientSecretCredential = jest.fn();

  return {
    DefaultAzureCredential: mockDefaultAzureCredential,
    ManagedIdentityCredential: mockManagedIdentityCredential,
    ClientSecretCredential: mockClientSecretCredential,
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

  describe('build adapter with Azure PostgreSQL passwordless authentication', () => {
    let mockDefaultAzureCredential: jest.Mock;
    let mockManagedIdentityCredential: jest.Mock;
    let mockClientSecretCredential: jest.Mock;

    beforeEach(() => {
      db = knex.knex({
        client: 'pg',
        connection: {
          database: 'test-database',
        },
      });
      jest.clearAllMocks();

      // Get the mocked Azure Identity constructors
      const azureIdentity = require('@azure/identity');
      mockDefaultAzureCredential =
        azureIdentity.DefaultAzureCredential as jest.Mock;
      mockManagedIdentityCredential =
        azureIdentity.ManagedIdentityCredential as jest.Mock;
      mockClientSecretCredential =
        azureIdentity.ClientSecretCredential as jest.Mock;

      // Setup mock credential with getToken
      mockGetToken.mockResolvedValue({
        token: 'mock-azure-token-1234567890',
        expiresOnTimestamp: Date.now() + 3600000, // 1 hour from now
      });

      mockDefaultAzureCredential.mockImplementation(() => ({
        getToken: mockGetToken,
      }));
      mockManagedIdentityCredential.mockImplementation(() => ({
        getToken: mockGetToken,
      }));
      mockClientSecretCredential.mockImplementation(() => ({
        getToken: mockGetToken,
      }));
    });

    it('should use DefaultAzureCredential when no credentials are provided (system-assigned managed identity)', async () => {
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

      const factory = new CasbinDBAdapterFactory(config, db);
      await factory.createAdapter();

      // Verify DefaultAzureCredential was instantiated
      expect(mockDefaultAzureCredential).toHaveBeenCalled();
      expect(mockManagedIdentityCredential).not.toHaveBeenCalled();
      expect(mockClientSecretCredential).not.toHaveBeenCalled();

      // Verify TypeORMAdapter.newAdapter was called
      expect(newAdapterMock).toHaveBeenCalled();
      const adapterConfig = newAdapterMock.mock.calls[0][0];

      // Verify password is a function
      expect(typeof adapterConfig.password).toBe('function');

      // Call the password function to verify it works
      const passwordFn = adapterConfig.password;
      const tokenResult = await passwordFn();

      // Verify getToken was called with correct scope when password function is invoked
      expect(mockGetToken).toHaveBeenCalledWith(
        'https://ossrdbms-aad.database.windows.net/.default',
      );
      expect(tokenResult).toBe('mock-azure-token-1234567890');

      // Verify other config
      expect(adapterConfig.type).toBe('postgres');
      expect(adapterConfig.host).toBe('myserver.postgres.database.azure.com');
      expect(adapterConfig.port).toBe(5432);
      expect(adapterConfig.username).toBe('myuser@myserver');
      expect(adapterConfig.database).toBe('test-database');
      expect(adapterConfig.ssl).toEqual({ rejectUnauthorized: false });
    });

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
                tokenCredential: {
                  clientId: 'my-client-id',
                },
              },
            },
          },
        },
      });

      const factory = new CasbinDBAdapterFactory(config, dynamicConnectionDb);
      await factory.createAdapter();

      expect(newAdapterMock).toHaveBeenCalled();
      expect(newAdapterMock.mock.calls[0][0].database).toBe(
        'backstage_plugin_permission',
      );

      await dynamicConnectionDb.destroy();
    });

    it('should use ManagedIdentityCredential with clientId (user-assigned managed identity)', async () => {
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
                tokenCredential: {
                  clientId: 'my-client-id',
                },
              },
            },
          },
        },
      });

      const factory = new CasbinDBAdapterFactory(config, db);
      await factory.createAdapter();

      // Verify ManagedIdentityCredential was instantiated with clientId
      expect(mockManagedIdentityCredential).toHaveBeenCalledWith(
        'my-client-id',
      );
      expect(mockDefaultAzureCredential).not.toHaveBeenCalled();
      expect(mockClientSecretCredential).not.toHaveBeenCalled();

      // Call the password function to verify getToken is invoked
      const adapterConfig = newAdapterMock.mock.calls[0][0];
      const passwordFn = adapterConfig.password;
      await passwordFn();

      // Verify getToken was called when password function is invoked
      expect(mockGetToken).toHaveBeenCalledWith(
        'https://ossrdbms-aad.database.windows.net/.default',
      );
    });

    it('should use ClientSecretCredential with clientId, tenantId, and clientSecret (service principal)', async () => {
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
                tokenCredential: {
                  clientId: 'my-client-id',
                  tenantId: 'my-tenant-id',
                  clientSecret: 'my-client-secret',
                },
              },
            },
          },
        },
      });

      const factory = new CasbinDBAdapterFactory(config, db);
      await factory.createAdapter();

      // Verify ClientSecretCredential was instantiated with all three parameters
      expect(mockClientSecretCredential).toHaveBeenCalledWith(
        'my-tenant-id',
        'my-client-id',
        'my-client-secret',
      );
      expect(mockDefaultAzureCredential).not.toHaveBeenCalled();
      expect(mockManagedIdentityCredential).not.toHaveBeenCalled();

      // Call the password function to verify getToken is invoked
      const adapterConfig = newAdapterMock.mock.calls[0][0];
      const passwordFn = adapterConfig.password;
      await passwordFn();

      // Verify getToken was called when password function is invoked
      expect(mockGetToken).toHaveBeenCalledWith(
        'https://ossrdbms-aad.database.windows.net/.default',
      );
    });

    it('should call password function and return token when invoked', async () => {
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

      const factory = new CasbinDBAdapterFactory(config, db);
      await factory.createAdapter();

      // Get the password function that was passed to TypeORMAdapter
      const adapterConfig = newAdapterMock.mock.calls[0][0];
      const passwordFn = adapterConfig.password;

      // Clear previous calls
      mockGetToken.mockClear();

      // Call the password function
      const result = await passwordFn();

      // Verify it returns the token
      expect(result).toBe('mock-azure-token-1234567890');

      // Verify getToken was called when we invoked the password function
      expect(mockGetToken).toHaveBeenCalledTimes(1);
      expect(mockGetToken).toHaveBeenCalledWith(
        'https://ossrdbms-aad.database.windows.net/.default',
      );

      // Call it again to verify it fetches a fresh token each time
      mockGetToken.mockResolvedValue({
        token: 'new-token-different',
        expiresOnTimestamp: Date.now() + 3600000,
      });
      const result2 = await passwordFn();
      expect(result2).toBe('new-token-different');
      expect(mockGetToken).toHaveBeenCalledTimes(2);
    });

    it('should throw error when Azure token acquisition fails', async () => {
      mockGetToken.mockResolvedValue(null);

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

      const factory = new CasbinDBAdapterFactory(config, db);
      await factory.createAdapter();

      // Get the password function
      const adapterConfig = newAdapterMock.mock.calls[0][0];
      const passwordFn = adapterConfig.password;

      // The error should be thrown when the password function is called
      await expect(passwordFn()).rejects.toThrow(
        'Failed to acquire Azure access token for database authentication',
      );
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
