/*
 * Copyright 2021 The Backstage Authors
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
  DatabaseService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { NotFoundError, ForwardedError, InputError } from '@backstage/errors';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';
import { aggregateCoverage } from './CoverageUtils';
import { JsonCodeCoverage, JsonCoverageHistory } from './types';

export type RawDbCoverageRow = {
  id: string;
  entity: string;
  coverage: string;
};

export interface CodeCoverageStore {
  insertCodeCoverage(
    coverage: JsonCodeCoverage,
  ): Promise<{ codeCoverageId: string }>;
  getCodeCoverage(entity: string): Promise<JsonCodeCoverage>;
  getHistory(entity: string, limit: number): Promise<JsonCoverageHistory>;
}

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-code-coverage-backend',
  'migrations',
);

/**
 * Stores and retrieves code coverage snapshots for catalog entities.
 * Each insert represents a point-in-time coverage report.
 */
export class CodeCoverageDatabase implements CodeCoverageStore {
  static async create(database: DatabaseService): Promise<CodeCoverageStore> {
    const knex = await database.getClient();

    if (!database.migrations?.skip) {
      await knex.migrate.latest({
        directory: migrationsDir,
      });
    }

    return new CodeCoverageDatabase(knex);
  }

  constructor(private readonly db: Knex) {}

  private async getCoverageRows(
    entity: string,
    limit: number,
  ): Promise<RawDbCoverageRow[]> {
    return this.db<RawDbCoverageRow>('code_coverage')
      .where({ entity })
      .orderBy('index', 'desc')
      .limit(limit)
      .select();
  }

  private parseCoverageJson(json: string): JsonCodeCoverage {
    try {
      return JSON.parse(json);
    } catch (error) {
      throw new ForwardedError('Failed to parse coverage JSON', error);
    }
  }

  async insertCodeCoverage(
    coverage: JsonCodeCoverage,
  ): Promise<{ codeCoverageId: string }> {
    const codeCoverageId = uuid();
    const entity = stringifyEntityRef({
      kind: coverage.entity.kind,
      namespace: coverage.entity.namespace,
      name: coverage.entity.name,
    });

    await this.db.transaction(async trx => {
      await trx<RawDbCoverageRow>('code_coverage').insert({
        id: codeCoverageId,
        entity,
        coverage: JSON.stringify(coverage),
      });
    });

    return { codeCoverageId };
  }

  async getCodeCoverage(entity: string): Promise<JsonCodeCoverage> {
    try {
      parseEntityRef(entity);
    } catch (error) {
      throw new InputError(`Invalid entity reference '${entity}'`);
    }

    const [result] = await this.getCoverageRows(entity, 1);

    if (!result) {
      throw new NotFoundError(
        `No coverage for entity '${JSON.stringify(entity)}' found`,
      );
    }

    return this.parseCoverageJson(result.coverage);
  }

  async getHistory(
    entity: string,
    limit: number,
  ): Promise<JsonCoverageHistory> {
    try {
      parseEntityRef(entity);
    } catch (error) {
      throw new InputError(`Invalid entity reference '${entity}'`);
    }

    const res = await this.getCoverageRows(entity, limit);

    const history = res
      .map(r => this.parseCoverageJson(r.coverage))
      .map(c => aggregateCoverage(c));

    const entityName = parseEntityRef(entity);

    return {
      entity: {
        name: entityName.name,
        kind: entityName.kind,
        namespace: entityName.namespace,
      },
      history,
    };
  }
}
