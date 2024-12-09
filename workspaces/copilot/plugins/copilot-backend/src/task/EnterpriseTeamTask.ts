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
import { MetricDbRow } from '../db/DatabaseHandler';
import { batchInsertInChunks } from '../utils/batchInsert';
import {
  filterNewMetrics,
  prepareMetricsForInsert,
} from '../utils/metricHelpers';
import { TaskOptions } from './TaskManagement';

export async function discoverEnterpriseTeamMetrics({
  api,
  logger,
  db,
  config,
}: TaskOptions): Promise<void> {
  if (!config.getOptionalString('copilot.enterprise')) {
    logger.info(
      '[discoverEnterpriseTeamMetrics] Skipping: Enterprise configuration not found.',
    );
    return;
  }

  const type: MetricsType = 'enterprise';

  try {
    const teams = await api.fetchEnterpriseTeams();
    logger.info(
      `[discoverEnterpriseTeamMetrics] Fetched ${teams.length} teams`,
    );

    for (const team of teams) {
      try {
        logger.info(
          `[discoverEnterpriseTeamMetrics] Fetching metrics for team: ${team.slug}`,
        );

        const metrics = await api.fetchEnterpriseTeamCopilotUsage(team.slug);
        logger.info(
          `[discoverEnterpriseTeamMetrics] Fetched ${metrics.length} metrics for team: ${team.slug}`,
        );

        const lastDay = await db.getMostRecentDayFromMetrics(type, team.slug);
        logger.info(
          `[discoverEnterpriseTeamMetrics] Found last processed day for team ${team.slug}: ${lastDay}`,
        );

        const newMetrics = filterNewMetrics(metrics, lastDay);
        logger.info(
          `[discoverEnterpriseTeamMetrics] Found ${newMetrics.length} new metrics for team ${team.slug} to insert`,
        );

        if (newMetrics.length > 0) {
          await batchInsertInChunks<MetricDbRow>(
            prepareMetricsForInsert(newMetrics, type, team.slug),
            30,
            async (chunk: MetricDbRow[]) => {
              await db.batchInsert(chunk);
            },
          );
          logger.info(
            `[discoverEnterpriseTeamMetrics] Successfully inserted new metrics for team ${team.slug} into the database`,
          );
        } else {
          logger.info(
            `[discoverEnterpriseTeamMetrics] No new metrics found for team ${team.slug} to insert`,
          );
        }
      } catch (error) {
        logger.error(
          `[discoverEnterpriseTeamMetrics] Error processing metrics for team ${team.slug}: ${error}`,
        );
      }
    }
  } catch (error) {
    logger.error(
      `[discoverEnterpriseTeamMetrics] Error fetching teams: ${error}`,
    );
    throw error;
  }
}
