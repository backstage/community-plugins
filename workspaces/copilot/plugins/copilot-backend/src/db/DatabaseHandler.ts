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
  MetricsType,
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

  async getPeriodRange(type: MetricsType): Promise<PeriodRange | undefined> {
    const query = this.db<MetricDbRow>('metrics').where('type', type);

    const minDate = await query.orderBy('day', 'asc').first('day');
    const maxDate = await query.orderBy('day', 'desc').first('day');

    if (!minDate?.day || !maxDate?.day) return undefined;

    return { minDate: minDate.day, maxDate: maxDate.day };
  }

  async getTeams(
    type: MetricsType,
    startDate: string,
    endDate: string,
  ): Promise<Array<string | undefined>> {
    const result = await this.db<MetricDbRow>('metrics')
      .where('type', type)
      .whereBetween('day', [startDate, endDate])
      .whereNotNull('team_name')
      .distinct('team_name')
      .orderBy('team_name', 'asc')
      .select('team_name');

    return result.map(x => x.team_name);
  }

  async batchInsert(metrics: MetricDbRow[]): Promise<void> {
    await this.db<MetricDbRow[]>('metrics')
      .insert(metrics)
      .onConflict(['day', 'type', 'team_name'])
      .ignore();
  }

  async getMostRecentDayFromMetrics(
    type: MetricsType,
    teamName?: string,
  ): Promise<string | undefined> {
    try {
      const query = await this.db<MetricDbRow>('metrics')
        .where('type', type)
        .where('team_name', teamName ?? null)
        .orderBy('day', 'desc')
        .first('day');
      return query ? query.day : undefined;
    } catch (e) {
      return undefined;
    }
  }

  async getMetrics(
    startDate: string,
    endDate: string,
    type: MetricsType,
    teamName?: string,
  ): Promise<MetricDbRow[]> {
    console.log(startDate, endDate, type, teamName);
    if (teamName) {
      return await this.db<MetricDbRow>('metrics')
        .where('type', type)
        .where('team_name', teamName)
        .whereBetween('day', [startDate, endDate]);
    }
    return this.db<MetricDbRow>('metrics')
      .where('type', type)
      .whereNull('team_name')
      .whereBetween('day', [startDate, endDate]);
  }
}
