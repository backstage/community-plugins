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
  LoggerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { InputError, NotFoundError } from '@backstage/errors';
import {
  Metric,
  PeriodRange,
  V2BackfillStatus,
} from '@backstage-community/plugin-copilot-common';
import { DatabaseHandler } from '../db/DatabaseHandler';
import { DatabaseHandlerV2 } from '../db/DatabaseHandlerV2';
import { TaskManagementV2 } from '../task/TaskManagementV2';
import { GithubClientV2 } from '../client/GithubClientV2';
import { validateQuery } from './validation/validateQuery';
import {
  MetricsQuery,
  metricsQuerySchema,
  PeriodRangeQuery,
  periodRangeQuerySchema,
  TeamQuery,
  teamQuerySchema,
  v2BackfillBodySchema,
  V2BackfillStatusQuery,
  v2BackfillStatusQuerySchema,
  V2FeatureQuery,
  v2FeatureQuerySchema,
  V2MetricsQuery,
  v2MetricsQuerySchema,
  V2PeriodRangeQuery,
  v2PeriodRangeQuerySchema,
  V2TeamsQuery,
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
  const { logger, database, scheduler, config } = routerOptions;
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

  v2Router.get(
    '/metrics/daily',
    validateQuery(v2MetricsQuerySchema),
    async (req, res, next) => {
      try {
        const { type, entityId, from, to, team } = req.query as V2MetricsQuery;
        const result = await dbV2.getDailyTotals(
          type,
          entityId,
          from,
          to,
          team,
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
        const { type, entityId, from, to, team } = req.query as V2MetricsQuery;
        const result = await dbV2.getPrMetrics(type, entityId, from, to, team);
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
        const { type, entityId, from, to, team } = req.query as V2MetricsQuery;
        // eslint-disable-next-line testing-library/no-await-sync-queries
        const result = await dbV2.getByFeature(type, entityId, from, to, team);
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
        const { type, entityId, from, to, team } = req.query as V2MetricsQuery;
        // eslint-disable-next-line testing-library/no-await-sync-queries
        const result = await dbV2.getByIde(type, entityId, from, to, team);
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
        const { type, entityId, from, to, team, feature } =
          req.query as V2FeatureQuery;
        // eslint-disable-next-line testing-library/no-await-sync-queries
        const result = await dbV2.getByLanguageFeature(
          type,
          entityId,
          from,
          to,
          team,
          feature,
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
        const { type, entityId, from, to, team } = req.query as V2MetricsQuery;
        // eslint-disable-next-line testing-library/no-await-sync-queries
        const result = await dbV2.getByModelFeature(
          type,
          entityId,
          from,
          to,
          team,
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
        const { type, entityId, from, to, team } = req.query as V2MetricsQuery;
        // eslint-disable-next-line testing-library/no-await-sync-queries
        const result = await dbV2.getByLanguageModel(
          type,
          entityId,
          from,
          to,
          team,
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
        const { type, entityId, from, to } = req.query as V2TeamsQuery;
        const result = await dbV2.getTeams(type, entityId, from, to);
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
        const { type, entityId } = req.query as V2PeriodRangeQuery;
        const result = await dbV2.getPeriodRange(type, entityId);
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
        const { type, entityId, from, to } = req.query as V2BackfillStatusQuery;
        const rows = await dbV2.getIngestionLog(type, entityId, from, to);
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
      void taskV2
        .runBackfill(fromDate, effectiveToDate, type, entityId)
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
        const { type, entityId, from, to, team } = req.query as V2MetricsQuery;
        const result = await dbV2.getDashboardData(
          type,
          entityId,
          from,
          to,
          team,
        );
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

  router.use(MiddlewareFactory.create({ config, logger }).error);
  return router;
}
