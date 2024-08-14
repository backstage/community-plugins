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

import { LoggerService } from '@backstage/backend-plugin-api';
import { GithubClient } from '../client/GithubClient';
import { DatabaseHandler, MetricDbRow } from '../db/DatabaseHandler';
import { Config } from '@backstage/config';
import { DateTime } from 'luxon';

type Options = {
  api: GithubClient;
  config: Config;
  logger: LoggerService;
  db: DatabaseHandler;
};

export default class Scheduler {
  constructor(private readonly options: Options) {}

  static create(options: Options) {
    return new Scheduler(options);
  }

  async run() {
    try {
      this.options.logger.info('Starting Github Copilot Processor');

      const copilotMetrics =
        await this.options.api.getCopilotUsageDataForEnterprise();
      this.options.logger.info(`Fetched ${copilotMetrics.length} metrics`);

      const lastDay = await this.options.db.getMostRecentDayFromMetrics();
      this.options.logger.info(`Found last day: ${lastDay}`);

      const diff = copilotMetrics
        .sort(
          (a, b) =>
            DateTime.fromISO(a.day).toMillis() -
            DateTime.fromISO(b.day).toMillis(),
        )
        .filter(metric => {
          const metricDate = DateTime.fromISO(metric.day);
          const lastDayDate = lastDay ? DateTime.fromISO(lastDay) : null;
          return !lastDayDate || metricDate > lastDayDate;
        })
        .map(({ breakdown, ...rest }) => ({
          ...rest,
          breakdown: JSON.stringify(breakdown),
        }));

      this.options.logger.info(`Found ${diff.length} new metrics to insert`);

      if (diff.length > 0) {
        await batchInsertInChunks<MetricDbRow>(
          diff,
          30,
          async (chunk: MetricDbRow[]) => {
            await this.options.db.batchInsert(chunk);
          },
        );
        this.options.logger.info('Inserted new metrics into the database');
      } else {
        this.options.logger.info('No new metrics found to insert');
      }
    } catch (error) {
      this.options.logger.error(
        `An error occurred while processing Github Copilot metrics: ${error}`,
      );
    }
  }
}

async function batchInsertInChunks<T>(
  data: T[],
  chunkSize: number,
  batchInsertFunc: (chunk: T[]) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await batchInsertFunc(chunk);
  }
}
