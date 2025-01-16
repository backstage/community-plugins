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
      const dbName =
        await this.databaseClient.client.config.connection.database;
      const schema =
        (await this.databaseClient.client.searchPath?.[0]) ?? 'public';

      const ssl = this.handlePostgresSSL(databaseConfig!);

      adapter = await TypeORMAdapter.newAdapter({
        type: 'postgres',
        host: databaseConfig?.getString('connection.host'),
        port: databaseConfig?.getNumber('connection.port'),
        username: databaseConfig?.getString('connection.user'),
        password: databaseConfig?.getString('connection.password'),
        ssl,
        database: dbName,
        schema: schema,
        poolSize: databaseConfig?.getOptionalNumber('knexConfig.pool.max'),
      });
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
