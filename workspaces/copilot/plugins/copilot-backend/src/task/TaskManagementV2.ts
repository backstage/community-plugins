/*
 * Copyright 2026 The Backstage Authors
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

import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { DateTime } from 'luxon';
import { V2UserMetricRow } from '@backstage-community/plugin-copilot-common';
import { DatabaseHandlerV2 } from '../db/DatabaseHandlerV2';
import { GithubClientV2 } from '../client/GithubClientV2';
import {
  parseEnterpriseDocument,
  parseOrganizationDocument,
  parseUserDocument,
  parseUserTeamsDocument,
  UserBreakdownData,
} from '../utils/reportParser';
import { aggregateTeamMetrics } from '../utils/teamAggregator';

type MetricsScope = 'enterprise' | 'organization';

type IngestSource = 'scheduled' | 'backfill';

type IngestContext = {
  ingestTeams: boolean;
  source: IngestSource;
};

export type TaskManagementV2Options = {
  db: DatabaseHandlerV2;
  api: GithubClientV2;
  config: Config;
  logger: LoggerService;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runBackfill(
  options: TaskManagementV2Options,
  fromDate: string,
  toDate: string,
  metricsType: MetricsScope,
  entityId: string,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const task = TaskManagementV2.create(options);
  await task.runBackfill(fromDate, toDate, metricsType, entityId);
}

export class TaskManagementV2 {
  static create(options: TaskManagementV2Options): TaskManagementV2 {
    return new TaskManagementV2(options);
  }

  private constructor(private readonly options: TaskManagementV2Options) {}

  async runAsync(): Promise<void> {
    const { config, logger } = this.options;
    const enterprise = config.getOptionalString('copilot.enterprise');
    const organization = config.getOptionalString('copilot.organization');
    const backfillFromDate =
      config.getOptionalString('copilot.backfillFromDate') ?? '2025-10-10';
    const backfillDelayMs =
      config.getOptionalNumber('copilot.backfillDelayMs') ?? 200;
    const ingestTeams =
      config.getOptionalBoolean('copilot.ingestTeams') ?? false;

    const yesterday = DateTime.utc().minus({ days: 1 }).toISODate();
    if (!yesterday) {
      logger.error('[TaskManagementV2] Unable to compute yesterday date.');
      return;
    }

    const entities: Array<{ metricsType: MetricsScope; entityId: string }> = [];

    if (enterprise) {
      entities.push({ metricsType: 'enterprise', entityId: enterprise });
    }
    if (organization) {
      entities.push({ metricsType: 'organization', entityId: organization });
    }

    if (!entities.length) {
      logger.info(
        '[TaskManagementV2] No enterprise or organization configured, skipping run.',
      );
      return;
    }

    logger.info(
      `[TaskManagementV2] Starting gap-fill ingestion from ${backfillFromDate} to ${yesterday} for ${entities.length} entities.`,
    );

    for (const entity of entities) {
      const missingDays = await this.options.db.getMissingDays(
        entity.metricsType,
        entity.entityId,
        backfillFromDate,
        yesterday,
      );

      if (!missingDays.length) {
        logger.info(
          `[TaskManagementV2] No missing days for ${entity.metricsType}:${entity.entityId}.`,
        );
        continue;
      }

      logger.info(
        `[TaskManagementV2] Found ${missingDays.length} missing days for ${entity.metricsType}:${entity.entityId}.`,
      );

      for (const day of missingDays) {
        await this.ingestDay(day, entity.metricsType, entity.entityId, {
          ingestTeams,
          source: 'scheduled',
        });

        if (backfillDelayMs > 0) {
          await delay(backfillDelayMs);
        }
      }
    }

    logger.info('[TaskManagementV2] Completed gap-fill ingestion run.');
  }

  async runBackfill(
    fromDate: string,
    toDate: string,
    metricsType: MetricsScope,
    entityId: string,
  ): Promise<void> {
    const ingestTeams =
      this.options.config.getOptionalBoolean('copilot.ingestTeams') ?? false;
    const backfillDelayMs =
      this.options.config.getOptionalNumber('copilot.backfillDelayMs') ?? 200;

    const missingDays = await this.options.db.getMissingDays(
      metricsType,
      entityId,
      fromDate,
      toDate,
    );

    if (!missingDays.length) {
      this.options.logger.info(
        `[TaskManagementV2] No missing days for backfill ${metricsType}:${entityId} in range ${fromDate}..${toDate}.`,
      );
      return;
    }

    this.options.logger.info(
      `[TaskManagementV2] Backfill processing ${missingDays.length} days for ${metricsType}:${entityId}.`,
    );

    for (const day of missingDays) {
      await this.ingestDay(day, metricsType, entityId, {
        ingestTeams,
        source: 'backfill',
      });

      if (backfillDelayMs > 0) {
        await delay(backfillDelayMs);
      }
    }
  }

  private async ingestDay(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    context: IngestContext,
  ): Promise<void> {
    const { api, db, logger } = this.options;
    const componentsLoaded: string[] = [];
    let userMetrics: V2UserMetricRow[] = [];
    let userBreakdowns: UserBreakdownData[] = [];

    try {
      const reportEnvelope =
        metricsType === 'enterprise'
          ? await api.fetchEnterpriseReportLinks(day)
          : await api.fetchOrganizationReportLinks(day);

      const totalLinks = reportEnvelope.download_links ?? [];
      if (totalLinks.length === 0) {
        logger.warn(
          `[TaskManagementV2] No download links for ${metricsType} totals on ${day} — report data may not yet be available for this period.`,
        );
      } else {
        for (const url of totalLinks) {
          const document = await api.downloadDocument(url);
          const parsed =
            metricsType === 'organization'
              ? parseOrganizationDocument(document, metricsType, entityId)
              : parseEnterpriseDocument(document, metricsType, entityId);

          await db.insertDailyTotals(parsed.dailyTotals);
          await db.insertPrMetrics(parsed.prMetrics);
          await db.insertByFeature(parsed.byFeature);
          await db.insertByIde(parsed.byIde);
          await db.insertByLanguageFeature(parsed.byLanguageFeature);
          await db.insertByModelFeature(parsed.byModelFeature);
          await db.insertByLanguageModel(parsed.byLanguageModel);
          await db.insertByCli(parsed.byCli);
        }
        componentsLoaded.push('totals');
      }

      if (context.ingestTeams) {
        const userReportEnvelope =
          metricsType === 'enterprise'
            ? await api.fetchEnterpriseUserReportLinks(day)
            : await api.fetchOrganizationUserReportLinks(day);

        userMetrics = [];
        userBreakdowns = [];
        const userLinks = userReportEnvelope.download_links ?? [];
        if (userLinks.length === 0) {
          logger.warn(
            `[TaskManagementV2] No download links for ${metricsType} users on ${day} — user metrics will be skipped.`,
          );
        } else {
          for (const url of userLinks) {
            const rows = await api.downloadNdjsonDocument(url);
            const parsed = parseUserDocument(rows, metricsType, entityId);
            userMetrics.push(...parsed.userMetrics);
            userBreakdowns.push(...parsed.userBreakdowns);
          }
        }

        await db.insertUserMetrics(userMetrics);
        componentsLoaded.push('users');
      }

      const userTeamsEnvelope =
        metricsType === 'enterprise'
          ? await api.fetchEnterpriseUserTeamsLinks(day)
          : await api.fetchOrganizationUserTeamsLinks(day);

      const userTeams: ReturnType<typeof parseUserTeamsDocument> = [];
      const userTeamLinks = userTeamsEnvelope.download_links ?? [];
      if (userTeamLinks.length === 0) {
        logger.warn(
          `[TaskManagementV2] No download links for ${metricsType} user-teams on ${day} — team aggregation will be skipped.`,
        );
      } else {
        for (const url of userTeamLinks) {
          const rows = await api.downloadNdjsonDocument(url);
          userTeams.push(
            ...parseUserTeamsDocument(rows, metricsType, entityId),
          );
        }
      }

      await db.insertUserTeams(userTeams);

      const teamAggregates = aggregateTeamMetrics(
        userMetrics,
        userTeams,
        userBreakdowns,
        day,
        metricsType,
        entityId,
      );

      await db.insertDailyTotals(teamAggregates.dailyTotals);
      await db.insertByFeature(teamAggregates.byFeature);
      await db.insertByIde(teamAggregates.byIde);
      await db.insertByLanguageFeature(teamAggregates.byLanguageFeature);
      await db.insertByModelFeature(teamAggregates.byModelFeature);
      await db.insertByLanguageModel(teamAggregates.byLanguageModel);

      componentsLoaded.push('teams');

      await db.upsertIngestionLog({
        day,
        metrics_type: metricsType,
        entity_id: entityId,
        status: 'success',
        components_loaded: JSON.stringify(componentsLoaded),
        source: context.source,
      });

      logger.info(
        `[TaskManagementV2] Ingested ${metricsType}:${entityId} for ${day} (source=${
          context.source
        }, components=${componentsLoaded.join(',')}).`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        `[TaskManagementV2] Failed ingest for ${metricsType}:${entityId} on ${day}.`,
        error,
      );

      await db.upsertIngestionLog({
        day,
        metrics_type: metricsType,
        entity_id: entityId,
        status: 'error',
        components_loaded: JSON.stringify(componentsLoaded),
        error_message: message,
        source: context.source,
      });
    }
  }
}
