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
import {
  MetricsScope,
  V2UserTeamRow,
  V2UserCostCenterRow,
  V2UserMetricRow,
} from '@backstage-community/plugin-copilot-common';
import {
  DatabaseHandlerV2,
  OrganizationIngestionLeaseLostError,
  parseComponentsLoaded,
} from '../db/DatabaseHandlerV2';
import type {
  EnterpriseOrganizationDirectoryGeneration,
  OrganizationIngestionLease,
} from '../db/DatabaseHandlerV2';
import { GithubClientV2 } from '../client/GithubClientV2';
import {
  InaccessibleEnterpriseOrganizationError,
  isOrganizationReportNotFoundError,
  isOrganizationReportPermissionError,
  type CostCenterMembershipSnapshot,
} from '../client/GithubClientV2';
import {
  parseEnterpriseDocument,
  parseOrganizationDocument,
  parseUserDocument,
  parseUserTeamsDocument,
  UserBreakdownData,
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
  organizationLease?: OrganizationIngestionLease;
  organizationReportTarget?: string;
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

type OrganizationTeamDirectoryRun = {
  generation: EnterpriseOrganizationDirectoryGeneration;
  configuredOrganizationAvailable: boolean;
  configuredOrganizationLogin?: string;
  configuredOrganizationAccessVerified: boolean;
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
const ORGANIZATION_TEAM_REFRESH_DAYS = 3;
const ORGANIZATION_TEAM_LEASE_MINUTES = 10;
const ORGANIZATION_TEAM_RETRY_HOURS = 23;
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
  if (typeof error === 'object' && error !== null) {
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }
    if (
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'status' in error.response &&
      typeof error.response.status === 'number'
    ) {
      return error.response.status;
    }
  }
  return undefined;
}

function getOrganizationAccessDenial(
  error: unknown,
): InaccessibleEnterpriseOrganizationError | undefined {
  if (!isOrganizationReportPermissionError(error)) {
    return undefined;
  }
  return error instanceof InaccessibleEnterpriseOrganizationError
    ? error
    : new InaccessibleEnterpriseOrganizationError(getHttpStatus(error) ?? 403);
}

