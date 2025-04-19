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
import { Knex } from 'knex';
import { AncestorSearchMemo, ASMGroup } from './ancestor-search-memo';
import { AncestorSearchMemoPG } from './ancestor-search-memo-pg';
import { AncestorSearchMemoSQLite } from './ancestor-search-memo-sqlite';
import type { AuthService } from '@backstage/backend-plugin-api';
import type { CatalogApi } from '@backstage/catalog-client';
import type { Config } from '@backstage/config';

export class AncestorSearchFactory {
  static async createAncestorSearchMemo(
    userEntityRef: string,
    config: Config,
    catalogAPI: CatalogApi,
    catalogDBClient: Knex,
    authService: AuthService,
    maxDepth?: number,
  ): Promise<AncestorSearchMemo<ASMGroup>> {
    const databaseConfig = config.getOptionalConfig('backend.database');
    const client = databaseConfig?.getOptionalString('client');

    if (client === 'pg') {
      return new AncestorSearchMemoPG(userEntityRef, catalogDBClient, maxDepth);
    }

    if (client === 'better-sqlite3') {
      return new AncestorSearchMemoSQLite(
        userEntityRef,
        catalogAPI,
        authService,
        maxDepth,
      );
    }

    throw new Error(`Unsupported database: ${client}`);
  }
}
