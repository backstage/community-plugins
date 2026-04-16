/*
 * Copyright 2026 The Backstage Authors
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
import type { DatabaseService } from '@backstage/backend-plugin-api';
import { resolvePackagePath } from '@backstage/backend-plugin-api';

/** Knex client type derived from DatabaseService to avoid version conflicts. */
type Knex = Awaited<ReturnType<DatabaseService['getClient']>>;

/** Stored row from the entity_patches table. */
interface PatchRow {
  id: number;
  entity_ref: string;
  patch_name: string;
  data: string;
  updated_by: string | null;
  updated_at: Date;
}

/** In-memory shape used by the router. */
export type PatchDataMap = Record<string, Record<string, unknown>>;

export class PatchStore {
  private constructor(private readonly db: Knex) {}

  static async create(database: DatabaseService): Promise<PatchStore> {
    const client = await database.getClient();
    if (!database.migrations?.skip) {
      await client.migrate.latest({
        directory: resolvePackagePath(
          '@backstage-community/plugin-entity-patch-backend',
          'migrations',
        ),
      });
    }
    return new PatchStore(client);
  }

  /** Returns all stored patches for an entity, keyed by patch name. */
  async findByEntityRef(entityRef: string): Promise<PatchDataMap> {
    const rows = await this.db<PatchRow>('entity_patches')
      .where({ entity_ref: entityRef })
      .select('patch_name', 'data');

    return Object.fromEntries(
      rows.map(row => [row.patch_name, JSON.parse(row.data)]),
    );
  }

  /**
   * Returns all stored patches for an entity together with the latest
   * `updated_at` timestamp, all in a single query. Using a single query
   * avoids a TOCTOU race where a write between two separate queries could
   * make the ETag cover data not in the response.
   */
  async findWithLatestUpdatedAt(
    entityRef: string,
  ): Promise<{ rows: PatchDataMap; latestUpdatedAt: string | null }> {
    const rows = await this.db<PatchRow>('entity_patches')
      .where({ entity_ref: entityRef })
      .select('patch_name', 'data', 'updated_at');

    const latestUpdatedAt =
      rows.length > 0
        ? rows.reduce(
            (max, r) => {
              const ts =
                r.updated_at instanceof Date
                  ? r.updated_at.toISOString()
                  : String(r.updated_at);
              return ts > max ? ts : max;
            },
            rows[0].updated_at instanceof Date
              ? rows[0].updated_at.toISOString()
              : String(rows[0].updated_at),
          )
        : null;

    const patchMap: PatchDataMap = Object.fromEntries(
      rows.map(row => [row.patch_name, JSON.parse(row.data)]),
    );

    return { rows: patchMap, latestUpdatedAt };
  }

  /** Inserts or updates patch data for a single patch on an entity. */
  async upsert(
    entityRef: string,
    patchName: string,
    data: Record<string, unknown>,
    updatedBy: string | null,
  ): Promise<void> {
    const now = new Date();
    await this.db('entity_patches')
      .insert({
        entity_ref: entityRef,
        patch_name: patchName,
        data: JSON.stringify(data),
        updated_by: updatedBy,
        updated_at: now,
      })
      .onConflict(['entity_ref', 'patch_name'])
      .merge(['data', 'updated_by', 'updated_at']);
  }
}
