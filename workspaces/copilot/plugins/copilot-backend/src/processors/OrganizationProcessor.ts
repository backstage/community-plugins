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
import { MetricsType } from '@backstage-community/plugin-copilot-common';
import { DatabaseHandler, MetricDbRow } from '../db/DatabaseHandler';
import { IProcessor } from './IProcessor';
import { GithubClient } from '../client/GithubClient';
import { LoggerService } from '@backstage/backend-plugin-api';
import {
  filterNewMetrics,
  prepareMetricsForInsert,
} from '../utils/metricHelpers';
import { batchInsertInChunks } from '../utils/batchInsert';
import { Config } from '@backstage/config';

type Options = {
  api: GithubClient;
  logger: LoggerService;
  db: DatabaseHandler;
};

export class OrganizationProcessor implements IProcessor {
  name: string;

  constructor(private readonly options: Options) {
    this.name = 'OrganizationProcessor';
  }

  shouldRun(config: Config): boolean {
    return config.has('copilot.organization');
  }

  async run(): Promise<void> {
    const type: MetricsType = 'organization';
    try {
      this.options.logger.info(`[${this.name}] Processor`);

      const metrics = await this.options.api.fetchOrganizationCopilotUsage();
      this.options.logger.info(
        `[${this.name}] Fetched ${metrics.length} metrics`,
      );

      const lastDay = await this.options.db.getMostRecentDayFromMetrics(type);
      this.options.logger.info(`[${this.name}] Found last day: ${lastDay}`);

      const newMetrics = filterNewMetrics(metrics, lastDay);

      this.options.logger.info(
        `[${this.name}] Found ${newMetrics.length} new metrics to insert`,
      );

      if (newMetrics.length > 0) {
        await batchInsertInChunks<MetricDbRow>(
          prepareMetricsForInsert(newMetrics, type),
          30,
          async (chunk: MetricDbRow[]) => {
            await this.options.db.batchInsert(chunk);
          },
        );
        this.options.logger.info(
          `[${this.name}] Inserted new metrics into the database`,
        );
      } else {
        this.options.logger.info(
          `[${this.name}] No new metrics found to insert`,
        );
      }
    } catch (error) {
      this.options.logger.error(
        `[${this.name}] An error occurred while processing Github Copilot metrics: ${error}`,
      );
    }
  }
}
