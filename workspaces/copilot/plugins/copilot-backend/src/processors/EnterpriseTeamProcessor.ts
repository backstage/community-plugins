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

export class EnterpriseTeamProcessor implements IProcessor {
  name: string;

  constructor(private readonly options: Options) {
    this.name = 'EnterpriseTeamProcessor';
  }

  shouldRun(config: Config): boolean {
    return config.has('copilot.enterprise');
  }

  async run(): Promise<void> {
    const type: MetricsType = 'enterprise';

    try {
      this.options.logger.info(`[${this.name}] Starting Processor`);

      const teams = await this.options.api.fetchEnterpriseTeams();
      this.options.logger.info(`[${this.name}] Fetched ${teams.length} teams`);

      for (const team of teams) {
        try {
          this.options.logger.info(
            `[${this.name}] Fetching metrics for team: ${team.slug}`,
          );

          const metrics =
            await this.options.api.fetchEnterpriseTeamCopilotUsage(team.slug);

          this.options.logger.info(
            `[${this.name}] Fetched ${metrics.length} metrics for team: ${team.slug}`,
          );

          const lastDay = await this.options.db.getMostRecentDayFromMetrics(
            type,
            team.slug,
          );
          this.options.logger.info(
            `[${this.name}] Found last processed day for team ${team.slug}: ${lastDay}`,
          );

          const newMetrics = filterNewMetrics(metrics, lastDay);

          this.options.logger.info(
            `[${this.name}] Found ${newMetrics.length} new metrics for team ${team.slug} to insert`,
          );

          if (newMetrics.length > 0) {
            await batchInsertInChunks<MetricDbRow>(
              prepareMetricsForInsert(newMetrics, type, team.slug),
              30,
              async (chunk: MetricDbRow[]) => {
                await this.options.db.batchInsert(chunk);
              },
            );
            this.options.logger.info(
              `[${this.name}] Successfully inserted new metrics for team ${team.slug} into the database`,
            );
          } else {
            this.options.logger.info(
              `[${this.name}] No new metrics found for team ${team.slug} to insert`,
            );
          }
        } catch (error) {
          this.options.logger.error(
            `[${this.name}] Error processing metrics for team ${team.slug}: ${error}`,
          );
        }
      }
    } catch (error) {
      this.options.logger.error(
        `[${this.name}] Error fetching teams: ${error}`,
      );
    }
  }
}