function logOrganizationMetricsPermissionError(
  logger: LoggerService,
  report: 'per-user' | 'user-teams',
  day: string,
  error: unknown,
): boolean {
  if (!isOrganizationReportPermissionError(error)) {
    return isOrganizationReportNotFoundError(error);
  }

  const status = getHttpStatus(error) ?? 403;
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
  return Boolean(
    enterprise &&
      organization &&
      entityId.trim().toLowerCase() === organization.trim().toLowerCase(),
  );
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

  private withOrganizationIngestionLease<T>(
    lease: OrganizationIngestionLease | undefined,
    operation: (database: DatabaseHandlerV2) => Promise<T>,
  ): Promise<T> {
    return lease
      ? this.options.db.withOrganizationIngestionLease(lease, operation)
      : operation(this.options.db);
  }

  private async renewOrganizationIngestionLease(
    lease: OrganizationIngestionLease,
  ): Promise<void> {
    const now = DateTime.utc();
    const renewed = await this.options.db.renewEnterpriseOrganizationLease(
      lease,
      now.toJSDate(),
      now.plus({ minutes: ORGANIZATION_TEAM_LEASE_MINUTES }).toJSDate(),
    );
    if (!renewed) {
      throw new OrganizationIngestionLeaseLostError();
    }
  }

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

    let organizationDirectoryRun: OrganizationTeamDirectoryRun | undefined;
    if (ingestOrganizationTeamReports) {
      if (!enterprise) {
        logger.warn(
          '[TaskManagementV2] copilot.ingestOrganizationTeamReports is enabled, but copilot.enterprise is not configured; skipping multi-organization team ingestion.',
        );
      } else {
        organizationDirectoryRun = await this.runOrganizationTeamIngestion(
          enterprise,
          organization,
        );
      }
    }

    const entities: Array<{ metricsType: MetricsScope; entityId: string }> = [];

    if (enterprise) {
      entities.push({ metricsType: 'enterprise', entityId: enterprise });
    }
    if (organization) {
      if (
        enterprise &&
        ingestOrganizationTeamReports &&
        !organizationDirectoryRun?.configuredOrganizationAvailable
      ) {
        logger.info(
          `[TaskManagementV2] Skipping configured organization:${organization}; it is not available for ingestion.`,
        );
      } else {
        entities.push({
          metricsType: 'organization',
          entityId:
            organizationDirectoryRun?.configuredOrganizationLogin ??
            organization,
        });
      }
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
      let organizationLease: OrganizationIngestionLease | undefined;
      if (
        ingestOrganizationTeamReports &&
        enterprise &&
        plan.entity.metricsType === 'organization'
      ) {
        if (!organizationDirectoryRun?.configuredOrganizationAvailable) {
          continue;
        }
        const leaseStartedAt = DateTime.utc();
        organizationLease = await db.claimEnterpriseOrganizationLease(
          enterprise,
          plan.entity.entityId,
          leaseStartedAt.toJSDate(),
          leaseStartedAt
            .plus({ minutes: ORGANIZATION_TEAM_LEASE_MINUTES })
            .toJSDate(),
          true,
          organizationDirectoryRun.generation,
        );
        if (!organizationLease) {
          if (
            organizationDirectoryRun.generation &&
            !(await db.isEnterpriseOrganizationDirectoryGenerationCurrent(
              enterprise,
              organizationDirectoryRun.generation,
            ))
          ) {
            logger.debug(
              '[TaskManagementV2] Skipped configured-organization ingestion after its directory refresh was superseded.',
            );
          } else {
            logger.warn(
              `[TaskManagementV2] Skipping legacy ingestion for organization:${plan.entity.entityId}; another worker owns its organization-team lease.`,
            );
          }
          continue;
        }
      }

      try {
        const loadedUserReportDays = new Set<string>();
        const refreshedUserReportDays = new Set<string>();
        let organizationAccessVerified =
          organizationDirectoryRun?.configuredOrganizationLogin ===
            plan.entity.entityId &&
          organizationDirectoryRun.configuredOrganizationAccessVerified;
        for (const day of plan.missingDays) {
          if (organizationLease) {
            await this.renewOrganizationIngestionLease(organizationLease);
          }
          const userReport = await this.ingestDay(
            day,
            plan.entity.metricsType,
            plan.entity.entityId,
            {
              ingestTeams: plan.ingestTeams && day >= reportWindowStartDate,
              ingestUsers: plan.ingestUsers && day >= reportWindowStartDate,
              ingestCostCenters: plan.ingestCostCenters,
              source: 'scheduled',
              organizationLease,
            },
          );
          if (userReport.loaded) {
            loadedUserReportDays.add(day);
          }
          if (userReport.refreshed) {
            refreshedUserReportDays.add(day);
          }
          organizationAccessVerified ||= userReport.accessVerified;

          if (backfillDelayMs > 0) {
            await delay(backfillDelayMs);
          }
        }

        if (costCenterSnapshot?.complete && plan.ingestCostCenters) {
          const retryIncompleteDays = costCenterSnapshot.unassignedComplete
            ? plan.incompleteCostCenterDays
            : [];
          const daysToAggregate = uniqueDays(
            [...refreshedUserReportDays].filter(
              day => day >= reportWindowStartDate,
            ),
            plan.missingCostCenterDays.filter(
              day => day >= reportWindowStartDate,
            ),
            retryIncompleteDays.filter(day => day >= reportWindowStartDate),
          );
          for (const day of daysToAggregate) {
            if (
              plan.missingDays.includes(day) &&
              !loadedUserReportDays.has(day)
            ) {
              continue;
            }
            try {
              if (organizationLease) {
                await this.renewOrganizationIngestionLease(organizationLease);
              }
              await this.ingestCostCenterAggregates(
                day,
                plan.entity.metricsType,
                plan.entity.entityId,
                costCenterSnapshot,
                plan.missingCostCenterDays.includes(day) ||
                  retryIncompleteDays.includes(day) ||
                  loadedUserReportDays.has(day),
                organizationLease,
              );
            } catch (error) {
              if (error instanceof OrganizationIngestionLeaseLostError) {
                throw error;
              }
              const accessDenial = getOrganizationAccessDenial(error);
              if (organizationLease && accessDenial) {
                throw accessDenial;
              }
              logger.error(
                `[TaskManagementV2] Failed cost-center aggregation for ${plan.entity.metricsType}:${plan.entity.entityId} on ${day}; the day will be retried.`,
                error,
              );
            }
          }
        }

        if (organizationLease && enterprise && organizationAccessVerified) {
          const completedAt = DateTime.utc();
          await db.markLegacyConfiguredOrganization(
            enterprise,
            plan.entity.entityId,
            completedAt.toJSDate(),
            completedAt
              .plus({ hours: ORGANIZATION_TEAM_RETRY_HOURS })
              .toJSDate(),
            organizationLease,
          );
        }
      } catch (error) {
        const accessDenial = getOrganizationAccessDenial(error);
        if (organizationLease && enterprise && accessDenial) {
          const failedAt = DateTime.utc();
          try {
            await db.updateEnterpriseOrganizationState(organizationLease, {
              accessState: 'inaccessible',
              reportsReady: false,
              lastAttemptedAt: failedAt.toJSDate(),
              nextAttemptAt: failedAt.plus({ hours: 24 }).toJSDate(),
            });
          } catch (stateError) {
            if (stateError instanceof OrganizationIngestionLeaseLostError) {
              logger.debug(
                `[TaskManagementV2] Ignored a stale configured-organization denial for ${plan.entity.entityId}.`,
              );
              continue;
            }
            throw stateError;
          }
          logger.warn(
            `[TaskManagementV2] The configured organization is no longer accessible; hiding its organization-team filters while retaining imported history.`,
          );
          continue;
        }
        if (
          error instanceof OrganizationIngestionLeaseLostError &&
          enterprise &&
          organizationDirectoryRun?.generation &&
          !(await db.isEnterpriseOrganizationDirectoryGenerationCurrent(
            enterprise,
            organizationDirectoryRun.generation,
          ))
        ) {
          logger.debug(
            `[TaskManagementV2] Stopped organization ingestion for ${plan.entity.metricsType}:${plan.entity.entityId} after its lease or directory generation changed.`,
          );
          continue;
        }
        throw error;
      } finally {
        if (organizationLease) {
          await db.releaseEnterpriseOrganizationLease(organizationLease);
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
    await this.runBackfillInternal(fromDate, toDate, metricsType, entityId);
  }

  private async runBackfillInternal(
    fromDate: string,
    toDate: string,
    metricsType: MetricsScope,
    entityId: string,
    discoveredOrganization?: string,
  ): Promise<void> {
    const { api, config, db, logger } = this.options;
    const ingestTeams =
      config.getOptionalBoolean('copilot.ingestTeams') ?? false;
    const ingestCostCenters =
      config.getOptionalBoolean('copilot.ingestCostCenters') ?? false;
    const ingestOrganizationTeamReports =
      config.getOptionalBoolean('copilot.ingestOrganizationTeamReports') ??
      false;
    const enterprise = config.getOptionalString('copilot.enterprise');
    const organization = config.getOptionalString('copilot.organization');
    const isConfiguredOrganizationBackfill = Boolean(
      !discoveredOrganization &&
        ingestOrganizationTeamReports &&
        enterprise &&
        organization &&
        metricsType === 'organization' &&
        entityId.toLowerCase() === organization.toLowerCase(),
    );
    let canonicalOrganization = discoveredOrganization;
    if (isConfiguredOrganizationBackfill && enterprise) {
      canonicalOrganization =
        await db.getCurrentAccessibleEnterpriseOrganizationLogin(
          enterprise,
          entityId,
        );
      if (!canonicalOrganization) {
        throw new Error(
          'Configured organization is not available for backfill.',
        );
      }
    }
    const backfillEntityId = canonicalOrganization ?? entityId;
    const ingestTeamsForScope =
      ingestTeams ||
      isConfiguredOrganizationBackfill ||
      Boolean(discoveredOrganization);
    const costCenterIngestionAvailable =
      !discoveredOrganization &&
      ingestCostCenters &&
      isSupportedCostCenterScope(
        metricsType,
        backfillEntityId,
        enterprise,
        organization,
      );

    if (!discoveredOrganization && ingestCostCenters && !enterprise) {
      logger.warn(
        '[TaskManagementV2] copilot.ingestCostCenters is enabled, but copilot.enterprise is not configured; skipping cost-center ingestion.',
      );
    } else if (
      !discoveredOrganization &&
      ingestCostCenters &&
      metricsType === 'organization' &&
      !costCenterIngestionAvailable
    ) {
      logger.warn(
        `[TaskManagementV2] Organization cost-center ingestion requires copilot.enterprise and the configured copilot.organization; skipping cost-center ingestion for organization:${backfillEntityId}.`,
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
      backfillEntityId,
      fromDate,
      missingFromDate,
      toDate,
      requiredComponents,
      ingestUsers,
    );
    const missingCostCenterDays = costCenterIngestionAvailable
      ? await db.getDaysMissingCostCenterAggregation(
          metricsType,
          backfillEntityId,
          missingFromDate,
          toDate,
        )
      : [];
    const incompleteCostCenterDays = costCenterIngestionAvailable
      ? await db.getDaysWithIncompleteCostCenterAggregation(
          metricsType,
          backfillEntityId,
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
        `[TaskManagementV2] No missing days for backfill ${metricsType}:${backfillEntityId} in range ${fromDate}..${toDate}.`,
      );
      return;
    }

    if (missingDays.length) {
      logger.info(
        `[TaskManagementV2] Backfill processing ${missingDays.length} days for ${metricsType}:${backfillEntityId}.`,
      );
    }

    let costCenterSnapshot: CostCenterMembershipSnapshot | undefined;
    if (costCenterIngestionAvailable && costCenterDays.length) {
      try {
        costCenterSnapshot = await this.loadCostCenterSnapshot([
          { metricsType, entityId: backfillEntityId },
        ]);
      } catch (error) {
        logger.error(
          `[TaskManagementV2] Failed to load cost-center membership for enterprise:${enterprise}; cost-center days will be retried.`,
          error,
        );
      }
    }

    let organizationLease: OrganizationIngestionLease | undefined;
    if (canonicalOrganization && enterprise) {
      const startedAt = DateTime.utc();
      organizationLease = await db.claimEnterpriseOrganizationLease(
        enterprise,
        canonicalOrganization,
        startedAt.toJSDate(),
        startedAt.plus({ minutes: ORGANIZATION_TEAM_LEASE_MINUTES }).toJSDate(),
        true,
      );
      if (!organizationLease) {
        throw new Error('Organization-team ingestion is already in progress.');
      }
    }

    let organizationBackfillIncomplete = false;
    let organizationReportsReady = false;
    let organizationAccessVerified = false;
    try {
      if (discoveredOrganization) {
        const yesterday = DateTime.utc().minus({ days: 1 }).toISODate();
        if (!yesterday) {
          throw new Error('Unable to compute yesterday date.');
        }
        organizationAccessVerified =
          await api.verifyEnterpriseOrganizationAccess(
            discoveredOrganization,
            yesterday,
          );
      }

      const loadedUserReportDays = new Set<string>();
      const refreshedUserReportDays = new Set<string>();
      for (const day of missingDays) {
        if (organizationLease) {
          await this.renewOrganizationIngestionLease(organizationLease);
        }
        const userReport = await this.ingestDay(
          day,
          metricsType,
          backfillEntityId,
          {
            ingestTeams: ingestTeamsForScope && day >= reportWindowStartDate,
            ingestUsers: ingestUsers && day >= reportWindowStartDate,
            ingestCostCenters: costCenterIngestionAvailable,
            source: 'backfill',
            organizationLease,
            ...(discoveredOrganization
              ? { organizationReportTarget: discoveredOrganization }
              : {}),
          },
        );
        organizationAccessVerified ||= userReport.accessVerified;
        if (discoveredOrganization) {
          if (!userReport.complete) {
            organizationBackfillIncomplete = true;
          }
          if (userReport.totalsLoaded) {
            organizationReportsReady = true;
          }
        }
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

      if (costCenterSnapshot?.complete) {
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
            if (organizationLease) {
              await this.renewOrganizationIngestionLease(organizationLease);
            }
            await this.ingestCostCenterAggregates(
              day,
              metricsType,
              backfillEntityId,
              costCenterSnapshot,
              missingCostCenterDays.includes(day) ||
                retryIncompleteDays.includes(day) ||
                loadedUserReportDays.has(day),
              organizationLease,
            );
          } catch (error) {
            if (error instanceof OrganizationIngestionLeaseLostError) {
              throw error;
            }
            const accessDenial = getOrganizationAccessDenial(error);
            if (organizationLease && accessDenial) {
              throw accessDenial;
            }
            logger.error(
              `[TaskManagementV2] Failed cost-center aggregation for ${metricsType}:${backfillEntityId} on ${day}; the day will be retried.`,
              error,
            );
          }
        }
      }

      if (discoveredOrganization && organizationLease) {
        const completedAt = DateTime.utc();
        await db.updateEnterpriseOrganizationState(organizationLease, {
          ...(organizationAccessVerified ? { accessState: 'accessible' } : {}),
          ...(organizationReportsReady ? { reportsReady: true } : {}),
          lastAttemptedAt: completedAt.toJSDate(),
          ...(organizationBackfillIncomplete
            ? {
                nextAttemptAt: completedAt.plus({ hours: 1 }).toJSDate(),
              }
            : {}),
        });
      } else if (
        organizationAccessVerified &&
        organizationLease &&
        enterprise &&
        canonicalOrganization
      ) {
        const completedAt = DateTime.utc();
        await db.markLegacyConfiguredOrganization(
          enterprise,
          canonicalOrganization,
          completedAt.toJSDate(),
          completedAt.plus({ hours: ORGANIZATION_TEAM_RETRY_HOURS }).toJSDate(),
          organizationLease,
        );
      }
    } catch (error) {
      const accessDenial = getOrganizationAccessDenial(error);
      if (organizationLease && accessDenial) {
        const failedAt = DateTime.utc();
        await db.updateEnterpriseOrganizationState(organizationLease, {
          accessState: 'inaccessible',
          reportsReady: false,
          lastAttemptedAt: failedAt.toJSDate(),
          nextAttemptAt: failedAt.plus({ hours: 24 }).toJSDate(),
        });
        if (discoveredOrganization) {
          throw new Error('Organization is no longer available.');
        }
      }
      throw error;
    } finally {
      if (organizationLease) {
        await db.releaseEnterpriseOrganizationLease(organizationLease);
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
    organizationLease?: OrganizationIngestionLease,
    organizationReportTarget?: string,
    onAccessVerified?: () => void,
  ): Promise<{ loaded: boolean; accessVerified: boolean }> {
    const { api, logger } = this.options;
    let reportEnvelope: Awaited<
      ReturnType<GithubClientV2['fetchEnterpriseReportLinks']>
    >;
    try {
      if (metricsType === 'enterprise') {
        reportEnvelope = await api.fetchEnterpriseReportLinks(day);
      } else if (organizationReportTarget) {
        reportEnvelope = await api.fetchEnterpriseOrganizationReportLinks(
          organizationReportTarget,
          day,
        );
      } else {
        reportEnvelope = await api.fetchOrganizationReportLinks(day);
      }
    } catch (error) {
      if (
        metricsType === 'organization' &&
        isOrganizationReportNotFoundError(error)
      ) {
        logger.warn(
          `[TaskManagementV2] No organization totals report is available on ${day}; continuing with other days.`,
        );
        return { loaded: false, accessVerified: false };
      }
      throw error;
    }

    if (metricsType === 'organization') {
      onAccessVerified?.();
    }

    const totalLinks = reportEnvelope.download_links ?? [];
    if (totalLinks.length === 0) {
      logger.warn(
        `[TaskManagementV2] No download links for ${metricsType} totals on ${day} — report data may not yet be available for this period.`,
      );
      return { loaded: false, accessVerified: true };
    }

    let totalRowsParsed = 0;

    for (const url of totalLinks) {
      const document = await api.downloadDocument(url);
      const parsed =
        metricsType === 'organization'
          ? parseOrganizationDocument(document, metricsType, entityId)
          : parseEnterpriseDocument(document, metricsType, entityId);

      await this.withOrganizationIngestionLease(organizationLease, async db => {
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
      });

      totalRowsParsed += parsed.dailyTotals.length;
    }

    if (totalRowsParsed === 0) {
      logger.warn(
        `[TaskManagementV2] Parsed 0 daily rows for ${metricsType} totals on ${day} — not marking as success.`,
      );
      return { loaded: false, accessVerified: true };
    }

    return { loaded: true, accessVerified: true };
  }

  private async ingestUserReports(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    organizationLease?: OrganizationIngestionLease,
    organizationReportTarget?: string,
    onAccessVerified?: () => void,
  ): Promise<{
    loaded: boolean;
    userMetrics: V2UserMetricRow[];
    userBreakdowns: UserBreakdownData[];
    accessVerified: boolean;
  }> {
    const { api, logger } = this.options;
    let userReportEnvelope: Awaited<
      ReturnType<GithubClientV2['fetchEnterpriseUserReportLinks']>
    >;
    try {
      if (metricsType === 'enterprise') {
        userReportEnvelope = await api.fetchEnterpriseUserReportLinks(day);
      } else if (organizationReportTarget) {
        userReportEnvelope =
          await api.fetchEnterpriseOrganizationUserReportLinks(
            organizationReportTarget,
            day,
          );
      } else {
        userReportEnvelope = await api.fetchOrganizationUserReportLinks(day);
      }
    } catch (error) {
      if (
        metricsType === 'organization' &&
        logOrganizationMetricsPermissionError(logger, 'per-user', day, error)
      ) {
        const accessDenial = getOrganizationAccessDenial(error);
        if (accessDenial && (organizationLease || organizationReportTarget)) {
          throw accessDenial;
        }
        return {
          loaded: false,
          userMetrics: [],
          userBreakdowns: [],
          accessVerified: false,
        };
      }
      throw error;
    }

    if (metricsType === 'organization') {
      onAccessVerified?.();
    }

    const userLinks = userReportEnvelope.download_links ?? [];
    if (userLinks.length === 0) {
      logger.warn(
        `[TaskManagementV2] No download links for ${metricsType} users on ${day} — user metrics will be skipped.`,
      );
      return {
        loaded: false,
        userMetrics: [],
        userBreakdowns: [],
        accessVerified: true,
      };
    }

    const userMetrics: V2UserMetricRow[] = [];
    const userBreakdowns: UserBreakdownData[] = [];

    for (const url of userLinks) {
      const rows = await api.downloadNdjsonDocument(url);
      const parsed = parseUserDocument(rows, metricsType, entityId);
      userMetrics.push(...parsed.userMetrics);
      userBreakdowns.push(...parsed.userBreakdowns);
      await this.withOrganizationIngestionLease(organizationLease, async db => {
        await db.insertCustomizationMetrics(parsed.customizationMetrics);
        await db.insertCustomizationSummaries(parsed.customizationSummaries);
      });
    }

    const breakdownRows = buildUserBreakdownRows(
      userBreakdowns,
      day,
      metricsType,
      entityId,
    );
    await this.withOrganizationIngestionLease(organizationLease, async db => {
      await db.insertUserMetrics(userMetrics);
      await db.insertUserMetricsByFeature(breakdownRows.byFeature);
      await db.insertUserMetricsByIde(breakdownRows.byIde);
      await db.insertUserMetricsByLanguageFeature(
        breakdownRows.byLanguageFeature,
      );
      await db.insertUserMetricsByModelFeature(breakdownRows.byModelFeature);
      await db.insertUserMetricsByLanguageModel(breakdownRows.byLanguageModel);
    });

    return { loaded: true, userMetrics, userBreakdowns, accessVerified: true };
  }

  private async ingestTeamAggregates(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    userMetrics: V2UserMetricRow[],
    userBreakdowns: UserBreakdownData[],
    userReportLoaded: boolean,
    organizationLease?: OrganizationIngestionLease,
    organizationReportTarget?: string,
    onAccessVerified?: () => void,
  ): Promise<{ loaded: boolean; accessVerified: boolean }> {
    const { api, logger } = this.options;
    let userTeamsEnvelope: Awaited<
      ReturnType<GithubClientV2['fetchEnterpriseUserTeamsLinks']>
    >;
    try {
      if (metricsType === 'enterprise') {
        userTeamsEnvelope = await api.fetchEnterpriseUserTeamsLinks(day);
      } else if (organizationReportTarget) {
        userTeamsEnvelope = await api.fetchEnterpriseOrganizationUserTeamsLinks(
          organizationReportTarget,
          day,
        );
      } else {
        userTeamsEnvelope = await api.fetchOrganizationUserTeamsLinks(day);
      }
    } catch (error) {
      if (
        metricsType === 'organization' &&
        logOrganizationMetricsPermissionError(logger, 'user-teams', day, error)
      ) {
        const accessDenial = getOrganizationAccessDenial(error);
        if (accessDenial && (organizationLease || organizationReportTarget)) {
          throw accessDenial;
        }
        return { loaded: false, accessVerified: false };
      }
      throw error;
    }

    if (metricsType === 'organization') {
      onAccessVerified?.();
    }

    const userTeamLinks = userTeamsEnvelope.download_links ?? [];
    if (userTeamLinks.length === 0) {
      logger.warn(
        `[TaskManagementV2] No download links for ${metricsType} user-teams on ${day} — team aggregation will be skipped.`,
      );
      return { loaded: false, accessVerified: true };
    }

    if (!userReportLoaded) {
      logger.warn(
        `[TaskManagementV2] Skipping ${metricsType} team aggregation for ${day} because the per-user report was not loaded.`,
      );
      return { loaded: false, accessVerified: true };
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

    await this.withOrganizationIngestionLease(organizationLease, db =>
      db.replaceTeamAggregates(
        day,
        metricsType,
        entityId,
        userTeams,
        teamAggregates,
      ),
    );

    return { loaded: userMetrics.length > 0, accessVerified: true };
  }

  private async ingestCostCenterAggregates(
    day: string,
    metricsType: MetricsScope,
    entityId: string,
    snapshot: CostCenterMembershipSnapshot,
    markEmptyDay: boolean,
    organizationLease?: OrganizationIngestionLease,
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
      const report = await this.ingestUserReports(
        day,
        metricsType,
        entityId,
        organizationLease,
      );
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

    await this.withOrganizationIngestionLease(organizationLease, database =>
      database.replaceCostCenterAggregates(
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
      ),
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
    const { logger } = this.options;
    const missingComponents = requiredComponents.filter(
      component => !componentsLoaded.includes(component),
    );
    const status: 'success' | 'partial' =
      missingComponents.length === 0 ? 'success' : 'partial';
    const errorMessage =
      missingComponents.length > 0
        ? `Missing components: ${missingComponents.join(', ')}`
        : undefined;

    await this.withOrganizationIngestionLease(context.organizationLease, db =>
      db.upsertIngestionLog({
        day,
        metrics_type: metricsType,
        entity_id: entityId,
        status,
        components_loaded: JSON.stringify(componentsLoaded),
        error_message: errorMessage,
        source: context.source,
      }),
    );

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
  ): Promise<{
    loaded: boolean;
    refreshed: boolean;
    complete: boolean;
    totalsLoaded: boolean;
    accessVerified: boolean;
  }> {
    const { db, logger } = this.options;
    const requiredComponents = getRequiredComponents(
      context.ingestUsers,
      context.ingestTeams,
    );
    const componentsLoaded = new Set<string>();
    let userReportsLoaded = false;
    let userReportsRefreshed = false;
    let accessVerified = false;
    const markAccessVerified = () => {
      accessVerified = true;
    };

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

      if (!previouslyLoaded.has('totals')) {
        const totals = await this.ingestTotals(
          day,
          metricsType,
          entityId,
          context.organizationLease,
          context.organizationReportTarget,
          markAccessVerified,
        );
        accessVerified ||= totals.accessVerified;
        if (totals.loaded) {
          componentsLoaded.add('totals');
        }
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
              accessVerified: false,
            }
          : await this.ingestUserReports(
              day,
              metricsType,
              entityId,
              context.organizationLease,
              context.organizationReportTarget,
              markAccessVerified,
            );
        accessVerified ||= userReport.accessVerified;
        userReportsLoaded = userReport.loaded;
        userReportsRefreshed = userReport.loaded && !reuseStoredReport;
        if (userReportsRefreshed && context.ingestCostCenters) {
          await this.withOrganizationIngestionLease(
            context.organizationLease,
            database =>
              database.markCostCenterAggregationPending(
                day,
                metricsType,
                entityId,
              ),
          );
        }
        if (userReport.loaded) {
          componentsLoaded.add('users');
        }

        if (context.ingestTeams) {
          const teams = await this.ingestTeamAggregates(
            day,
            metricsType,
            entityId,
            userReport.userMetrics,
            userReport.userBreakdowns,
            userReport.loaded,
            context.organizationLease,
            context.organizationReportTarget,
            markAccessVerified,
          );
          accessVerified ||= teams.accessVerified;
          if (teams.loaded) {
            componentsLoaded.add('teams');
          }
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
      return {
        loaded: userReportsLoaded,
        refreshed: userReportsRefreshed,
        complete: requiredComponents.every(component =>
          componentsLoaded.has(component),
        ),
        totalsLoaded: componentsLoaded.has('totals'),
        accessVerified,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (error instanceof OrganizationIngestionLeaseLostError) {
        throw error;
      }
      logger.error(
        `[TaskManagementV2] Failed ingest for ${metricsType}:${entityId} on ${day}.`,
        error,
      );

      await this.withOrganizationIngestionLease(
        context.organizationLease,
        database =>
          database.upsertIngestionLog({
            day,
            metrics_type: metricsType,
            entity_id: entityId,
            status: 'error',
            components_loaded: JSON.stringify([...componentsLoaded]),
            error_message: message,
            source: context.source,
          }),
      );
      const accessDenial = getOrganizationAccessDenial(error);
      if (
        (context.organizationLease || context.organizationReportTarget) &&
        accessDenial
      ) {
        throw accessDenial;
      }
      return {
        loaded: userReportsLoaded,
        refreshed: userReportsRefreshed,
        complete: false,
        totalsLoaded: componentsLoaded.has('totals'),
        accessVerified,
      };
    }
  }

  async runOrganizationBackfill(
    organization: string,
    fromDate: string,
    toDate: string,
  ): Promise<void> {
    const { config, db } = this.options;
    const enterprise = config.getOptionalString('copilot.enterprise');
    const enabled =
      config.getOptionalBoolean('copilot.ingestOrganizationTeamReports') ??
      false;
    if (!enterprise || !enabled) {
      throw new Error(
        'Organization-team backfill requires copilot.enterprise and copilot.ingestOrganizationTeamReports.',
      );
    }
    const canonicalOrganization =
      await db.getCurrentAccessibleEnterpriseOrganizationLogin(
        enterprise,
        organization,
      );
    if (!canonicalOrganization) {
      throw new Error('Organization is not available for team backfill.');
    }

    const from = DateTime.fromISO(fromDate, { zone: 'utc' }).startOf('day');
    const to = DateTime.fromISO(toDate, { zone: 'utc' }).startOf('day');
    const normalizedFrom = from.toISODate();
    const normalizedTo = to.toISODate();
    if (!normalizedFrom || !normalizedTo || from > to) {
      return;
    }
    await this.runBackfillInternal(
      normalizedFrom,
      normalizedTo,
      'organization',
      canonicalOrganization,
      canonicalOrganization,
    );
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
  ): Promise<OrganizationTeamDirectoryRun | undefined> {
    const { api, db, logger } = this.options;
    let generation: string;
    try {
      generation = await db.beginEnterpriseOrganizationDirectorySync(
        enterprise,
      );
    } catch (error) {
      logger.error(
        '[TaskManagementV2] Failed to reserve a refresh of the enterprise organization directory; no discovery was started.',
        error,
      );
      return undefined;
    }

    let organizations: string[];
    let configuredOrganizationLogin: string | undefined;
    let configuredOrganizationAmbiguous = false;
    try {
      organizations = await api.fetchEnterpriseOrganizations();
      const syncResult = await db.syncEnterpriseOrganizations(
        enterprise,
        generation,
        organizations,
        DateTime.utc().toJSDate(),
        configuredOrganization,
      );
      if (syncResult === 'superseded') {
        logger.debug(
          '[TaskManagementV2] Discarded an enterprise organization directory snapshot superseded by a newer refresh.',
        );
        return undefined;
      }
      if (typeof syncResult !== 'string') {
        configuredOrganizationLogin = syncResult.configuredOrganizationLogin;
        configuredOrganizationAmbiguous =
          syncResult.configuredOrganizationAmbiguous;
      }
    } catch (error) {
      let failureResult;
      try {
        failureResult = await db.markEnterpriseOrganizationDirectoryFailed(
          enterprise,
          generation,
          DateTime.utc().toJSDate(),
        );
      } catch (failureError) {
        logger.error(
          '[TaskManagementV2] Failed to record the enterprise organization directory refresh failure.',
          failureError,
        );
        return undefined;
      }
      if (failureResult === 'superseded') {
        logger.debug(
          '[TaskManagementV2] Ignored an enterprise organization directory failure superseded by a newer refresh.',
        );
      } else {
        logger.error(
          '[TaskManagementV2] Failed to refresh the enterprise organization directory; organization-team views are unavailable until discovery succeeds.',
          error,
        );
      }
      return undefined;
    }

    if (
      !(await db.isEnterpriseOrganizationDirectoryGenerationCurrent(
        enterprise,
        generation,
      ))
    ) {
      logger.debug(
        '[TaskManagementV2] Stopped organization-team ingestion after its directory refresh was superseded.',
      );
      return undefined;
    }

    const configuredOrganizationFromDirectory =
      configuredOrganizationLogin ??
      organizations.find(
        item => item.toLowerCase() === configuredOrganization?.toLowerCase(),
      );
    let configuredOrganizationAccessVerified = false;
    let configuredOrganizationAvailable = false;
    if (configuredOrganization && configuredOrganizationAmbiguous) {
      logger.error(
        `[TaskManagementV2] Multiple historical organization IDs differ only by case for ${configuredOrganization}; organization ingestion is paused until the data is reconciled.`,
      );
    } else if (configuredOrganizationFromDirectory) {
      if (
        !(await db.isEnterpriseOrganizationDirectoryGenerationCurrent(
          enterprise,
          generation,
        ))
      ) {
        logger.debug(
          '[TaskManagementV2] Stopped organization-team ingestion after its directory refresh was superseded.',
        );
        return undefined;
      }
      try {
        const yesterday = DateTime.utc().minus({ days: 1 }).toISODate();
        if (!yesterday) {
          throw new Error('Unable to compute yesterday date.');
        }
        configuredOrganizationAccessVerified =
          await api.verifyEnterpriseOrganizationAccess(
            configuredOrganizationFromDirectory,
            yesterday,
          );
        if (configuredOrganizationAccessVerified) {
          const checkedAt = DateTime.utc();
          const result = await db.markLegacyConfiguredOrganization(
            enterprise,
            configuredOrganizationFromDirectory,
            checkedAt.toJSDate(),
            checkedAt.plus({ hours: ORGANIZATION_TEAM_RETRY_HOURS }).toJSDate(),
            undefined,
            generation,
          );
          if (result === 'superseded') {
            logger.debug(
              '[TaskManagementV2] Stopped organization-team ingestion after its directory refresh was superseded.',
            );
            return undefined;
          }
          configuredOrganizationAvailable = result === 'updated';
        } else {
          configuredOrganizationAvailable = true;
        }
      } catch (error) {
        const accessDenial = getOrganizationAccessDenial(error);
        if (accessDenial) {
          const failedAt = DateTime.utc();
          const result = await db.markEnterpriseOrganizationInaccessible(
            enterprise,
            configuredOrganizationFromDirectory,
            failedAt.toJSDate(),
            failedAt.plus({ hours: 24 }).toJSDate(),
            generation,
          );
          if (result === 'superseded') {
            logger.debug(
              '[TaskManagementV2] Ignored a configured-organization access result superseded by a newer directory refresh.',
            );
            return undefined;
          }
          if (result === 'updated') {
            logger.warn(
              '[TaskManagementV2] The configured organization is no longer accessible; hiding its organization-team filters while retaining imported history.',
            );
          }
        } else {
          if (
            !(await db.isEnterpriseOrganizationDirectoryGenerationCurrent(
              enterprise,
              generation,
            ))
          ) {
            logger.debug(
              '[TaskManagementV2] Ignored a configured-organization verification failure superseded by a newer directory refresh.',
            );
            return undefined;
          }
          logger.error(
            '[TaskManagementV2] Failed to verify access to the configured organization; retaining its previous directory state.',
            error,
          );
        }
      }
    }

    if (
      !(await db.isEnterpriseOrganizationDirectoryGenerationCurrent(
        enterprise,
        generation,
      ))
    ) {
      logger.debug(
        '[TaskManagementV2] Stopped organization-team ingestion after its directory refresh was superseded.',
      );
      return undefined;
    }
    const organizationsToIngest = await db.getEnterpriseOrganizationsToIngest(
      enterprise,
      DateTime.utc().toJSDate(),
      ORGANIZATION_TEAM_MAX_ORGANIZATIONS_PER_RUN,
      1,
      configuredOrganizationFromDirectory ?? configuredOrganization,
      generation,
    );
    for (const organization of organizationsToIngest) {
      if (
        !(await db.isEnterpriseOrganizationDirectoryGenerationCurrent(
          enterprise,
          generation,
        ))
      ) {
        logger.debug(
          '[TaskManagementV2] Stopped organization-team ingestion after its directory refresh was superseded.',
        );
        return undefined;
      }
      const leaseStartedAt = DateTime.utc();
      const lease = await db.claimEnterpriseOrganizationLease(
        enterprise,
        organization,
        leaseStartedAt.toJSDate(),
        leaseStartedAt
          .plus({ minutes: ORGANIZATION_TEAM_LEASE_MINUTES })
          .toJSDate(),
        false,
        generation,
      );
      if (!lease) {
        continue;
      }

      try {
        await this.ingestEnterpriseOrganizationWorkItem(lease, organization);
      } catch (error) {
        if (
          error instanceof OrganizationIngestionLeaseLostError ||
          !(await db.isEnterpriseOrganizationDirectoryGenerationCurrent(
            enterprise,
            generation,
          ))
        ) {
          logger.debug(
            `[TaskManagementV2] Stopped organization-team ingestion for organization:${organization} after its lease or directory generation changed.`,
          );
          continue;
        }
        const failedAt = DateTime.utc();
        const accessDenial = getOrganizationAccessDenial(error);
        if (accessDenial) {
          try {
            await db.updateEnterpriseOrganizationState(lease, {
              accessState: 'inaccessible',
              reportsReady: false,
              lastAttemptedAt: failedAt.toJSDate(),
              nextAttemptAt: failedAt.plus({ hours: 24 }).toJSDate(),
            });
          } catch (stateError) {
            if (stateError instanceof OrganizationIngestionLeaseLostError) {
              logger.debug(
                `[TaskManagementV2] Ignored a stale inaccessible-organization result for organization:${organization}.`,
              );
              continue;
            }
            logger.warn(
              `[TaskManagementV2] Could not update access state for organization:${organization}; the ingestion lease may have expired.`,
              stateError,
            );
          }
          logger.warn(
            `[TaskManagementV2] Organization-team ingestion is inaccessible for organization:${organization}; imported history will be retained.`,
          );
        } else {
          try {
            await db.updateEnterpriseOrganizationState(lease, {
              lastAttemptedAt: failedAt.toJSDate(),
              nextAttemptAt: failedAt.plus({ hours: 1 }).toJSDate(),
            });
          } catch (stateError) {
            if (stateError instanceof OrganizationIngestionLeaseLostError) {
              logger.debug(
                `[TaskManagementV2] Ignored a stale organization-team failure for organization:${organization}.`,
              );
              continue;
            }
            logger.warn(
              `[TaskManagementV2] Could not schedule a retry for organization:${organization}; the ingestion lease may have expired.`,
              stateError,
            );
          }
          logger.error(
            `[TaskManagementV2] Organization-team ingestion failed for organization:${organization}; it will be retried.`,
            error,
          );
        }
      } finally {
        await db.releaseEnterpriseOrganizationLease(lease);
      }
    }
    if (
      !(await db.isEnterpriseOrganizationDirectoryGenerationCurrent(
        enterprise,
        generation,
      ))
    ) {
      logger.debug(
        '[TaskManagementV2] Stopped organization-team ingestion after its directory refresh was superseded.',
      );
      return undefined;
    }
    return {
      generation,
      configuredOrganizationAvailable,
      configuredOrganizationLogin,
      configuredOrganizationAccessVerified,
    };
  }

  private async ingestEnterpriseOrganizationWorkItem(
    lease: OrganizationIngestionLease,
    organization: string,
  ): Promise<void> {
    const { api, config, db } = this.options;
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

    await this.renewOrganizationIngestionLease(lease);
    const reportWindowStartDate = getReportWindowStartDate();
    const missingFromDate =
      effectiveStart < reportWindowStartDate
        ? reportWindowStartDate
        : effectiveStart;
    const { missingDays } = await this.getMissingIngestionDays(
      'organization',
      organization,
      effectiveStart,
      missingFromDate,
      yesterday,
      getRequiredComponents(true, true),
      true,
    );
    const trailingStart = DateTime.fromISO(yesterday)
      .minus({ days: ORGANIZATION_TEAM_REFRESH_DAYS - 1 })
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

    await this.renewOrganizationIngestionLease(lease);
    let accessVerified = await api.verifyEnterpriseOrganizationAccess(
      organization,
      yesterday,
    );

    const backfillDelayMs =
      config.getOptionalNumber('copilot.backfillDelayMs') ?? 200;
    let incomplete = false;
    let reportsReady = false;
    for (const day of days) {
      await this.renewOrganizationIngestionLease(lease);

      const includeUserAndTeamReports = day >= reportWindowStartDate;
      const result = await this.ingestDay(day, 'organization', organization, {
        ingestTeams: includeUserAndTeamReports,
        ingestUsers: includeUserAndTeamReports,
        ingestCostCenters: false,
        source: 'scheduled',
        organizationLease: lease,
        organizationReportTarget: organization,
      });
      accessVerified ||= result.accessVerified;
      if (!result.complete) {
        incomplete = true;
      }
      if (result.totalsLoaded) {
        reportsReady = true;
      }

      if (backfillDelayMs > 0) {
        await delay(backfillDelayMs);
      }
    }

    const completedAt = DateTime.utc();
    await db.updateEnterpriseOrganizationState(lease, {
      ...(accessVerified ? { accessState: 'accessible' } : {}),
      ...(reportsReady ? { reportsReady: true } : {}),
      lastAttemptedAt: completedAt.toJSDate(),
      nextAttemptAt: completedAt
        .plus({
          hours: incomplete ? 1 : ORGANIZATION_TEAM_RETRY_HOURS,
        })
        .toJSDate(),
    });
  }
}
