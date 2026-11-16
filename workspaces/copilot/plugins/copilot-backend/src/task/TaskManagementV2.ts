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
import { randomUUID } from 'node:crypto';
import { DateTime } from 'luxon';
import {
  MetricsScope,
  V2UserTeamRow,
  V2UserCostCenterRow,
  V2UserMetricRow,
} from '@backstage-community/plugin-copilot-common';
import {
  DatabaseHandlerV2,
  parseComponentsLoaded,
} from '../db/DatabaseHandlerV2';
import { GithubClientV2 } from '../client/GithubClientV2';
import {
  InaccessibleEnterpriseOrganizationError,
  type CostCenterMembershipSnapshot,
} from '../client/GithubClientV2';
import {
  parseEnterpriseDocument,
  parseOrganizationDocument,
  parseUserDocument,
  parseUserTeamsDocument,
  UserBreakdownData,
} from '../utils/reportParser';
import type {
  ParsedEnterpriseDocument,
  ParsedUserDocument,
} from '../utils/reportParser';
import {
  aggregateCostCenterMetrics,
  aggregateTeamMetrics,
} from '../utils/teamAggregator';
import { buildUserBreakdownRows } from '../utils/userBreakdownRows';

type IngestSource = 'scheduled' | 'backfill';

type IngestContext = {
  ingestTeams: boolean;
  ingestUsers: boolean;
  ingestCostCenters: boolean;
  source: IngestSource;
};

type IngestPlan = {
  entity: { metricsType: MetricsScope; entityId: string };
  missingDays: string[];
  missingCostCenterDays: string[];
  incompleteCostCenterDays: string[];
  ingestUsers: boolean;
  ingestTeams: boolean;
  ingestCostCenters: boolean;
};

export type TaskManagementV2Options = {
  db: DatabaseHandlerV2;
  api: GithubClientV2;
  config: Config;
  logger: LoggerService;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const GITHUB_REPORTS_EARLIEST_DATE = '2025-10-10';
const ORGANIZATION_TEAM_BOOTSTRAP_DAYS = 30;
const ORGANIZATION_TEAM_MAX_ORGANIZATIONS_PER_RUN = 6;
const ORGANIZATION_TEAM_MAX_BACKLOG_DAYS_PER_RUN = 3;
const ORGANIZATION_TEAM_REFETCH_DAYS = 3;
const ORGANIZATION_TEAM_LEASE_MINUTES = 10;
const ORGANIZATION_PERMISSIONS_DOCS_URL =
  'https://github.com/backstage/community-plugins/blob/main/workspaces/copilot/plugins/copilot-backend/README.md#required-github-permissions';

function getRequiredComponents(
  ingestUsers: boolean,
  ingestTeams: boolean,
): string[] {
  const components = ['totals'];
  if (ingestUsers) {
    components.push('users');
  }
  if (ingestTeams) {
    components.push('teams');
  }
  return components;
}

function getReportWindowStartDate(now = DateTime.utc()): string {
  const rollingStart = now
    .toUTC()
    .startOf('day')
    .minus({ years: 1 })
    .toISODate();
  return rollingStart > GITHUB_REPORTS_EARLIEST_DATE
    ? rollingStart
    : GITHUB_REPORTS_EARLIEST_DATE;
}

function getHttpStatus(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof error.status === 'number'
  ) {
    return error.status;
  }
  return undefined;
}

function logOrganizationMetricsPermissionError(
  logger: LoggerService,
  report: 'per-user' | 'user-teams',
  day: string,
  error: unknown,
): boolean {
  const status = getHttpStatus(error);
  if (status !== 403 && status !== 404) {
    return false;
  }

  const githubMessage = error instanceof Error ? error.message : String(error);
  logger.error(
    `[TaskManagementV2] GitHub returned HTTP ${status} for the organization ${report} report on ${day}: ${githubMessage}. This is likely due to missing permissions. The GitHub App needs Organization Copilot metrics: read on the organization. Classic PATs need read:org for organization reports; enterprise reports use manage_billing:copilot or read:enterprise. See ${ORGANIZATION_PERMISSIONS_DOCS_URL}`,
    error instanceof Error ? error : { status, message: githubMessage },
  );
  return true;
}

function uniqueDays(...dayLists: string[][]): string[] {
  return [...new Set(dayLists.flat())].sort();
}

