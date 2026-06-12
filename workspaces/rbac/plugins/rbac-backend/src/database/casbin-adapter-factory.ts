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
import type { Config } from '@backstage/config';
import type { ConfigApi } from '@backstage/core-plugin-api';

import { Knex } from 'knex';
import TypeORMAdapter from 'typeorm-adapter';

import { resolve } from 'path';
import type { ConnectionOptions, TlsOptions } from 'tls';

import '@backstage/backend-defaults/database';

const DEFAULT_SQLITE3_STORAGE_FILE_NAME = 'rbac.sqlite';

export class CasbinDBAdapterFactory {
  public constructor(
    private readonly config: ConfigApi,
    private readonly databaseClient: Knex,
  ) {}

  public async createAdapter(): Promise<TypeORMAdapter> {
    const databaseConfig = this.config.getOptionalConfig('backend.database');
    const client = databaseConfig?.getOptionalString('client');

    let adapter;
    if (client === 'pg') {
      const dbConnection = this.databaseClient.client.config.connection;
      const dbName =
        typeof dbConnection === 'function'
          ? (await dbConnection()).database
          : dbConnection.database;
      const schema =
        (await this.databaseClient.client.searchPath?.[0]) ?? 'public';

      const connectionType =
        databaseConfig?.getOptionalString('connection.type');

      if (connectionType === 'azure') {
        adapter = await this.createAzureAdapter(
          databaseConfig!,
          dbName,
          schema,
        );
      } else {
        const ssl = this.handlePostgresSSL(databaseConfig!);

        adapter = await TypeORMAdapter.newAdapter({
          type: 'postgres',
          host: databaseConfig?.getString('connection.host'),
          port: databaseConfig?.getNumber('connection.port'),
          username: databaseConfig?.getOptionalString('connection.user'),
          password: databaseConfig?.getOptionalString('connection.password'),
          ssl,
          database: dbName,
          schema: schema,
          poolSize: databaseConfig?.getOptionalNumber('knexConfig.pool.max'),
        });
      }
    }

    if (client === 'better-sqlite3') {
      let storage;
      if (typeof databaseConfig?.get('connection')?.valueOf() === 'string') {
        storage = databaseConfig?.getString('connection');
      } else if (databaseConfig?.has('connection.directory')) {
        const storageDir = databaseConfig?.getString('connection.directory');
        storage = resolve(storageDir, DEFAULT_SQLITE3_STORAGE_FILE_NAME);
      }

      adapter = await TypeORMAdapter.newAdapter({
        type: 'better-sqlite3',
        // Storage type or path to the storage.
        database: storage || ':memory:',
      });
    }

    if (!adapter) {
      throw new Error(`Unsupported database client ${client}`);
    }

    return adapter;
  }

  private async createAzureAdapter(
    dbConfig: Config,
    dbName: string,
    schema: string,
  ): Promise<TypeORMAdapter> {
    // eslint-disable-next-line @backstage/no-forbidden-package-imports
    const {
      DefaultAzureCredential,
      ManagedIdentityCredential,
      ClientSecretCredential,
    } = require('@azure/identity');

    const tokenConfig = dbConfig.getOptionalConfig(
      'connection.tokenCredential',
    );

    const clientId = tokenConfig?.getOptionalString('clientId');
    const tenantId = tokenConfig?.getOptionalString('tenantId');
    const clientSecret = tokenConfig?.getOptionalString('clientSecret');
    let credential;

    /**
     * Determine which TokenCredential to use based on provided config
     * 1. If clientId, tenantId and clientSecret are provided, use ClientSecretCredential
     * 2. If only clientId is provided, use ManagedIdentityCredential with user-assigned identity
     * 3. Otherwise, use DefaultAzureCredential (which may use system-assigned identity among other methods)
     */
    if (clientId && tenantId && clientSecret) {
      credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    } else if (clientId) {
      credential = new ManagedIdentityCredential(clientId);
    } else {
      credential = new DefaultAzureCredential();
    }

    const ssl = this.handlePostgresSSL(dbConfig);

    // Create a password function that fetches fresh Azure AD tokens
    // The pg driver supports async password functions, enabling automatic token renewal
    const passwordFn = async () => {
      const token = await credential.getToken(
        'https://ossrdbms-aad.database.windows.net/.default',
      );

      if (!token) {
        throw new Error(
          'Failed to acquire Azure access token for database authentication',
        );
      }

      return token.token;
    };

    // Create adapter with Azure AD token function for automatic renewal
    // The pg driver will call passwordFn on each new connection, ensuring fresh tokens
    return TypeORMAdapter.newAdapter({
      type: 'postgres',
      host: dbConfig.getString('connection.host'),
      port: dbConfig.getNumber('connection.port'),
      username: dbConfig.getString('connection.user'),
      password: passwordFn as any, // TypeORM types don't include function, but pg driver supports it
      ssl,
      database: dbName,
      schema: schema,
      poolSize: dbConfig.getOptionalNumber('knexConfig.pool.max'),
    });
  }

  private handlePostgresSSL(
    dbConfig: Config,
  ): boolean | TlsOptions | undefined {
    const connection = dbConfig.getOptional<Knex.PgConnectionConfig | string>(
      'connection',
    );
    if (!connection) {
      return undefined;
    }

    if (typeof connection === 'string' || connection instanceof String) {
      throw new Error(
        `rbac backend plugin doesn't support postgres connection in a string format yet`,
      );
    }

    const ssl: boolean | ConnectionOptions | undefined = connection.ssl;

    if (ssl === undefined) {
      return undefined;
    }

    if (typeof ssl === 'boolean') {
      return ssl;
    }

    if (typeof ssl === 'object') {
      const { ca, rejectUnauthorized } = ssl as ConnectionOptions;
      const tlsOpts = { ca, rejectUnauthorized };

      // SSL object was defined with some options that we don't support yet.
      if (Object.values(tlsOpts).every(el => el === undefined)) {
        return true;
      }

      return tlsOpts;
    }

    return undefined;
  }
}
