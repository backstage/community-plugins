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
import { ConflictError, InputError, NotFoundError } from '@backstage/errors';

import { Knex } from 'knex';

import type {
  RoleMetadata,
  Source,
} from '@backstage-community/plugin-rbac-common';

import { deepSortedEqual } from '../helper';
import { RBACFilters } from '../permissions';
import { matches } from '../helper';

export const ROLE_METADATA_TABLE = 'role-metadata';

export interface RoleMetadataDao extends RoleMetadata {
  id?: number;
  roleEntityRef: string;
  source: Source;
  modifiedBy: string;
}

export interface RoleMetadataStorage {
  filterRoleMetadata(source?: Source): Promise<RoleMetadataDao[]>;
  filterForOwnerRoleMetadata(filter?: RBACFilters): Promise<RoleMetadataDao[]>;
  findRoleMetadata(
    roleEntityRef: string,
    trx?: Knex.Transaction,
  ): Promise<RoleMetadataDao | undefined>;
  createRoleMetadata(
    roleMetadata: RoleMetadataDao,
    trx: Knex.Transaction,
  ): Promise<number>;
  updateRoleMetadata(
    roleMetadata: RoleMetadataDao,
    oldRoleEntityRef: string,
    externalTrx?: Knex.Transaction,
  ): Promise<void>;
  removeRoleMetadata(
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<void>;
}

export class DataBaseRoleMetadataStorage implements RoleMetadataStorage {
  constructor(private readonly knex: Knex<any, any[]>) {}

  async filterRoleMetadata(source?: Source): Promise<RoleMetadataDao[]> {
    return await this.knex.table(ROLE_METADATA_TABLE).where(builder => {
      if (source) {
        builder.where('source', source);
      }
    });
  }

  async filterForOwnerRoleMetadata(
    filter?: RBACFilters,
  ): Promise<RoleMetadataDao[]> {
    const roleMetadata: RoleMetadataDao[] =
      await this.knex.table(ROLE_METADATA_TABLE);

    if (filter) {
      return roleMetadata.filter(role => {
        return matches(role as RoleMetadata, filter);
      });
    }

    return roleMetadata;
  }

  async findRoleMetadata(
    roleEntityRef: string,
    trx?: Knex.Transaction,
  ): Promise<RoleMetadataDao | undefined> {
    const db = trx || this.knex;
    return await db
      .table(ROLE_METADATA_TABLE)
      .where('roleEntityRef', roleEntityRef)
      // roleEntityRef should be unique.
      .first();
  }

  async createRoleMetadata(
    metadata: RoleMetadataDao,
    trx: Knex.Transaction,
  ): Promise<number> {
    if (await this.findRoleMetadata(metadata.roleEntityRef, trx)) {
      throw new ConflictError(
        `A metadata for role ${metadata.roleEntityRef} has already been stored`,
      );
    }

    const result = await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .insert(metadata)
      .returning<[{ id: number }]>('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }

    throw new Error(
      `Failed to create the role metadata: '${JSON.stringify(metadata)}'.`,
    );
  }

  async updateRoleMetadata(
    newRoleMetadata: RoleMetadataDao,
    oldRoleEntityRef: string,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    const currentMetadataDao = await this.findRoleMetadata(
      oldRoleEntityRef,
      trx,
    );

    if (!currentMetadataDao) {
      throw new NotFoundError(
        `A metadata for role '${oldRoleEntityRef}' was not found`,
      );
    }

    if (
      currentMetadataDao.source !== 'legacy' &&
      currentMetadataDao.source !== newRoleMetadata.source
    ) {
      throw new InputError(`The RoleMetadata.source field is 'read-only'.`);
    }

    if (deepSortedEqual(currentMetadataDao, newRoleMetadata)) {
      return;
    }

    const result = await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .where('id', currentMetadataDao.id)
      .update(newRoleMetadata)
      .returning('id');

    if (!externalTrx) {
      await trx.commit();
    }

    if (!result || result.length === 0) {
      throw new Error(
        `Failed to update the role metadata '${JSON.stringify(
          currentMetadataDao,
        )}' with new value: '${JSON.stringify(newRoleMetadata)}'.`,
      );
    }
  }

  async removeRoleMetadata(
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<void> {
    const metadataDao = await this.findRoleMetadata(roleEntityRef, trx);
    if (!metadataDao) {
      throw new NotFoundError(
        `A metadata for role '${roleEntityRef}' was not found`,
      );
    }

    await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .delete()
      .whereIn('id', [metadataDao.id!]);
  }
}

export function daoToMetadata(dao: RoleMetadataDao): RoleMetadata {
  return {
    source: dao.source,
    description: dao.description,
    owner: dao.owner,
    author: dao.author,
    modifiedBy: dao.modifiedBy,
    createdAt: dao.createdAt,
    lastModified: dao.lastModified,
  };
}
