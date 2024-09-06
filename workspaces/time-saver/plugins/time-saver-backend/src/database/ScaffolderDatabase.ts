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
import { DatabaseManager } from '@backstage/backend-defaults/database';
import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { Knex } from 'knex';

export interface ScaffolderStore {
  collectSpecByTemplateId(templateTaskId: string): Promise<unknown | undefined>;
  updateTemplateTaskById(
    templateTaskId: string,
    templateTaskSpecs: string,
  ): Promise<unknown | undefined>;
}

export class ScaffolderDatabase implements ScaffolderStore {
  constructor(
    private readonly knex: Knex,
    private readonly logger: LoggerService,
  ) {}
  static async create(config: RootConfigService, logger: LoggerService) {
    const db = DatabaseManager.fromConfig(config).forPlugin('scaffolder');
    const knex = await db.getClient();

    return new ScaffolderDatabase(knex, logger);
  }
  async collectSpecByTemplateId(
    templateTaskId: string,
  ): Promise<unknown | undefined> {
    try {
      const result = await this.knex('tasks')
        .select('spec')
        .where('id', templateTaskId);
      this.logger.debug(
        `collectSpecByTemplateId : Data selected successfully ${JSON.stringify(
          result,
        )}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        'Error selecting data:',
        error ? (error as Error) : undefined,
      );
      throw error;
    }
  }
  async updateTemplateTaskById(
    templateTaskId: string,
    templateTaskSpecs: string,
  ): Promise<unknown | undefined> {
    try {
      const result = await this.knex('tasks')
        .where({ id: templateTaskId })
        .update({ spec: templateTaskSpecs });
      this.logger.debug(
        `updateTemplateTaskById : Data selected successfully ${JSON.stringify(
          result,
        )}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        'Error selecting data:',
        error ? (error as Error) : undefined,
      );
      throw error;
    }
  }
}
