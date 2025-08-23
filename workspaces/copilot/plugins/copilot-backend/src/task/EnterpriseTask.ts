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
import {
  CopilotMetrics,
  MetricsType,
} from '@backstage-community/plugin-copilot-common';
import { batchInsertInChunks } from '../utils/batchInsert';
import {
  convertToSeatAnalysis,
  filterBaseMetrics,
  filterIdeChatEditorModelMetrics,
  filterIdeChatMetrics,
  filterIdeCompletionEditorMetrics,
  filterIdeCompletionEditorModelLanguageMetrics,
  filterIdeCompletionEditorModelMetrics,
  filterIdeCompletionLanguageMetrics,
  filterIdeCompletionMetrics,
  filterIdeEditorMetrics,
  filterNewMetricsV2,
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
    const copilotMetrics = await api.fetchEnterpriseCopilotMetrics();
    logger.info(
      `[discoverEnterpriseMetrics] Fetched ${copilotMetrics.length} metrics`,
    );

    const lastDay = await db.getMostRecentDayFromMetricsV2(type);
    logger.info(`[discoverEnterpriseMetrics] Found last day: ${lastDay}`);

    const newMetrics: CopilotMetrics[] = filterNewMetricsV2(
      copilotMetrics,
      lastDay,
    );
    logger.info(
      `[discoverEnterpriseMetrics] Found ${newMetrics.length} new metrics to insert`,
    );

    if (newMetrics.length > 0) {
      const coPilotMetrics = filterBaseMetrics(newMetrics, type);
      const ideCompletionsToInsert = filterIdeCompletionMetrics(
        newMetrics,
        type,
      );
      const ideCompletionsLanguagesToInsert =
        filterIdeCompletionLanguageMetrics(newMetrics, type);
      const ideCompletionsEditorsToInsert = filterIdeCompletionEditorMetrics(
        newMetrics,
        type,
      );
      const ideCompletionsEditorModelsToInsert =
        filterIdeCompletionEditorModelMetrics(newMetrics, type);
      const ideCompletionsEditorModelLanguagesToInsert =
        filterIdeCompletionEditorModelLanguageMetrics(newMetrics, type);
      const ideChats = filterIdeChatMetrics(newMetrics, type);
      const ideChatEditors = filterIdeEditorMetrics(newMetrics, type);
      const ideChatEditorModels = filterIdeChatEditorModelMetrics(
        newMetrics,
        type,
      );

      await batchInsertInChunks(coPilotMetrics, 30, async chunk => {
        await db.batchInsertMetrics(chunk);
      });

      await batchInsertInChunks(ideCompletionsToInsert, 30, async chunk => {
        await db.batchInsertIdeCompletions(chunk);
      });

      await batchInsertInChunks(
        ideCompletionsLanguagesToInsert,
        30,
        async chunk => {
          await db.batchInsertIdeCompletionsLanguages(chunk);
        },
      );

      await batchInsertInChunks(
        ideCompletionsEditorsToInsert,
        30,
        async chunk => {
          await db.batchInsertIdeCompletionsEditors(chunk);
        },
      );

      await batchInsertInChunks(
        ideCompletionsEditorModelsToInsert,
        30,
        async chunk => {
          await db.batchInsertIdeCompletionsEditorModels(chunk);
        },
      );

      await batchInsertInChunks(
        ideCompletionsEditorModelLanguagesToInsert,
        30,
        async chunk => {
          await db.batchInsertIdeCompletionsEditorModelLanguages(chunk);
        },
      );

      await batchInsertInChunks(ideChats, 30, async chunk => {
        await db.batchInsertIdeChats(chunk);
      });

      await batchInsertInChunks(ideChatEditors, 30, async chunk => {
        await db.batchInsertIdeChatEditors(chunk);
      });

      await batchInsertInChunks(ideChatEditorModels, 30, async chunk => {
        await db.batchInsertIdeChatEditorModels(chunk);
      });

      const seats = await api.fetchEnterpriseSeats();
      const seatsToInsert = convertToSeatAnalysis(seats, type);
      await db.insertSeatAnalysys(seatsToInsert);

      logger.info(
        '[discoverEnterpriseMetrics] Inserted new metrics into the database',
      );
    } else {
      logger.info('[discoverEnterpriseMetrics] No new metrics found to insert');
    }
  } catch (error) {
    logger.error(
      '[discoverEnterpriseMetrics] An error occurred while processing Github Copilot metrics',
      error,
    );
    throw error;
  }
}
