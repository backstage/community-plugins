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
  convertToTeamSeatAnalysis,
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

export async function discoverOrganizationTeamMetrics({
  api,
  logger,
  db,
  config,
}: TaskOptions): Promise<void> {
  if (!config.getOptionalString('copilot.organization')) {
    logger.info(
      '[discoverOrganizationTeamMetrics] Skipping: Organization configuration not found.',
    );
    return;
  }

  const type: MetricsType = 'organization';

  try {
    const teams = await api.fetchOrganizationTeams();
    logger.info(
      `[discoverOrganizationTeamMetrics] Fetched ${teams.length} teams`,
    );

    // Fetch seat analysis
    const seats = await api.fetchOrganizationSeats();
    logger.info(
      `[discoverOrganizationTeamMetrics] Fetched ${seats.seats.length} seats from organization`,
    );

    for (const team of teams) {
      try {
        logger.info(
          `[discoverOrganizationTeamMetrics] Fetching metrics for team: ${team.slug}`,
        );

        const copilotMetrics = await api.fetchOrganizationTeamCopilotMetrics(
          team.slug,
        );

        const lastDay = await db.getMostRecentDayFromMetricsV2(type, team.slug);
        logger.info(
          `[discoverOrganizationTeamMetrics] Found last day: ${lastDay}`,
        );

        const newMetrics: CopilotMetrics[] = filterNewMetricsV2(
          copilotMetrics,
          lastDay,
        );
        logger.info(
          `[discoverOrganizationTeamMetrics] Found ${newMetrics.length} new metrics to insert for team: ${team.slug}`,
        );

        if (newMetrics.length > 0) {
          const coPilotMetrics = filterBaseMetrics(newMetrics, type, team.slug);
          const ideCompletionsToInsert = filterIdeCompletionMetrics(
            newMetrics,
            type,
            team.slug,
          );
          const ideCompletionsLanguagesToInsert =
            filterIdeCompletionLanguageMetrics(newMetrics, type, team.slug);
          const ideCompletionsEditorsToInsert =
            filterIdeCompletionEditorMetrics(newMetrics, type, team.slug);
          const ideCompletionsEditorModelsToInsert =
            filterIdeCompletionEditorModelMetrics(newMetrics, type, team.slug);
          const ideCompletionsEditorModelLanguagesToInsert =
            filterIdeCompletionEditorModelLanguageMetrics(
              newMetrics,
              type,
              team.slug,
            );
          const ideChats = filterIdeChatMetrics(newMetrics, type, team.slug);
          const ideChatEditors = filterIdeEditorMetrics(
            newMetrics,
            type,
            team.slug,
          );
          const ideChatEditorModels = filterIdeChatEditorModelMetrics(
            newMetrics,
            type,
            team.slug,
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

          const seatsToInsert = convertToTeamSeatAnalysis(
            seats,
            type,
            team.slug,
          );
          await db.insertSeatAnalysys(seatsToInsert);

          logger.info(
            `[discoverOrganizationTeamMetrics] Inserted new metrics into the database for team: ${team.slug}`,
          );
        } else {
          logger.info(
            `[discoverOrganizationTeamMetrics] No new metrics found to insert for team: ${team.slug}`,
          );
        }
      } catch (error) {
        logger.error(
          `[discoverOrganizationTeamMetrics] Error processing metrics for team ${team.slug}`,
          error,
        );
      }
    }
  } catch (error) {
    logger.error(
      '[discoverOrganizationTeamMetrics] Error fetching teams',
      error,
    );
    throw error;
  }
}
