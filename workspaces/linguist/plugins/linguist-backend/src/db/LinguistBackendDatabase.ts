/*
 * Copyright 2022 The Backstage Authors
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

import { resolvePackagePath } from '@backstage/backend-plugin-api';
import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';
import {
  EntityResults,
  Languages,
  ProcessedEntity,
} from '@backstage-community/plugin-linguist-common';

export type RawDbEntityResultRow = {
  id: string;
  entity_ref: string;
  languages?: string;
  processed_date?: Date;
};

/** @public */
export interface LinguistBackendStore {
  insertEntityResults(entityLanguages: EntityResults): Promise<string>;
  insertNewEntity(entityRef: string): Promise<void>;
  markEntityProcessed(entityRef: string, processedDate: Date): Promise<void>;
  getEntityResults(entityRef: string): Promise<Languages>;
  getProcessedEntities(): Promise<ProcessedEntity[]>;
  getUnprocessedEntities(): Promise<string[]>;
  getAllEntities(): Promise<string[]>;
  deleteEntity(entityRef: string): Promise<void>;
}

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-linguist-backend',
  'migrations',
);

/** @public */
export class LinguistBackendDatabase implements LinguistBackendStore {
  static async create(knex: Knex): Promise<LinguistBackendStore> {
    await knex.migrate.latest({
      directory: migrationsDir,
    });
    return new LinguistBackendDatabase(knex);
  }

  constructor(private readonly db: Knex) {}

  async insertEntityResults(entityLanguages: EntityResults): Promise<string> {
    const entityLanguageId = uuid();
    const entityRef = entityLanguages.entityRef;

    const [result] = await this.db<RawDbEntityResultRow>('entity_result')
      .insert({
        id: entityLanguageId,
        entity_ref: entityRef,
        languages: JSON.stringify(entityLanguages.results),
        processed_date: new Date(entityLanguages.results.processedDate),
      })
      .onConflict('entity_ref')
      .merge(['languages', 'processed_date'])
      .returning('id');

    return result.id;
  }

  async insertNewEntity(entityRef: string): Promise<void> {
    const entityLanguageId = uuid();

    await this.db<RawDbEntityResultRow>('entity_result')
      .insert({
        id: entityLanguageId,
        entity_ref: entityRef,
      })
      .onConflict('entity_ref')
      .ignore(); // If the entity_ref is in the table already then we don't want to add it again
  }

  async markEntityProcessed(
    entityRef: string,
    processedDate: Date,
  ): Promise<void> {
    // Record only that an attempt happened. Leave `languages` untouched:
    // a previously analysed entity keeps its result, and a failed/never-analysed
    // entity keeps null languages so it stays in the unprocessed queue (ordered
    // last) until it is retried.
    await this.db<RawDbEntityResultRow>('entity_result')
      .where({ entity_ref: entityRef })
      .update({ processed_date: processedDate });
  }

  async getEntityResults(entityRef: string): Promise<Languages> {
    const entityResults = await this.db<RawDbEntityResultRow>('entity_result')
      .whereNotNull('languages')
      .where({ entity_ref: entityRef })
      .first();

    if (!entityResults || !entityResults.languages) {
      const emptyResults: Languages = {
        languageCount: 0,
        totalBytes: 0,
        processedDate: 'undefined',
        breakdown: [],
      };
      return emptyResults;
    }

    try {
      return JSON.parse(entityResults.languages);
    } catch (error) {
      throw new Error(`Failed to parse languages for '${entityRef}', ${error}`);
    }
  }

  async getProcessedEntities(): Promise<ProcessedEntity[]> {
    const rawEntities = await this.db<RawDbEntityResultRow>('entity_result')
      .whereNotNull('processed_date')
      .whereNotNull('languages');

    if (!rawEntities) {
      return [];
    }

    const processedEntities = rawEntities.map(rawEntity => {
      // Note: processed_date should never be null, this is handled by the DB query above
      let processedDate = new Date();
      if (rawEntity.processed_date) {
        // SQLite will return a Timestamp whereas Postgres will return a proper Date
        // This tests to see if we are getting a timestamp and convert if needed
        processedDate = new Date(+rawEntity.processed_date.toString());
        if (isNaN(+rawEntity.processed_date.toString())) {
          processedDate = rawEntity.processed_date;
        }
      }

      const processEntity = {
        entityRef: rawEntity.entity_ref,
        processedDate,
      };

      return processEntity;
    });

    return processedEntities;
  }

  async getUnprocessedEntities(): Promise<string[]> {
    const rawEntities = await this.db<RawDbEntityResultRow>('entity_result')
      // Only entities without a language breakdown are still pending.
      .whereNull('languages')
      // Never-processed entities (null processed_date) first, then previously
      // failed ones ordered by when they were last attempted. Two explicit
      // order terms are used instead of knex's `orderBy(col, 'asc', 'first')`
      // nulls option, which on SQLite collapses to only the null-position
      // expression and drops the ascending date sort.
      .orderByRaw('?? is not null asc', ['processed_date'])
      .orderBy('processed_date', 'asc');

    if (!rawEntities) {
      return [];
    }

    const unprocessedEntities = rawEntities.map(rawEntity => {
      return rawEntity.entity_ref;
    });

    return unprocessedEntities;
  }

  async getAllEntities(): Promise<string[]> {
    const rawEntities = await this.db<RawDbEntityResultRow>('entity_result');

    if (!rawEntities) {
      return [];
    }

    const allEntities = rawEntities.map(rawEntity => {
      return rawEntity.entity_ref;
    });

    return allEntities;
  }

  async deleteEntity(entityRef: string): Promise<void> {
    await this.db<RawDbEntityResultRow>('entity_result')
      .where('entity_ref', entityRef)
      .delete();
  }
}
