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

export async function discoverEnterpriseMetrics({
  api,
  logger,
  db,
  config,
}: TaskOptions): Promise<void> {
  if (!config.getOptionalString('copilot.enterprise')) {
    logger.info(
      '[discoverEnterpriseMetrics] Skipping: Enterprise configuration not found.',
    );
    return;
  }

  const type: MetricsType = 'enterprise';

  try {
    const metrics = await api.fetchEnterpriseCopilotUsage();
    logger.info(
      `[discoverEnterpriseMetrics] Fetched ${metrics.length} metrics`,
    );

    const lastDay = await db.getMostRecentDayFromMetrics(type);
    logger.info(`[discoverEnterpriseMetrics] Found last day: ${lastDay}`);

    const newMetrics = filterNewMetrics(metrics, lastDay);
    logger.info(
      `[discoverEnterpriseMetrics] Found ${newMetrics.length} new metrics to insert`,
    );

    if (newMetrics.length > 0) {
      await batchInsertInChunks<MetricDbRow>(
        prepareMetricsForInsert(newMetrics, type),
        30,
        async (chunk: MetricDbRow[]) => {
          await db.batchInsert(chunk);
        },
      );
      logger.info(
        '[discoverEnterpriseMetrics] Inserted new metrics into the database',
      );
    } else {
      logger.info('[discoverEnterpriseMetrics] No new metrics found to insert');
    }
  } catch (error) {
    logger.error(
      `[discoverEnterpriseMetrics] An error occurred while processing Github Copilot metrics: ${error}`,
    );
    throw error;
  }
}
