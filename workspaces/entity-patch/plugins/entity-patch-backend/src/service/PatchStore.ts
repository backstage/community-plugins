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
import type { Knex } from 'knex';

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

  /** Inserts or updates patch data for a single patch on an entity. */
  async upsert(
    entityRef: string,
    patchName: string,
    data: Record<string, unknown>,
    updatedBy: string | null,
  ): Promise<void> {
    const now = new Date();
    const existing = await this.db<PatchRow>('entity_patches')
      .where({ entity_ref: entityRef, patch_name: patchName })
      .first();

    if (existing) {
      await this.db<PatchRow>('entity_patches')
        .where({ entity_ref: entityRef, patch_name: patchName })
        .update({
          data: JSON.stringify(data),
          updated_by: updatedBy,
          updated_at: now,
        });
    } else {
      await this.db<PatchRow>('entity_patches').insert({
        entity_ref: entityRef,
        patch_name: patchName,
        data: JSON.stringify(data),
        updated_by: updatedBy,
        updated_at: now,
      });
    }
  }
}
