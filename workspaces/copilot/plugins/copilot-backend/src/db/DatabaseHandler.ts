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
  resolvePackagePath,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import {
  Metric,
  PeriodRange,
} from '@backstage-community/plugin-copilot-common';
import { Knex } from 'knex';

const migrationsDir = resolvePackagePath(
  '@backstage-community/plugin-copilot-backend',
  'migrations',
);

type Options = {
  database: DatabaseService;
};

export type MetricDbRow = Omit<Metric, 'breakdown'> & {
  breakdown: string;
};

export class DatabaseHandler {
  static async create(options: Options): Promise<DatabaseHandler> {
    const { database } = options;
    const client = await database.getClient();

    if (!database.migrations?.skip) {
      await client.migrate.latest({
        directory: migrationsDir,
      });
    }

    return new DatabaseHandler(client);
  }

  private constructor(private readonly db: Knex) {}

  async getByPeriod(
    startDate: string,
    endDate: string,
  ): Promise<MetricDbRow[]> {
    const records = await this.db<MetricDbRow>('metrics').whereBetween('day', [
      startDate,
      endDate,
    ]);
    return records ?? [];
  }

  async getPeriodRange(): Promise<PeriodRange | undefined> {
    const minDate = await this.db<MetricDbRow>('metrics')
      .orderBy('day', 'asc')
      .first('day');
    const maxDate = await this.db<MetricDbRow>('metrics')
      .orderBy('day', 'desc')
      .first('day');

    if (!minDate?.day || !maxDate?.day) return undefined;

    return { minDate: minDate.day, maxDate: maxDate.day };
  }

  async batchInsert(metrics: MetricDbRow[]): Promise<void> {
    await this.db<MetricDbRow[]>('metrics')
      .insert(metrics)
      .onConflict('day')
      .ignore();
  }

  async getMostRecentDayFromMetrics(): Promise<string | undefined> {
    try {
      const mostRecent = await this.db<MetricDbRow>('metrics')
        .orderBy('day', 'desc')
        .first('day');

      return mostRecent ? mostRecent.day : undefined;
    } catch (e) {
      return undefined;
    }
  }
}
