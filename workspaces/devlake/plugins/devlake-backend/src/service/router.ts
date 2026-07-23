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
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { readDevlakeConfig } from '../types';
import { DevlakeDbClient } from './DevlakeDbClient';
import { TimeRangePreset } from '@backstage-community/plugin-devlake-common';

/** @public */
export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

function getDateRange(
  from?: string,
  to?: string,
  preset?: string,
): { from: string; to: string } {
  if (from && to) {
    return { from, to };
  }

  const now = new Date();
  const toDate = now.toISOString().split('T')[0];

  const presetDays: Record<TimeRangePreset, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    quarter: 90,
    '1y': 365,
  };

  const days = presetDays[(preset as TimeRangePreset) ?? '30d'] ?? 30;
  const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    from: fromDate.toISOString().split('T')[0],
    to: toDate,
  };
}

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;
  const devlakeConfig = readDevlakeConfig(config);
  const client = new DevlakeDbClient(devlakeConfig.db, logger);

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  router.get('/teams', (_, response) => {
    const teams = [
      { name: 'All', devlakeProjectName: '__all__' },
      ...devlakeConfig.teams.map(team => ({
        name: team.name,
        devlakeProjectName: team.devlakeProjectName,
      })),
    ];
    response.json(teams);
  });

  router.get('/dora/metrics', async (req, response) => {
    const teamName = req.query.team as string;
    if (!teamName) {
      response
        .status(400)
        .json({ error: 'Missing required query param: team' });
      return;
    }

    let projectName: string | null;
    if (teamName === 'All') {
      projectName = null;
    } else {
      const team = devlakeConfig.teams.find(t => t.name === teamName);
      if (!team) {
        response
          .status(404)
          .json({ error: `Team "${teamName}" not found in configuration` });
        return;
      }
      projectName = team.devlakeProjectName;
    }

    const { from, to } = getDateRange(
      req.query.from as string,
      req.query.to as string,
      req.query.preset as string,
    );

    try {
      const metrics = await client.getDoraMetrics({
        projectName,
        from,
        to,
      });
      response.json(metrics);
    } catch (error) {
      logger.error(
        'Failed to fetch DORA metrics from DevLake DB',
        error as Error,
      );
      response.status(502).json({ error: 'Unable to query DevLake database' });
    }
  });

  router.get('/dora/metrics/trend', async (req, response) => {
    const teamName = req.query.team as string;
    if (!teamName) {
      response
        .status(400)
        .json({ error: 'Missing required query param: team' });
      return;
    }

    let projectName: string | null;
    if (teamName === 'All') {
      projectName = null;
    } else {
      const team = devlakeConfig.teams.find(t => t.name === teamName);
      if (!team) {
        response
          .status(404)
          .json({ error: `Team "${teamName}" not found in configuration` });
        return;
      }
      projectName = team.devlakeProjectName;
    }

    const { from, to } = getDateRange(
      req.query.from as string,
      req.query.to as string,
      req.query.preset as string,
    );

    try {
      const trend = await client.getDoraTrend({
        projectName,
        from,
        to,
      });
      response.json(trend);
    } catch (error) {
      logger.error(
        'Failed to fetch DORA trend data from DevLake DB',
        error as Error,
      );
      response.status(502).json({ error: 'Unable to query DevLake database' });
    }
  });

  const middleware = MiddlewareFactory.create({ logger, config });
  router.use(middleware.error() as unknown as express.RequestHandler);

  return router;
}
