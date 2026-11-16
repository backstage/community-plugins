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
import express from 'express';
import Router from 'express-promise-router';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import {
  DatabaseService,
  HttpAuthService,
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { Config } from '@backstage/config';
import {
  InputError,
  NotFoundError,
  ServiceUnavailableError,
} from '@backstage/errors';
import {
  Metric,
  PeriodRange,
  V2BackfillStatus,
  V2MyDashboardResponse,
} from '@backstage-community/plugin-copilot-common';
import { DatabaseHandler } from '../db/DatabaseHandler';
import { DatabaseHandlerV2 } from '../db/DatabaseHandlerV2';
import type { CostCenterDashboardScope } from '../db/DatabaseHandlerV2';
import { TaskManagementV2 } from '../task/TaskManagementV2';
import { GithubClientV2 } from '../client/GithubClientV2';
import {
  CopilotUserResolver,
  DefaultCopilotUserResolver,
} from '../userResolver';
import { validateQuery } from './validation/validateQuery';
import {
  MetricsQuery,
  metricsQuerySchema,
  PeriodRangeQuery,
  periodRangeQuerySchema,
  TeamQuery,
  teamQuerySchema,
  v2BackfillBodySchema,
  v2BackfillStatusQuerySchema,
  v2FeatureQuerySchema,
  v2MeDashboardQuerySchema,
  v2CostCentersQuerySchema,
  v2NoCostCenterDashboardQuerySchema,
  v2OrganizationTeamDashboardQuerySchema,
  v2OrganizationTeamOptionsQuerySchema,
  V2MetricsQuery,
  v2MetricsQuerySchema,
  v2PeriodRangeQuerySchema,
  v2TeamsQuerySchema,
} from './validation/schema';
import { DateTime } from 'luxon';

/**
 * Options for configuring the Copilot plugin.
 *
 * @public
 */
export interface PluginOptions {
  /**
   * Schedule configuration for the plugin.
   */
  schedule?: SchedulerServiceTaskScheduleDefinition;
}

/**
 * Options for configuring the router used by the Copilot plugin.
 *
 * @public
 */
export interface RouterOptions {
  /**
   * Logger service for the router.
   */
  logger: LoggerService;

  /**
   * Database service for the router.
   */
  database: DatabaseService;

  /**
   * Scheduler service for the router.
   */
  scheduler: SchedulerService;

  /**
   * Configuration for the router.
   */
  config: Config;

  /**
   * Auth service used to resolve the credentials of the signed-in user
   * calling the `/v2/me/*` routes.
   */
  httpAuth?: HttpAuthService;

  /**
   * Service used to resolve the signed-in user's entity ref from their
   * credentials.
   */
  userInfo?: UserInfoService;

  /**
   * Catalog service, used (with the caller's own credentials) to look up the
   * signed-in user's catalog entity.
   */
  catalog?: CatalogService;

  /**
   * Resolves the GitHub login to use for an individual user's metrics.
   * Defaults to {@link DefaultCopilotUserResolver}.
   */
  userResolver?: CopilotUserResolver;
}

const defaultSchedule: SchedulerServiceTaskScheduleDefinition = {
  frequency: { cron: '0 2 * * *' },
  timeout: { minutes: 15 },
  initialDelay: { minutes: 1 },
  scope: 'local',
};

/**
 * Creates an Express router configured based on the provided router options and plugin options.
 *
 * This function initializes the router with the appropriate middleware and routes based on the
 * configuration and options provided. It also schedules tasks if scheduling options are provided.
 *
 * @param routerOptions - Options for configuring the router, including services and configuration.
 * @returns A promise that resolves to an Express router instance.
 *
 * @public
 */
export async function createRouterFromConfig(routerOptions: RouterOptions) {
  const { config } = routerOptions;
  const pluginOptions: PluginOptions = {
    schedule: defaultSchedule,
  };
  if (config && config.has('copilot.schedule')) {
    pluginOptions.schedule =
      readSchedulerServiceTaskScheduleDefinitionFromConfig(
        config.getConfig('copilot.schedule'),
      );
  }
  return createRouter(routerOptions, pluginOptions);
}

/** @private */
async function createRouter(
  routerOptions: RouterOptions,
  pluginOptions: PluginOptions,
): Promise<express.Router> {
  const { logger, database, scheduler, config, httpAuth, userInfo, catalog } =
    routerOptions;
  const userResolver =
    routerOptions.userResolver ?? new DefaultCopilotUserResolver();
  const { schedule } = pluginOptions;

  const db = await DatabaseHandler.create({ database });
  const dbV2 = await DatabaseHandlerV2.create({ database });
  const apiV2 = await GithubClientV2.fromConfig(config, logger);
  const taskV2 = TaskManagementV2.create({
    db: dbV2,
    api: apiV2,
    config,
    logger,
  });

  await scheduler.scheduleTask({
    id: 'copilot-metrics-v2',
    ...(schedule ?? defaultSchedule),
    fn: async () => await taskV2.runAsync(),
  });

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  // ---------------------------------------------------------------------------
  // Legacy read endpoints — serve data from the pre-v2 schema.
  // These are deprecated and will be removed once the v2 backfill is confirmed
  // complete for all historical periods. Surface them only via /legacy/*.
  // ---------------------------------------------------------------------------
  const legacyRouter = express.Router();

  legacyRouter.get(
    '/metrics',
    validateQuery(metricsQuerySchema),
    async (req, res) => {
      const { startDate, endDate, type, team } = req.query as MetricsQuery;
      let metrics: Metric[] = [];

      const lastDayOfOldMetrics = await db.getMostRecentDayFromMetrics(
        type,
        team,
      );

      if (
        startDate &&
        lastDayOfOldMetrics &&
        DateTime.fromISO(startDate) <=
          DateTime.fromJSDate(new Date(lastDayOfOldMetrics))
      ) {
        const result = await db.getMetrics(startDate, endDate, type, team);
        metrics = result.map(metric => ({
          ...metric,
          breakdown: JSON.parse(metric.breakdown),
        }));
      }

      const firstDayOfNewMetrics = await db.getEarliestDayFromMetricsV2(
        type,
        team,
      );
      if (
        endDate &&
        firstDayOfNewMetrics &&
        DateTime.fromISO(endDate) >=
          DateTime.fromJSDate(new Date(firstDayOfNewMetrics))
      ) {
        const result = await db.getMetricsV2(startDate, endDate, type, team);
        const breakdown = await db.getBreakdown(startDate, endDate, type, team);

        const newMetrics = result.map(metric => ({
          ...metric,
          breakdown: breakdown.filter(day => {
            const metricDate = DateTime.fromJSDate(new Date(metric.day));
            const dayDate = DateTime.fromJSDate(new Date(day.day));
            return metricDate.equals(dayDate);
          }),
        }));

        metrics = [...metrics, ...newMetrics];
      }

      return res.json(metrics);
    },
  );

  legacyRouter.get(
    '/engagements',
    validateQuery(metricsQuerySchema),
    async (req, res) => {
      const { startDate, endDate, type, team } = req.query as MetricsQuery;

      const engagements = await db.getEngagementMetrics(
        startDate,
        endDate,
        type,
        team,
      );
      if (!engagements) {
        throw new NotFoundError();
      }

      return res.json(engagements);
    },
  );

  legacyRouter.get(
    '/seats',
    validateQuery(metricsQuerySchema),
    async (req, res) => {
      const { startDate, endDate, type, team } = req.query as MetricsQuery;

      const seats = await db.getSeatMetrics(startDate, endDate, type, team);
      if (!seats) {
        throw new NotFoundError();
      }

      return res.json(seats);
    },
  );

  legacyRouter.get(
    '/metrics/period-range',
    validateQuery(periodRangeQuerySchema),
    async (req, res) => {
      const { type } = req.query as PeriodRangeQuery;
      const oldMetricRange = await db.getPeriodRange(type);
      const newMetricRange = await db.getPeriodRangeV2(type);

      if (!oldMetricRange && !newMetricRange) {
        throw new NotFoundError();
      }

      const minDate = oldMetricRange?.minDate || newMetricRange?.minDate;
      const maxDate = newMetricRange?.maxDate || oldMetricRange?.maxDate;

      if (!minDate || !maxDate) {
        throw new NotFoundError('Unable to determine metric date range');
      }

      const result: PeriodRange = { minDate, maxDate };
      return res.json(result);
    },
  );

  legacyRouter.get(
    '/teams',
    validateQuery(teamQuerySchema),
    async (req, res) => {
      const { type, startDate, endDate } = req.query as TeamQuery;

      const result = await db.getTeams(type, startDate, endDate);

      if (!result) {
        throw new NotFoundError();
      }

      return res.json(result);
    },
  );

  router.use('/legacy', legacyRouter);

  // ---------------------------------------------------------------------------
  // V2 endpoints — new report-based API (GitHub API version 2026-03-10)
  // ---------------------------------------------------------------------------
  const v2Router = express.Router();

  const configuredEnterprise = config.getOptionalString('copilot.enterprise');
  const configuredOrganization = config.getOptionalString(
    'copilot.organization',
  );
  const organizationTeamIngestionEnabled =
    config.getOptionalBoolean('copilot.ingestOrganizationTeamReports') ?? false;
  const configuredOrganizationTeamFilteringEnabled =
    Boolean(configuredEnterprise && configuredOrganization) &&
    (config.getOptionalBoolean('copilot.ingestTeams') ?? false);
  const organizationTeamFilteringEnabled =
    organizationTeamIngestionEnabled ||
    configuredOrganizationTeamFilteringEnabled;
  const costCenterIngestionEnabled =
    config.getOptionalBoolean('copilot.ingestCostCenters') ?? false;
  const matchesConfiguredId = (
    entityId: string,
    configuredId: string | undefined,
  ) =>
    Boolean(
      configuredId && entityId.toLowerCase() === configuredId.toLowerCase(),
    );
  const isCostCenterScopeEnabled = (
    type: V2MetricsQuery['type'],
    entityId: string,
  ) =>
    (type === 'enterprise' &&
      matchesConfiguredId(entityId, configuredEnterprise)) ||
    (costCenterIngestionEnabled &&
      Boolean(configuredEnterprise && configuredOrganization) &&
      matchesConfiguredId(entityId, configuredOrganization));

  const validateMetricsReadScope = async (params: {
    type: V2MetricsQuery['type'];
    entityId: string;
    from?: string;
    to?: string;
    team?: string;
    costCenter?: string;
  }): Promise<string> => {
    const { type, entityId, from, to, team, costCenter } = params;
    if (team !== undefined && costCenter !== undefined) {
      throw new InputError(
        'Team and costCenter filters cannot be used together',
      );
    }

    let validatedEntityId: string;
    if (type === 'enterprise') {
      if (!matchesConfiguredId(entityId, configuredEnterprise)) {
        throw new NotFoundError('Metrics scope is not available.');
      }
      validatedEntityId = configuredEnterprise!;
    } else if (!organizationTeamIngestionEnabled) {
      if (!matchesConfiguredId(entityId, configuredOrganization)) {
        throw new NotFoundError('Metrics scope is not available.');
      }
      validatedEntityId = configuredOrganization!;
    } else {
      if (!configuredEnterprise) {
        throw new NotFoundError('Metrics scope is not available.');
      }
      const directory = await dbV2.getEnterpriseOrganizationDirectory(
        configuredEnterprise,
      );
      if (!directory.complete) {
        throw new ServiceUnavailableError(
          'Organization metrics are being refreshed.',
        );
      }
      const organization = directory.organizations.find(
        item => item.toLowerCase() === entityId.toLowerCase(),
      );
      if (!organization) {
        throw new NotFoundError('Metrics scope is not available.');
      }
      validatedEntityId = organization;

      if (team !== undefined) {
        if (
          !from ||
          !to ||
          !(await dbV2.areOrganizationTeamReportsComplete(
            [validatedEntityId],
            from,
            to,
          ))
        ) {
          throw new ServiceUnavailableError(
            'Organization-team reports are incomplete for the requested period.',
          );
        }
        const teams = await dbV2.getAccessibleOrganizationTeams(
          [validatedEntityId],
          from,
          to,
        );
        if (!teams.includes(team)) {
          throw new InputError(
            'Team is not eligible for the requested organization and period.',
          );
        }
      }
    }

    if (!costCenter) {
      return validatedEntityId;
    }

    if (!isCostCenterScopeEnabled(type, validatedEntityId)) {
      throw new InputError(
        'Cost centers are only supported for enterprise scope',
      );
    }

    const costCenters = await dbV2.getCostCenters(
      type,
      validatedEntityId,
      from,
      to,
    );
    // The threshold counts distinct users across the range, not daily or rolling rows.
    if (!costCenters.costCenters.some(item => item.id === costCenter)) {
      throw new InputError(
        'Cost center is not eligible for the requested scope and date range',
      );
    }
    return validatedEntityId;
  };

  const validateNoCostCenterSelection = (params: {
    type: V2MetricsQuery['type'];
    entityId: string;
  }) => {
    const { type, entityId } = params;
    if (!isCostCenterScopeEnabled(type, entityId)) {
      throw new InputError(
        'Cost centers are only supported for enterprise scope',
      );
    }
  };

  const getDashboardData = async (params: {
    type: V2MetricsQuery['type'];
    entityId: string;
    from: string;
    to: string;
    team?: string;
    costCenterScope?: CostCenterDashboardScope;
  }) => {
    const { type, entityId, from, to, team, costCenterScope } = params;
    const validatedEntityId = await validateMetricsReadScope({
      type,
      entityId,
      from,
      to,
      team,
      costCenter:
        costCenterScope?.kind === 'costCenter' ? costCenterScope.id : undefined,
    });
    if (costCenterScope?.kind === 'noCostCenter') {
      validateNoCostCenterSelection({ type, entityId: validatedEntityId });
    }

    const dashboard = await dbV2.getDashboardData(
      type,
      validatedEntityId,
      from,
      to,
      team,
      costCenterScope,
    );
    if (
      costCenterScope?.kind === 'noCostCenter' &&
      !(await dbV2.hasUsersWithoutCostCenterOnDashboard(
        type,
        validatedEntityId,
        dashboard.daily,
      ))
    ) {
      throw new InputError(
        'No-cost-center scope is not eligible for the requested date range',
      );
    }

    return dashboard;
  };

  v2Router.get(
    '/cost-centers',
    validateQuery(v2CostCentersQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
        });
        if (!isCostCenterScopeEnabled(type, validatedEntityId)) {
          return res.json({
            costCenters: [],
            hasUsersWithoutCostCenter: false,
          });
        }

        const result = await dbV2.getCostCenters(
          type,
          validatedEntityId,
          from,
          to,
        );
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/metrics/daily',
    validateQuery(v2MetricsQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to, team, costCenter } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
          team,
          costCenter,
        });
        const result = await dbV2.getDailyTotals(
          type,
          validatedEntityId,
          from,
          to,
          team,
          costCenter,
        );
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/metrics/pull-requests',
    validateQuery(v2MetricsQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to, team, costCenter } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
          team,
          costCenter,
        });
        const result = await dbV2.getPrMetrics(
          type,
          validatedEntityId,
          from,
          to,
          team,
          costCenter,
        );
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/metrics/by-feature',
    validateQuery(v2MetricsQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to, team, costCenter } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
          team,
          costCenter,
        });
        // eslint-disable-next-line testing-library/no-await-sync-queries
        const result = await dbV2.getByFeature(
          type,
          validatedEntityId,
          from,
          to,
          team,
          costCenter,
        );
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/metrics/by-ide',
    validateQuery(v2MetricsQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to, team, costCenter } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
          team,
          costCenter,
        });
        // eslint-disable-next-line testing-library/no-await-sync-queries
        const result = await dbV2.getByIde(
          type,
          validatedEntityId,
          from,
          to,
          team,
          costCenter,
        );
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/metrics/by-language',
    validateQuery(v2FeatureQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to, team, costCenter, feature } =
          req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
          team,
          costCenter,
        });
        // eslint-disable-next-line testing-library/no-await-sync-queries
        const result = await dbV2.getByLanguageFeature(
          type,
          validatedEntityId,
          from,
          to,
          team,
          feature,
          costCenter,
        );
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/metrics/by-model-feature',
    validateQuery(v2MetricsQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to, team, costCenter } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
          team,
          costCenter,
        });
        // eslint-disable-next-line testing-library/no-await-sync-queries
        const result = await dbV2.getByModelFeature(
          type,
          validatedEntityId,
          from,
          to,
          team,
          costCenter,
        );
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/metrics/by-language-model',
    validateQuery(v2MetricsQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to, team, costCenter } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
          team,
          costCenter,
        });
        // eslint-disable-next-line testing-library/no-await-sync-queries
        const result = await dbV2.getByLanguageModel(
          type,
          validatedEntityId,
          from,
          to,
          team,
          costCenter,
        );
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/teams',
    validateQuery(v2TeamsQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
        });
        if (type === 'organization' && organizationTeamIngestionEnabled) {
          if (
            from &&
            to &&
            !(await dbV2.areOrganizationTeamReportsComplete(
              [validatedEntityId],
              from,
              to,
            ))
          ) {
            throw new ServiceUnavailableError(
              'Organization-team reports are incomplete for the requested period.',
            );
          }
          const teams = await dbV2.getAccessibleOrganizationTeams(
            [validatedEntityId],
            from,
            to,
          );
          return res.json(teams);
        }
        const result = await dbV2.getTeams(type, validatedEntityId, from, to);
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/organization-team/options',
    validateQuery(v2OrganizationTeamOptionsQuerySchema),
    async (req, res, next) => {
      try {
        if (!organizationTeamFilteringEnabled || !configuredEnterprise) {
          return res.status(404).json({
            error: 'Organization-team filtering is not enabled.',
          });
        }

        const { from, to, organization } = req.query;
        if (from > to) {
          throw new InputError('from must be less than or equal to to');
        }
        if (!organizationTeamIngestionEnabled) {
          if (
            !configuredOrganizationTeamFilteringEnabled ||
            !configuredOrganization ||
            (organization &&
              organization.toLowerCase() !==
                configuredOrganization.toLowerCase())
          ) {
            return res.status(404).json({
              error: 'Organization is not available for team filtering.',
            });
          }

          return res.json({
            organizations: [configuredOrganization],
            teams: await dbV2.getTeams(
              'organization',
              configuredOrganization,
              from,
              to,
            ),
            teamsReady: true,
            allOrganizationsReady: true,
            hasPendingOrganizations: false,
          });
        }

        const directory = await dbV2.getEnterpriseOrganizationDirectory(
          configuredEnterprise,
        );
        if (!directory.complete) {
          return res.status(503).json({
            error: 'Organization-team filters are being refreshed.',
          });
        }

        const selectedOrganization = organization
          ? directory.organizations.find(
              item => item.toLowerCase() === organization.toLowerCase(),
            )
          : undefined;
        if (organization && !selectedOrganization) {
          return res.status(404).json({
            error: 'Organization is not available for team filtering.',
          });
        }

        const organizations = selectedOrganization
          ? [selectedOrganization]
          : directory.organizations;
        const allOrganizationsReady =
          !directory.hasPendingOrganizations &&
          organizations.length > 0 &&
          (await dbV2.areOrganizationTeamReportsComplete(
            organizations,
            from,
            to,
          ));
        const teamsReady =
          organizations.length > 0 &&
          (!directory.hasPendingOrganizations ||
            Boolean(selectedOrganization)) &&
          (await dbV2.areOrganizationTeamReportsComplete(
            organizations,
            from,
            to,
          ));
        const teams = teamsReady
          ? await dbV2.getAccessibleOrganizationTeams(organizations, from, to)
          : [];

        return res.json({
          organizations: directory.organizations,
          teams,
          teamsReady,
          allOrganizationsReady,
          hasPendingOrganizations: directory.hasPendingOrganizations,
        });
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/organization-team/dashboard',
    validateQuery(v2OrganizationTeamDashboardQuerySchema),
    async (req, res, next) => {
      try {
        if (!organizationTeamFilteringEnabled || !configuredEnterprise) {
          return res.status(404).json({
            error: 'Organization-team filtering is not enabled.',
          });
        }

        const { from, to, organization, team } = req.query;
        if (from > to) {
          throw new InputError('from must be less than or equal to to');
        }
        if (!organization && !team) {
          const result = await dbV2.getDashboardData(
            'enterprise',
            configuredEnterprise,
            from,
            to,
          );
          return res.json(result);
        }
        if (!organizationTeamIngestionEnabled) {
          if (
            !configuredOrganizationTeamFilteringEnabled ||
            !configuredOrganization ||
            (organization &&
              organization.toLowerCase() !==
                configuredOrganization.toLowerCase())
          ) {
            return res.status(404).json({
              error: 'Organization is not available for team filtering.',
            });
          }
          if (team) {
            const teams = await dbV2.getTeams(
              'organization',
              configuredOrganization,
              from,
              to,
            );
            if (!teams.includes(team)) {
              throw new InputError(
                'Team is not eligible for the requested organization and period.',
              );
            }
          }
          const result = await dbV2.getDashboardData(
            'organization',
            configuredOrganization,
            from,
            to,
            team,
          );
          return res.json(result);
        }

        const directory = await dbV2.getEnterpriseOrganizationDirectory(
          configuredEnterprise,
        );
        if (!directory.complete) {
          return res.status(503).json({
            error: 'Organization-team reports are being refreshed.',
          });
        }

        const selectedOrganization = organization
          ? directory.organizations.find(
              item => item.toLowerCase() === organization.toLowerCase(),
            )
          : undefined;
        if (organization && !selectedOrganization) {
          return res.status(404).json({
            error: 'Organization is not available for team filtering.',
          });
        }

        if (selectedOrganization) {
          if (team) {
            if (
              !(await dbV2.areOrganizationTeamReportsComplete(
                [selectedOrganization],
                from,
                to,
              ))
            ) {
              return res.status(503).json({
                error:
                  'Organization-team reports are incomplete for the requested period.',
              });
            }
            const teams = await dbV2.getAccessibleOrganizationTeams(
              [selectedOrganization],
              from,
              to,
            );
            if (!teams.includes(team)) {
              throw new InputError(
                'Team is not eligible for the requested organization and period.',
              );
            }
          }
          const result = await dbV2.getDashboardData(
            'organization',
            selectedOrganization,
            from,
            to,
            team,
          );
          return res.json(result);
        }

        if (directory.hasPendingOrganizations) {
          return res.status(503).json({
            error:
              'Organization-team reports are incomplete across the enterprise.',
          });
        }
        const organizations = directory.organizations;
        if (
          organizations.length === 0 ||
          !(await dbV2.areOrganizationTeamReportsComplete(
            organizations,
            from,
            to,
          ))
        ) {
          return res.status(503).json({
            error:
              'Organization-team reports are incomplete for the requested period.',
          });
        }
        const teams = await dbV2.getAccessibleOrganizationTeams(
          organizations,
          from,
          to,
        );
        if (!teams.includes(team!)) {
          throw new InputError(
            'Team is not eligible across the requested organizations and period.',
          );
        }

        const result = await dbV2.getOrganizationTeamDashboardData(
          organizations,
          from,
          to,
          team!,
        );
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/metrics/period-range',
    validateQuery(v2PeriodRangeQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
        });
        const result = await dbV2.getPeriodRange(type, validatedEntityId);
        if (!result) {
          return res.status(404).json({ error: 'No data found' });
        }
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/backfill/status',
    validateQuery(v2BackfillStatusQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
        });
        const rows = await dbV2.getBackfillStatus(
          type,
          validatedEntityId,
          from,
          to,
        );
        const result: V2BackfillStatus[] = rows.map(row => ({
          ...row,
          components_loaded: JSON.parse(row.components_loaded || '[]'),
        }));
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.post('/backfill', async (req, res, next) => {
    try {
      const body = v2BackfillBodySchema.parse(req.body);
      const { fromDate, type, entityId } = body;
      const toDate = body.toDate;

      if (fromDate < '2025-10-10') {
        return res.status(400).json({
          error: 'fromDate must be greater than or equal to 2025-10-10',
        });
      }

      if (toDate) {
        const today = DateTime.utc().toISODate();
        if (today && toDate > today) {
          return res
            .status(400)
            .json({ error: 'toDate cannot be in the future' });
        }
      }

      const yesterday = DateTime.utc().minus({ days: 1 }).toISODate();
      if (!yesterday) {
        throw new Error('Unable to compute yesterday date');
      }

      const effectiveToDate = toDate ?? yesterday;
      if (fromDate > effectiveToDate) {
        return res.status(400).json({
          error: 'fromDate must be less than or equal to toDate',
        });
      }

      if (type === 'organization' && organizationTeamIngestionEnabled) {
        if (!configuredEnterprise) {
          return res.status(400).json({
            error: 'Organization-team backfill requires copilot.enterprise.',
          });
        }
        const directory = await dbV2.getEnterpriseOrganizationDirectory(
          configuredEnterprise,
        );
        if (!directory.complete) {
          return res.status(404).json({
            error: 'Organization is not available for backfill.',
          });
        }
        const canonicalOrganization =
          await dbV2.getCurrentAccessibleEnterpriseOrganizationLogin(
            configuredEnterprise,
            entityId,
          );
        if (!canonicalOrganization) {
          return res.status(404).json({
            error: 'Organization is not available for backfill.',
          });
        }
        if (
          matchesConfiguredId(canonicalOrganization, configuredOrganization)
        ) {
          void taskV2
            .runBackfill(
              fromDate,
              effectiveToDate,
              'organization',
              configuredOrganization!,
            )
            .catch(error => logger.error('[router:v2] Backfill failed', error));
          return res.status(202).json({
            message: 'Backfill started',
            from: fromDate,
            to: effectiveToDate,
          });
        }

        void taskV2
          .runOrganizationBackfill(
            canonicalOrganization,
            fromDate,
            effectiveToDate,
          )
          .catch(error =>
            logger.error(
              '[router:v2] Organization-team backfill failed',
              error,
            ),
          );
        return res.status(202).json({
          message: 'Organization-team backfill started',
          from: fromDate,
          to: effectiveToDate,
        });
      }

      let validatedEntityId: string;
      if (
        type === 'enterprise' &&
        matchesConfiguredId(entityId, configuredEnterprise)
      ) {
        validatedEntityId = configuredEnterprise!;
      } else if (
        type === 'organization' &&
        matchesConfiguredId(entityId, configuredOrganization)
      ) {
        validatedEntityId = configuredOrganization!;
      } else {
        return res.status(404).json({
          error: 'Metrics scope is not available for backfill.',
        });
      }

      void taskV2
        .runBackfill(fromDate, effectiveToDate, type, validatedEntityId)
        .catch(error => logger.error('[router:v2] Backfill failed', error));

      return res.status(202).json({
        message: 'Backfill started',
        from: fromDate,
        to: effectiveToDate,
      });
    } catch (err) {
      return next(err);
    }
  });

  v2Router.get(
    '/dashboard',
    validateQuery(v2MetricsQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to, team, costCenter } = req.query;
        const costCenterScope: CostCenterDashboardScope | undefined =
          costCenter === undefined
            ? undefined
            : { kind: 'costCenter', id: costCenter };
        const result = await getDashboardData({
          type,
          entityId,
          from,
          to,
          team,
          costCenterScope,
        });
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  v2Router.get(
    '/no-cost-center/dashboard',
    validateQuery(v2NoCostCenterDashboardQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to } = req.query;
        const result = await getDashboardData({
          type,
          entityId,
          from,
          to,
          costCenterScope: { kind: 'noCostCenter' },
        });
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  // ---------------------------------------------------------------------------
  // "Me" endpoints — strictly self-scoped individual metrics.
  //
  // These routes never accept a user or team identifier from the client.
  // The caller's own GitHub login is always resolved server-side from their
  // own credentials (httpAuth -> userInfo -> userResolver), so it is
  // structurally impossible to request another user's metrics through this
  // API.
  // ---------------------------------------------------------------------------
  v2Router.get(
    '/me/dashboard',
    validateQuery(v2MeDashboardQuerySchema),
    async (req, res, next) => {
      try {
        if (!httpAuth || !userInfo || !catalog) {
          return res.status(501).json({
            error: 'Individual Copilot metrics are not configured',
          });
        }

        const credentials = await httpAuth.credentials(req, {
          allow: ['user'],
        });
        const { userEntityRef } = await userInfo.getUserInfo(credentials);
        const userLogin = await userResolver.resolveUserLogin({
          userEntityRef,
          credentials,
          services: { catalog },
        });

        if (!userLogin) {
          const notMatched: V2MyDashboardResponse = { matched: false };
          return res.json(notMatched);
        }

        const { type, entityId, from, to } = req.query;
        const validatedEntityId = await validateMetricsReadScope({
          type,
          entityId,
          from,
          to,
        });
        const hasUserMetrics = await dbV2.hasUserMetrics(
          type,
          validatedEntityId,
          userLogin,
        );
        if (!hasUserMetrics) {
          const notMatched: V2MyDashboardResponse = { matched: false };
          return res.json(notMatched);
        }

        const data = await dbV2.getUserDashboardData(
          type,
          validatedEntityId,
          userLogin,
          from,
          to,
        );

        const result: V2MyDashboardResponse = { matched: true, ...data };
        return res.json(result);
      } catch (err) {
        return next(err);
      }
    },
  );

  router.use('/v2', v2Router);

  router.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (err instanceof InputError) {
        return res.status(400).json({ error: err.message });
      }
      return next(err);
    },
  );

  router.use(MiddlewareFactory.create({ config, logger }).error());
  return router;
}