function isSupportedCostCenterScope(
  metricsType: MetricsScope,
  entityId: string,
  enterprise?: string,
  organization?: string,
): boolean {
  if (metricsType === 'enterprise') {
    return Boolean(enterprise && entityId === enterprise);
  }
  return Boolean(enterprise && organization && entityId === organization);
}

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
    const { config, db, logger } = this.options;
    const enterprise = config.getOptionalString('copilot.enterprise');
    const organization = config.getOptionalString('copilot.organization');
    const backfillFromDate =
      config.getOptionalString('copilot.backfillFromDate') ?? '2025-10-10';
    const backfillDelayMs =
      config.getOptionalNumber('copilot.backfillDelayMs') ?? 200;
    const ingestTeams =
      config.getOptionalBoolean('copilot.ingestTeams') ?? false;
    const ingestCostCenters =
      config.getOptionalBoolean('copilot.ingestCostCenters') ?? false;
    const ingestOrganizationTeamReports =
      config.getOptionalBoolean('copilot.ingestOrganizationTeamReports') ??
      false;

    if (ingestCostCenters && !enterprise) {
      logger.warn(
        '[TaskManagementV2] copilot.ingestCostCenters is enabled, but copilot.enterprise is not configured; skipping cost-center ingestion.',
      );
    }

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

    const plans: IngestPlan[] = [];
    const reportWindowStartDate = getReportWindowStartDate();
    for (const entity of entities) {
      const costCenterEnabledForEntity =
        ingestCostCenters && Boolean(enterprise);
      const ingestTeamsForEntity =
        ingestTeams ||
        (ingestOrganizationTeamReports &&
          Boolean(enterprise) &&
          entity.metricsType === 'organization');
      const ingestUsers = ingestTeamsForEntity || costCenterEnabledForEntity;
      const requiredComponents = getRequiredComponents(
        ingestUsers,
        ingestTeamsForEntity,
      );
      const missingFromDate =
        ingestUsers && backfillFromDate < reportWindowStartDate
          ? reportWindowStartDate
          : backfillFromDate;
      if (missingFromDate !== backfillFromDate) {
        logger.info(
          `[TaskManagementV2] Limiting ${entity.metricsType} user, team, and cost-center backfill to GitHub's report window starting ${missingFromDate}.`,
        );
      }
      const { missingDays } = await this.getMissingIngestionDays(
        entity.metricsType,
        entity.entityId,
        backfillFromDate,
        missingFromDate,
        yesterday,
        requiredComponents,
        ingestUsers,
      );
      const missingCostCenterDays = costCenterEnabledForEntity
        ? await db.getDaysMissingCostCenterAggregation(
            entity.metricsType,
            entity.entityId,
            missingFromDate,
            yesterday,
          )
        : [];
      const incompleteCostCenterDays = costCenterEnabledForEntity
        ? await db.getDaysWithIncompleteCostCenterAggregation(
            entity.metricsType,
            entity.entityId,
            missingFromDate,
            yesterday,
          )
        : [];

      if (!missingDays.length) {
        logger.info(
          `[TaskManagementV2] No missing ingestion days for ${entity.metricsType}:${entity.entityId}.`,
        );
      } else {
        logger.info(
          `[TaskManagementV2] Found ${missingDays.length} missing days for ${entity.metricsType}:${entity.entityId}.`,
        );
      }

      plans.push({
        entity,
        missingDays,
        missingCostCenterDays,
        incompleteCostCenterDays,
        ingestUsers,
        ingestTeams: ingestTeamsForEntity,
        ingestCostCenters: costCenterEnabledForEntity,
      });
    }

    const costCenterPlans = plans.filter(
      plan =>
        plan.ingestCostCenters &&
        (plan.missingDays.some(day => day >= reportWindowStartDate) ||
          plan.missingCostCenterDays.some(
            day => day >= reportWindowStartDate,
          ) ||
          plan.incompleteCostCenterDays.some(
            day => day >= reportWindowStartDate,
          )),
    );
    const costCenterDays = uniqueDays(
      ...costCenterPlans.map(plan => [
        ...plan.missingDays.filter(day => day >= reportWindowStartDate),
        ...plan.missingCostCenterDays.filter(
          day => day >= reportWindowStartDate,
        ),
        ...plan.incompleteCostCenterDays.filter(
          day => day >= reportWindowStartDate,
        ),
      ]),
    );
    let costCenterSnapshot: CostCenterMembershipSnapshot | undefined;
    if (costCenterDays.length) {
      try {
        costCenterSnapshot = await this.loadCostCenterSnapshot(
          costCenterPlans.map(plan => plan.entity),
        );
      } catch (error) {
        logger.error(
          `[TaskManagementV2] Failed to load cost-center membership for enterprise:${enterprise}; cost-center days will be retried.`,
          error,
        );
      }
    }

    for (const plan of plans) {
      const loadedUserReportDays = new Set<string>();
      const refreshedUserReportDays = new Set<string>();
      for (const day of plan.missingDays) {
        const userReport = await this.ingestDay(
          day,
          plan.entity.metricsType,
          plan.entity.entityId,
          {
            ingestTeams: plan.ingestTeams && day >= reportWindowStartDate,
            ingestUsers: plan.ingestUsers && day >= reportWindowStartDate,
            ingestCostCenters: plan.ingestCostCenters,
            source: 'scheduled',
          },
        );
        if (userReport.loaded) {
          loadedUserReportDays.add(day);
        }
        if (userReport.refreshed) {
          refreshedUserReportDays.add(day);
        }

        if (backfillDelayMs > 0) {
          await delay(backfillDelayMs);
        }
      }

      if (!costCenterSnapshot?.complete || !plan.ingestCostCenters) {
        continue;
      }

      const retryIncompleteDays = costCenterSnapshot.unassignedComplete
        ? plan.incompleteCostCenterDays
        : [];
      const daysToAggregate = uniqueDays(
        [...refreshedUserReportDays].filter(
          day => day >= reportWindowStartDate,
        ),
        plan.missingCostCenterDays.filter(day => day >= reportWindowStartDate),
        retryIncompleteDays.filter(day => day >= reportWindowStartDate),
      );
      for (const day of daysToAggregate) {
        if (plan.missingDays.includes(day) && !loadedUserReportDays.has(day)) {
          continue;
        }
        try {
          await this.ingestCostCenterAggregates(
            day,
            plan.entity.metricsType,
            plan.entity.entityId,
            costCenterSnapshot,
            plan.missingCostCenterDays.includes(day) ||
              retryIncompleteDays.includes(day) ||
              loadedUserReportDays.has(day),
          );
        } catch (error) {
          logger.error(
            `[TaskManagementV2] Failed cost-center aggregation for ${plan.entity.metricsType}:${plan.entity.entityId} on ${day}; the day will be retried.`,
            error,
          );
        }
      }
    }

    if (ingestOrganizationTeamReports) {
      if (!enterprise) {
        logger.warn(
          '[TaskManagementV2] copilot.ingestOrganizationTeamReports is enabled, but copilot.enterprise is not configured; skipping multi-organization team ingestion.',
        );
      } else {
        await this.runOrganizationTeamIngestion(enterprise, organization);
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
    const { config, db, logger } = this.options;
    const ingestTeams =
      config.getOptionalBoolean('copilot.ingestTeams') ?? false;
    const ingestCostCenters =
      config.getOptionalBoolean('copilot.ingestCostCenters') ?? false;
    const ingestOrganizationTeamReports =
      config.getOptionalBoolean('copilot.ingestOrganizationTeamReports') ??
      false;
    const enterprise = config.getOptionalString('copilot.enterprise');
    const organization = config.getOptionalString('copilot.organization');
    const ingestTeamsForScope =
      ingestTeams ||
      (ingestOrganizationTeamReports &&
        Boolean(enterprise) &&
        metricsType === 'organization' &&
        entityId === organization);
    const costCenterIngestionAvailable =
      ingestCostCenters &&
      isSupportedCostCenterScope(
        metricsType,
        entityId,
        enterprise,
        organization,
      );

    if (ingestCostCenters && !enterprise) {
      logger.warn(
        '[TaskManagementV2] copilot.ingestCostCenters is enabled, but copilot.enterprise is not configured; skipping cost-center ingestion.',
      );
    } else if (
      ingestCostCenters &&
      metricsType === 'organization' &&
      !costCenterIngestionAvailable
    ) {
      logger.warn(
        `[TaskManagementV2] Organization cost-center ingestion requires copilot.enterprise and the configured copilot.organization; skipping cost-center ingestion for organization:${entityId}.`,
      );
    }

    const ingestUsers = ingestTeamsForScope || costCenterIngestionAvailable;
    const backfillDelayMs =
      config.getOptionalNumber('copilot.backfillDelayMs') ?? 200;
    const requiredComponents = getRequiredComponents(
      ingestUsers,
      ingestTeamsForScope,
    );
    const reportWindowStartDate = getReportWindowStartDate();
    const missingFromDate =
      ingestUsers && fromDate < reportWindowStartDate
        ? reportWindowStartDate
        : fromDate;
    if (missingFromDate !== fromDate) {
      logger.info(
        `[TaskManagementV2] Limiting user, team, and cost-center backfill to GitHub's report window starting ${missingFromDate}.`,
      );
    }

    const { missingDays } = await this.getMissingIngestionDays(
      metricsType,
      entityId,
      fromDate,
      missingFromDate,
      toDate,
      requiredComponents,
      ingestUsers,
    );
    const missingCostCenterDays = costCenterIngestionAvailable
      ? await db.getDaysMissingCostCenterAggregation(
          metricsType,
          entityId,
          missingFromDate,
          toDate,
        )
      : [];
    const incompleteCostCenterDays = costCenterIngestionAvailable
      ? await db.getDaysWithIncompleteCostCenterAggregation(
          metricsType,
          entityId,
          missingFromDate,
          toDate,
        )
      : [];
    const costCenterDays = uniqueDays(
      missingDays.filter(day => day >= reportWindowStartDate),
      missingCostCenterDays.filter(day => day >= reportWindowStartDate),
      incompleteCostCenterDays.filter(day => day >= reportWindowStartDate),
    );

    if (
      !missingDays.length &&
      !missingCostCenterDays.length &&
      !incompleteCostCenterDays.length
    ) {
      logger.info(
        `[TaskManagementV2] No missing days for backfill ${metricsType}:${entityId} in range ${fromDate}..${toDate}.`,
      );
      return;
    }

    if (missingDays.length) {
      logger.info(
        `[TaskManagementV2] Backfill processing ${missingDays.length} days for ${metricsType}:${entityId}.`,
      );
    }

    let costCenterSnapshot: CostCenterMembershipSnapshot | undefined;
    if (costCenterIngestionAvailable && costCenterDays.length) {
      try {
        costCenterSnapshot = await this.loadCostCenterSnapshot([
          { metricsType, entityId },
        ]);
      } catch (error) {
        logger.error(
          `[TaskManagementV2] Failed to load cost-center membership for enterprise:${enterprise}; cost-center days will be retried.`,
          error,
        );
      }
    }

    const loadedUserReportDays = new Set<string>();
    const refreshedUserReportDays = new Set<string>();
    for (const day of missingDays) {
      const userReport = await this.ingestDay(day, metricsType, entityId, {
        ingestTeams: ingestTeamsForScope && day >= reportWindowStartDate,
        ingestUsers: ingestUsers && day >= reportWindowStartDate,
        ingestCostCenters: costCenterIngestionAvailable,
        source: 'backfill',
      });
      if (userReport.loaded) {
        loadedUserReportDays.add(day);
      }
      if (userReport.refreshed) {
        refreshedUserReportDays.add(day);
      }

      if (backfillDelayMs > 0) {
        await delay(backfillDelayMs);
      }
    }

    if (!costCenterSnapshot?.complete) {
      return;
    }

    const retryIncompleteDays = costCenterSnapshot.unassignedComplete
      ? incompleteCostCenterDays
      : [];
    for (const day of costCenterDays) {
      if (
        incompleteCostCenterDays.includes(day) &&
        !missingCostCenterDays.includes(day) &&
        !retryIncompleteDays.includes(day)
      ) {
        continue;
      }
      if (missingDays.includes(day) && !loadedUserReportDays.has(day)) {
        continue;
      }
      if (
        !missingCostCenterDays.includes(day) &&
        !retryIncompleteDays.includes(day) &&
        !refreshedUserReportDays.has(day)
      ) {
        continue;
      }

      try {
        await this.ingestCostCenterAggregates(
          day,
          metricsType,
          entityId,
          costCenterSnapshot,
          missingCostCenterDays.includes(day) ||
            retryIncompleteDays.includes(day) ||
            loadedUserReportDays.has(day),
        );
      } catch (error) {
        logger.error(
          `[TaskManagementV2] Failed cost-center aggregation for ${metricsType}:${entityId} on ${day}; the day will be retried.`,
          error,
        );
      }
    }
  }

  private async getMissingIngestionDays(
    metricsType: MetricsScope,
    entityId: string,
    configuredFromDate: string,
    reportFromDate: string,
    toDate: string,
    requiredComponents: string[],
    ingestUsers: boolean,
  ): Promise<{ missingDays: string[] }> {
    const missingDays = await this.options.db.getMissingDays(
      metricsType,
      entityId,
      reportFromDate,
      toDate,
      requiredComponents,
    );

    if (!ingestUsers || reportFromDate === configuredFromDate) {
      return { missingDays };
    }

    const missingTotalsDays = await this.options.db.getMissingDays(
      metricsType,
      entityId,
      configuredFromDate,
      toDate,
      ['totals'],
    );

    return {
      missingDays: uniqueDays(missingTotalsDays, missingDays),
    };
  }

  private async loadCostCenterSnapshot(
    entities: Array<{ metricsType: MetricsScope; entityId: string }>,
  ): Promise<CostCenterMembershipSnapshot> {
    const { api, db, logger } = this.options;
    // GithubClientV2 logs the warnings as it builds the snapshot.
    const snapshot = await api.fetchCostCenterMemberships();

    if (!snapshot.complete) {
      logger.warn(
        '[TaskManagementV2] Cost-center membership snapshot is incomplete; preserving existing membership and aggregate data and retrying on the next run.',
      );
      return snapshot;
    }

    for (const entity of entities) {
      await db.upsertCostCenters(
        snapshot.costCenters.map(costCenter => ({
          metrics_type: entity.metricsType,
          entity_id: entity.entityId,
          cost_center_id: costCenter.id,
          name: costCenter.name,
        })),
      );
    }

    return snapshot;
  }

  private async ingestTotals(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
  ): Promise<boolean> {
    const { api, db, logger } = this.options;
    const reportEnvelope =
      metricsType === 'enterprise'
        ? await api.fetchEnterpriseReportLinks(day)
        : await api.fetchOrganizationReportLinks(day);

    const totalLinks = reportEnvelope.download_links ?? [];
    if (totalLinks.length === 0) {
      logger.warn(
        `[TaskManagementV2] No download links for ${metricsType} totals on ${day} — report data may not yet be available for this period.`,
      );
      return false;
    }

    let totalRowsParsed = 0;

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
      await db.insertByVscodeAgent(parsed.byVscodeAgent);
      await db.insertCustomizationMetrics(parsed.customizationMetrics);
      await db.insertCustomizationSummaries(parsed.customizationSummaries);

      totalRowsParsed += parsed.dailyTotals.length;
    }

    if (totalRowsParsed === 0) {
      logger.warn(
        `[TaskManagementV2] Parsed 0 daily rows for ${metricsType} totals on ${day} — not marking as success.`,
      );
      return false;
    }

    return true;
  }

  private async ingestUserReports(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
  ): Promise<{
    loaded: boolean;
    userMetrics: V2UserMetricRow[];
    userBreakdowns: UserBreakdownData[];
  }> {
    const { api, db, logger } = this.options;
    let userReportEnvelope: Awaited<
      ReturnType<GithubClientV2['fetchEnterpriseUserReportLinks']>
    >;
    try {
      userReportEnvelope =
        metricsType === 'enterprise'
          ? await api.fetchEnterpriseUserReportLinks(day)
          : await api.fetchOrganizationUserReportLinks(day);
    } catch (error) {
      if (
        metricsType === 'organization' &&
        logOrganizationMetricsPermissionError(logger, 'per-user', day, error)
      ) {
        return { loaded: false, userMetrics: [], userBreakdowns: [] };
      }
      throw error;
    }

    const userLinks = userReportEnvelope.download_links ?? [];
    if (userLinks.length === 0) {
      logger.warn(
        `[TaskManagementV2] No download links for ${metricsType} users on ${day} — user metrics will be skipped.`,
      );
      return { loaded: false, userMetrics: [], userBreakdowns: [] };
    }

    const userMetrics: V2UserMetricRow[] = [];
    const userBreakdowns: UserBreakdownData[] = [];

    for (const url of userLinks) {
      const rows = await api.downloadNdjsonDocument(url);
      const parsed = parseUserDocument(rows, metricsType, entityId);
      userMetrics.push(...parsed.userMetrics);
      userBreakdowns.push(...parsed.userBreakdowns);
      await db.insertCustomizationMetrics(parsed.customizationMetrics);
      await db.insertCustomizationSummaries(parsed.customizationSummaries);
    }

    await db.insertUserMetrics(userMetrics);

    const breakdownRows = buildUserBreakdownRows(
      userBreakdowns,
      day,
      metricsType,
      entityId,
    );
    await db.insertUserMetricsByFeature(breakdownRows.byFeature);
    await db.insertUserMetricsByIde(breakdownRows.byIde);
    await db.insertUserMetricsByLanguageFeature(
      breakdownRows.byLanguageFeature,
    );
    await db.insertUserMetricsByModelFeature(breakdownRows.byModelFeature);
    await db.insertUserMetricsByLanguageModel(breakdownRows.byLanguageModel);

    return { loaded: true, userMetrics, userBreakdowns };
  }

  private async ingestTeamAggregates(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    userMetrics: V2UserMetricRow[],
    userBreakdowns: UserBreakdownData[],
    userReportLoaded: boolean,
  ): Promise<boolean> {
    const { api, db, logger } = this.options;
    let userTeamsEnvelope: Awaited<
      ReturnType<GithubClientV2['fetchEnterpriseUserTeamsLinks']>
    >;
    try {
      userTeamsEnvelope =
        metricsType === 'enterprise'
          ? await api.fetchEnterpriseUserTeamsLinks(day)
          : await api.fetchOrganizationUserTeamsLinks(day);
    } catch (error) {
      if (
        metricsType === 'organization' &&
        logOrganizationMetricsPermissionError(logger, 'user-teams', day, error)
      ) {
        return false;
      }
      throw error;
    }
    const userTeamLinks = userTeamsEnvelope.download_links ?? [];
    if (userTeamLinks.length === 0) {
      logger.warn(
        `[TaskManagementV2] No download links for ${metricsType} user-teams on ${day} — team aggregation will be skipped.`,
      );
      return false;
    }

    if (!userReportLoaded) {
      logger.warn(
        `[TaskManagementV2] Skipping ${metricsType} team aggregation for ${day} because the per-user report was not loaded.`,
      );
      return false;
    }

    const userTeams: V2UserTeamRow[] = [];
    for (const url of userTeamLinks) {
      const rows = await api.downloadNdjsonDocument(url);
      userTeams.push(...parseUserTeamsDocument(rows, metricsType, entityId));
    }

    const teamAggregates = aggregateTeamMetrics(
      userMetrics,
      userTeams,
      userBreakdowns,
      day,
      metricsType,
      entityId,
    );

    await db.replaceTeamAggregates(
      day,
      metricsType,
      entityId,
      userTeams,
      teamAggregates,
    );

    return userMetrics.length > 0;
  }

  private async ingestCostCenterAggregates(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    snapshot: CostCenterMembershipSnapshot,
    markEmptyDay: boolean,
  ): Promise<boolean> {
    const { db } = this.options;
    let userMetrics = await db.getUserMetricsForDay(metricsType, entityId, day);

    if (!userMetrics.length && !markEmptyDay) {
      return false;
    }

    let userBreakdowns = userMetrics.length
      ? await db.getUserBreakdownsForDay(metricsType, entityId, day)
      : [];
    // Legacy successful ingestion logs can predate persisted user breakdowns.
    if (userMetrics.length > 0 && userBreakdowns.length === 0) {
      const report = await this.ingestUserReports(day, metricsType, entityId);
      if (!report.loaded || report.userBreakdowns.length === 0) {
        return false;
      }
      userMetrics = await db.getUserMetricsForDay(metricsType, entityId, day);
      userBreakdowns = report.userBreakdowns;
    }

    const memberships = new Map<number, string>();
    const userCostCentersByUserId = new Map<number, V2UserCostCenterRow>();
    for (const metric of userMetrics) {
      const membership = snapshot.members.get(metric.user_id);
      if (!membership) {
        continue;
      }
      memberships.set(metric.user_id, membership.costCenterId);

      userCostCentersByUserId.set(metric.user_id, {
        day,
        metrics_type: metricsType,
        entity_id: entityId,
        user_id: metric.user_id,
        user_login: membership.login,
        cost_center_id: membership.costCenterId,
      });
    }
    const userCostCenters = [...userCostCentersByUserId.values()];

    const aggregates = aggregateCostCenterMetrics(
      userMetrics,
      userBreakdowns,
      memberships,
      day,
      metricsType,
      entityId,
      snapshot.unassignedComplete,
    );

    await db.replaceCostCenterAggregates(
      day,
      metricsType,
      entityId,
      userCostCenters,
      {
        dailyTotals: aggregates.dailyTotals,
        prMetrics: [],
        byFeature: aggregates.byFeature,
        byIde: aggregates.byIde,
        byLanguageFeature: aggregates.byLanguageFeature,
        byModelFeature: aggregates.byModelFeature,
        byLanguageModel: aggregates.byLanguageModel,
        byCli: aggregates.byCli,
        byVscodeAgent: aggregates.byVscodeAgent,
        customizationMetrics: aggregates.costCenterCustomizationMetrics,
      },
      snapshot.unassignedComplete,
    );
    return true;
  }

  private async logIngestionOutcome(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    context: IngestContext,
    componentsLoaded: string[],
    requiredComponents: string[],
  ): Promise<void> {
    const { db, logger } = this.options;
    const missingComponents = requiredComponents.filter(
      component => !componentsLoaded.includes(component),
    );
    const status: 'success' | 'partial' =
      missingComponents.length === 0 ? 'success' : 'partial';
    const errorMessage =
      missingComponents.length > 0
        ? `Missing components: ${missingComponents.join(', ')}`
        : undefined;

    await db.upsertIngestionLog({
      day,
      metrics_type: metricsType,
      entity_id: entityId,
      status,
      components_loaded: JSON.stringify(componentsLoaded),
      error_message: errorMessage,
      source: context.source,
    });

    if (status === 'success') {
      logger.info(
        `[TaskManagementV2] Ingested ${metricsType}:${entityId} for ${day} (source=${
          context.source
        }, components=${componentsLoaded.join(',')}).`,
      );
      return;
    }

    logger.warn(
      `[TaskManagementV2] Partially ingested ${metricsType}:${entityId} for ${day} (source=${
        context.source
      }, components=${componentsLoaded.join(
        ',',
      )}, missing=${missingComponents.join(',')}).`,
    );
  }

  private async ingestDay(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    context: IngestContext,
  ): Promise<{ loaded: boolean; refreshed: boolean }> {
    const { db, logger } = this.options;
    const requiredComponents = getRequiredComponents(
      context.ingestUsers,
      context.ingestTeams,
    );
    const componentsLoaded = new Set<string>();
    let userReportsLoaded = false;
    let userReportsRefreshed = false;

    try {
      const previousLog = (
        await db.getIngestionLog(metricsType, entityId, day, day)
      )[0];
      const previouslyLoaded = new Set(
        parseComponentsLoaded(previousLog?.components_loaded),
      );
      for (const component of previouslyLoaded) {
        componentsLoaded.add(component);
      }

      if (
        !previouslyLoaded.has('totals') &&
        (await this.ingestTotals(day, metricsType, entityId))
      ) {
        componentsLoaded.add('totals');
      }

      if (context.ingestUsers) {
        const storedUserMetrics = previouslyLoaded.has('users')
          ? await db.getUserMetricsForDay(metricsType, entityId, day)
          : [];
        const storedUserBreakdowns =
          storedUserMetrics.length > 0
            ? await db.getUserBreakdownsForDay(metricsType, entityId, day)
            : [];
        // Reuse only complete stored reports; users loaded before breakdowns were persisted lack them.
        const reuseStoredReport =
          storedUserMetrics.length > 0 && storedUserBreakdowns.length > 0;
        const userReport = reuseStoredReport
          ? {
              loaded: true,
              userMetrics: storedUserMetrics,
              userBreakdowns: storedUserBreakdowns,
            }
          : await this.ingestUserReports(day, metricsType, entityId);
        userReportsLoaded = userReport.loaded;
        userReportsRefreshed = userReport.loaded && !reuseStoredReport;
        if (userReportsRefreshed && context.ingestCostCenters) {
          await db.markCostCenterAggregationPending(day, metricsType, entityId);
        }
        if (userReport.loaded) {
          componentsLoaded.add('users');
        }

        if (
          context.ingestTeams &&
          (await this.ingestTeamAggregates(
            day,
            metricsType,
            entityId,
            userReport.userMetrics,
            userReport.userBreakdowns,
            userReport.loaded,
          ))
        ) {
          componentsLoaded.add('teams');
        }
      }

      await this.logIngestionOutcome(
        day,
        metricsType,
        entityId,
        context,
        [...componentsLoaded],
        requiredComponents,
      );
      return { loaded: userReportsLoaded, refreshed: userReportsRefreshed };
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
        components_loaded: JSON.stringify([...componentsLoaded]),
        error_message: message,
        source: context.source,
      });
      return { loaded: userReportsLoaded, refreshed: userReportsRefreshed };
    }
  }

  async runOrganizationBackfill(
    organization: string,
    fromDate: string,
    toDate: string,
  ): Promise<void> {
    const { config, db, logger } = this.options;
    const backfillDelayMs =
      config.getOptionalNumber('copilot.backfillDelayMs') ?? 200;
    const enterprise = config.getOptionalString('copilot.enterprise');
    const enabled =
      config.getOptionalBoolean('copilot.ingestOrganizationTeamReports') ??
      false;
    if (!enterprise || !enabled) {
      throw new Error(
        'Organization-team backfill requires copilot.enterprise and copilot.ingestOrganizationTeamReports.',
      );
    }
    if (
      !(await db.isCurrentAccessibleEnterpriseOrganization(
        enterprise,
        organization,
      ))
    ) {
      throw new Error('Organization is not available for team backfill.');
    }

    const now = DateTime.utc();
    const reportWindowStartDate = getReportWindowStartDate();
    const lease = await db.claimEnterpriseOrganizationLease(
      enterprise,
      organization,
      `org-backfill-${process.pid}-${randomUUID()}`,
      now.toJSDate(),
      now.plus({ minutes: ORGANIZATION_TEAM_LEASE_MINUTES }).toJSDate(),
    );
    if (!lease) {
      throw new Error('Organization-team ingestion is already in progress.');
    }

    try {
      const days = this.getDayRange(fromDate, toDate);
      for (const [index, day] of days.entries()) {
        const leaseNow = DateTime.utc();
        const renewed = await db.renewEnterpriseOrganizationLease(
          lease,
          leaseNow.toJSDate(),
          leaseNow
            .plus({ minutes: ORGANIZATION_TEAM_LEASE_MINUTES })
            .toJSDate(),
        );
        if (!renewed) {
          throw new Error('Organization-team backfill lost its work lease.');
        }

        try {
          const includeUserAndTeamReports = day >= reportWindowStartDate;
          const loaded = await this.ingestOrganizationTeamDay(
            lease,
            organization,
            day,
            'backfill',
            includeUserAndTeamReports,
          );
          if (!loaded) {
            if (includeUserAndTeamReports) {
              logger.warn(
                `[TaskManagementV2] Organization-team backfill is incomplete for organization:${organization} on ${day}; the day will be retried.`,
              );
            } else {
              logger.info(
                `[TaskManagementV2] Stored totals only for organization:${organization} on ${day}; per-user and user-team reports are outside GitHub's report window.`,
              );
            }
          }
        } catch (error) {
          if (error instanceof InaccessibleEnterpriseOrganizationError) {
            const failedAt = DateTime.utc();
            await db.updateEnterpriseOrganizationState(lease, {
              accessState: 'inaccessible',
              reportsReady: false,
              lastAttemptedAt: failedAt.toJSDate(),
              nextAttemptAt: failedAt.plus({ hours: 24 }).toJSDate(),
            });
            throw new Error('Organization is no longer available.');
          }
          throw error;
        }

        if (backfillDelayMs > 0 && index < days.length - 1) {
          await delay(backfillDelayMs);
        }
      }
    } finally {
      await db.releaseEnterpriseOrganizationLease(lease);
    }
  }

  private getDayRange(fromDate: string, toDate: string): string[] {
    const from = DateTime.fromISO(fromDate, { zone: 'utc' }).startOf('day');
    const to = DateTime.fromISO(toDate, { zone: 'utc' }).startOf('day');
    if (!from.isValid || !to.isValid || from > to) {
      return [];
    }

    const days: string[] = [];
    for (let day = from; day <= to; day = day.plus({ days: 1 })) {
      const isoDate = day.toISODate();
      if (isoDate) {
        days.push(isoDate);
      }
    }
    return days;
  }

  private async runOrganizationTeamIngestion(
    enterprise: string,
    configuredOrganization?: string,
  ): Promise<void> {
    const { api, db, logger } = this.options;
    const now = DateTime.utc();
    let organizations: string[];
    try {
      organizations = await api.fetchEnterpriseOrganizations();
      await db.syncEnterpriseOrganizations(
        enterprise,
        organizations,
        now.toJSDate(),
      );
    } catch (error) {
      await db.markEnterpriseOrganizationDirectoryFailed(
        enterprise,
        now.toJSDate(),
      );
      logger.error(
        '[TaskManagementV2] Failed to refresh the enterprise organization directory; organization-team views are unavailable until discovery succeeds.',
        error,
      );
      return;
    }

    if (
      configuredOrganization &&
      organizations.some(
        item => item.toLowerCase() === configuredOrganization.toLowerCase(),
      )
    ) {
      try {
        const yesterday = DateTime.utc().minus({ days: 1 }).toISODate();
        if (!yesterday) {
          throw new Error('Unable to compute yesterday date.');
        }
        await api.verifyEnterpriseOrganizationAccess(
          configuredOrganization,
          yesterday,
        );
        await db.markLegacyConfiguredOrganization(
          enterprise,
          configuredOrganization,
          DateTime.utc().toJSDate(),
        );
      } catch (error) {
        if (error instanceof InaccessibleEnterpriseOrganizationError) {
          const failedAt = DateTime.utc();
          await db.markEnterpriseOrganizationInaccessible(
            enterprise,
            configuredOrganization,
            failedAt.toJSDate(),
            failedAt.plus({ hours: 24 }).toJSDate(),
          );
          logger.warn(
            '[TaskManagementV2] The configured organization is no longer accessible; hiding its organization-team filters while retaining imported history.',
          );
        } else {
          logger.error(
            '[TaskManagementV2] Failed to verify access to the configured organization; retaining its previous directory state.',
            error,
          );
        }
      }
    }

    const workItems = await db.getEnterpriseOrganizationWorkItems(
      enterprise,
      DateTime.utc().toJSDate(),
      ORGANIZATION_TEAM_MAX_ORGANIZATIONS_PER_RUN,
      1,
      configuredOrganization,
    );
    for (const item of workItems) {
      const leaseStartedAt = DateTime.utc();
      const lease = await db.claimEnterpriseOrganizationLease(
        enterprise,
        item.login,
        `org-ingest-${process.pid}-${randomUUID()}`,
        leaseStartedAt.toJSDate(),
        leaseStartedAt
          .plus({ minutes: ORGANIZATION_TEAM_LEASE_MINUTES })
          .toJSDate(),
      );
      if (!lease) {
        continue;
      }

      try {
        await this.ingestEnterpriseOrganizationWorkItem(lease, item.login);
      } catch (error) {
        const failedAt = DateTime.utc();
        if (error instanceof InaccessibleEnterpriseOrganizationError) {
          try {
            await db.updateEnterpriseOrganizationState(lease, {
              accessState: 'inaccessible',
              reportsReady: false,
              lastAttemptedAt: failedAt.toJSDate(),
              nextAttemptAt: failedAt.plus({ hours: 24 }).toJSDate(),
            });
          } catch (stateError) {
            logger.warn(
              `[TaskManagementV2] Could not update access state for organization:${item.login}; the ingestion lease may have expired.`,
              stateError,
            );
          }
          logger.warn(
            `[TaskManagementV2] Organization-team ingestion is inaccessible for organization:${item.login}; imported history will be retained.`,
          );
        } else {
          try {
            await db.updateEnterpriseOrganizationState(lease, {
              lastAttemptedAt: failedAt.toJSDate(),
              nextAttemptAt: failedAt.plus({ hours: 1 }).toJSDate(),
            });
          } catch (stateError) {
            logger.warn(
              `[TaskManagementV2] Could not schedule a retry for organization:${item.login}; the ingestion lease may have expired.`,
              stateError,
            );
          }
          logger.error(
            `[TaskManagementV2] Organization-team ingestion failed for organization:${item.login}; it will be retried.`,
            error,
          );
        }
      } finally {
        await db.releaseEnterpriseOrganizationLease(lease);
      }
    }
  }

  private async ingestEnterpriseOrganizationWorkItem(
    lease: Awaited<
      ReturnType<DatabaseHandlerV2['claimEnterpriseOrganizationLease']>
    > & {},
    organization: string,
  ): Promise<void> {
    if (!lease) {
      return;
    }

    const { db, logger } = this.options;
    const yesterday = DateTime.utc().minus({ days: 1 }).toISODate();
    const bootstrapStart = DateTime.utc()
      .startOf('day')
      .minus({ days: ORGANIZATION_TEAM_BOOTSTRAP_DAYS })
      .toISODate();
    if (!yesterday || !bootstrapStart) {
      throw new Error('Unable to compute the organization-team report window.');
    }
    const start = DateTime.fromISO(bootstrapStart);
    const effectiveStart =
      bootstrapStart < GITHUB_REPORTS_EARLIEST_DATE
        ? GITHUB_REPORTS_EARLIEST_DATE
        : start.toISODate();
    if (!effectiveStart) {
      throw new Error('Unable to compute the organization-team start date.');
    }

    const missingDays = await db.getMissingDays(
      'organization',
      organization,
      effectiveStart,
      yesterday,
      ['totals', 'users', 'teams'],
    );
    const trailingStart = DateTime.fromISO(yesterday)
      .minus({ days: ORGANIZATION_TEAM_REFETCH_DAYS - 1 })
      .toISODate();
    if (!trailingStart) {
      throw new Error('Unable to compute the organization-team retry window.');
    }
    const trailingDays = this.getDayRange(
      trailingStart < GITHUB_REPORTS_EARLIEST_DATE
        ? GITHUB_REPORTS_EARLIEST_DATE
        : trailingStart,
      yesterday,
    );
    const backlogDays = missingDays
      .filter(day => !trailingDays.includes(day))
      .slice(0, ORGANIZATION_TEAM_MAX_BACKLOG_DAYS_PER_RUN);
    const days = uniqueDays(backlogDays, trailingDays);
    if (days.length === 0) {
      return;
    }

    let incomplete = false;
    for (const day of days) {
      const leaseNow = DateTime.utc();
      const renewed = await db.renewEnterpriseOrganizationLease(
        lease,
        leaseNow.toJSDate(),
        leaseNow.plus({ minutes: ORGANIZATION_TEAM_LEASE_MINUTES }).toJSDate(),
      );
      if (!renewed) {
        throw new Error(
          `Organization-team ingestion lost its lease for organization:${organization}.`,
        );
      }

      try {
        const loaded = await this.ingestOrganizationTeamDay(
          lease,
          organization,
          day,
          'scheduled',
        );
        if (!loaded) {
          incomplete = true;
        }
      } catch (error) {
        if (error instanceof InaccessibleEnterpriseOrganizationError) {
          throw error;
        }
        incomplete = true;
        logger.error(
          `[TaskManagementV2] Failed organization-team report ingestion for organization:${organization} on ${day}.`,
          error,
        );
      }
      await delay(200);
    }

    const completedAt = DateTime.utc();
    await db.updateEnterpriseOrganizationState(lease, {
      lastAttemptedAt: completedAt.toJSDate(),
      nextAttemptAt: completedAt
        .plus({ hours: incomplete ? 1 : 23 })
        .toJSDate(),
    });
  }

  private async ingestOrganizationTeamDay(
    lease: NonNullable<
      Awaited<ReturnType<DatabaseHandlerV2['claimEnterpriseOrganizationLease']>>
    >,
    organization: string,
    day: string,
    source: IngestSource,
    includeUserAndTeamReports = true,
  ): Promise<boolean> {
    const { api, db, logger } = this.options;
    const totalsEnvelope = await api.fetchEnterpriseOrganizationReportLinks(
      organization,
      day,
    );
    const totalsLinks = totalsEnvelope.download_links ?? [];
    if (totalsLinks.length === 0) {
      const now = DateTime.utc();
      await db.withOrganizationIngestionLease(lease, async transaction => {
        await db.updateEnterpriseOrganizationState(
          lease,
          {
            accessState: 'accessible',
            lastAttemptedAt: now.toJSDate(),
            nextAttemptAt: now.plus({ hours: 1 }).toJSDate(),
          },
          transaction,
        );
      });
      return false;
    }

    const totals: ParsedEnterpriseDocument = {
      dailyTotals: [],
      prMetrics: [],
      byFeature: [],
      byIde: [],
      byLanguageFeature: [],
      byModelFeature: [],
      byLanguageModel: [],
      byCli: [],
      byVscodeAgent: [],
      customizationMetrics: [],
      customizationSummaries: [],
    };
    for (const url of totalsLinks) {
      const parsed = parseOrganizationDocument(
        await api.downloadDocument(url),
        'organization',
        organization,
      );
      totals.dailyTotals.push(...parsed.dailyTotals);
      totals.prMetrics.push(...parsed.prMetrics);
      totals.byFeature.push(...parsed.byFeature);
      totals.byIde.push(...parsed.byIde);
      totals.byLanguageFeature.push(...parsed.byLanguageFeature);
      totals.byModelFeature.push(...parsed.byModelFeature);
      totals.byLanguageModel.push(...parsed.byLanguageModel);
      totals.byCli.push(...parsed.byCli);
      totals.byVscodeAgent.push(...parsed.byVscodeAgent);
      totals.customizationMetrics.push(...parsed.customizationMetrics);
      totals.customizationSummaries.push(...parsed.customizationSummaries);
    }
    if (
      !totals.dailyTotals.some(
        row => row.day === day && row.entity_id === organization,
      )
    ) {
      logger.warn(
        `[TaskManagementV2] Parsed no organization totals for organization:${organization} on ${day}; preserving existing rows.`,
      );
      return false;
    }

    if (!includeUserAndTeamReports) {
      return this.storeOrganizationTotalsWithoutTeams(
        lease,
        organization,
        day,
        totals,
        source,
        "Per-user and user-team reports are outside GitHub's report window.",
      );
    }

    const userEnvelope = await api.fetchEnterpriseOrganizationUserReportLinks(
      organization,
      day,
    );
    const userLinks = userEnvelope.download_links ?? [];
    if (userLinks.length === 0) {
      return this.storeOrganizationTotalsWithoutTeams(
        lease,
        organization,
        day,
        totals,
        source,
      );
    }

    const userTeamsEnvelope =
      await api.fetchEnterpriseOrganizationUserTeamsLinks(organization, day);
    const userTeamLinks = userTeamsEnvelope.download_links ?? [];
    if (userTeamLinks.length === 0) {
      return this.storeOrganizationTotalsWithoutTeams(
        lease,
        organization,
        day,
        totals,
        source,
      );
    }

    const userReport: ParsedUserDocument = {
      userMetrics: [],
      userBreakdowns: [],
      customizationMetrics: [],
      customizationSummaries: [],
    };
    for (const url of userLinks) {
      const parsed = parseUserDocument(
        await api.downloadNdjsonDocument(url),
        'organization',
        organization,
      );
      userReport.userMetrics.push(...parsed.userMetrics);
      userReport.userBreakdowns.push(...parsed.userBreakdowns);
      userReport.customizationMetrics.push(...parsed.customizationMetrics);
      userReport.customizationSummaries.push(...parsed.customizationSummaries);
    }

    const userTeams: V2UserTeamRow[] = [];
    for (const url of userTeamLinks) {
      userTeams.push(
        ...parseUserTeamsDocument(
          await api.downloadNdjsonDocument(url),
          'organization',
          organization,
        ),
      );
    }
    const teamAggregates = aggregateTeamMetrics(
      userReport.userMetrics,
      userTeams,
      userReport.userBreakdowns,
      day,
      'organization',
      organization,
    );
    const storedAt = DateTime.utc();

    await db.withOrganizationIngestionLease(lease, async transaction => {
      await db.replaceOrganizationReportDay(
        day,
        organization,
        totals,
        transaction,
      );
      await db.replaceOrganizationUserReportDay(
        day,
        organization,
        userReport,
        transaction,
      );
      await db.replaceTeamAggregates(
        day,
        'organization',
        organization,
        userTeams,
        teamAggregates,
        transaction,
      );
      await db.upsertIngestionLog(
        {
          day,
          metrics_type: 'organization',
          entity_id: organization,
          status: 'success',
          components_loaded: JSON.stringify(['totals', 'users', 'teams']),
          source,
        },
        transaction,
      );
      await db.updateEnterpriseOrganizationState(
        lease,
        {
          accessState: 'accessible',
          reportsReady: true,
          cursorDay: day,
          lastAttemptedAt: storedAt.toJSDate(),
          nextAttemptAt: storedAt.plus({ hours: 23 }).toJSDate(),
        },
        transaction,
      );
    });
    return true;
  }

  private async storeOrganizationTotalsWithoutTeams(
    lease: NonNullable<
      Awaited<ReturnType<DatabaseHandlerV2['claimEnterpriseOrganizationLease']>>
    >,
    organization: string,
    day: string,
    totals: ParsedEnterpriseDocument,
    source: IngestSource,
    errorMessage = 'Missing per-user or user-team report links.',
  ): Promise<boolean> {
    const { db } = this.options;
    const storedAt = DateTime.utc();
    await db.withOrganizationIngestionLease(lease, async transaction => {
      await db.replaceOrganizationReportDay(
        day,
        organization,
        totals,
        transaction,
      );
      await db.upsertIngestionLog(
        {
          day,
          metrics_type: 'organization',
          entity_id: organization,
          status: 'partial',
          components_loaded: JSON.stringify(['totals']),
          error_message: errorMessage,
          source,
        },
        transaction,
      );
      await db.updateEnterpriseOrganizationState(
        lease,
        {
          accessState: 'accessible',
          reportsReady: true,
          cursorDay: day,
          lastAttemptedAt: storedAt.toJSDate(),
          nextAttemptAt: storedAt.plus({ hours: 1 }).toJSDate(),
        },
        transaction,
      );
    });
    return false;
  }
}
