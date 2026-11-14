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

import type { LoggerService } from '@backstage/backend-plugin-api';
import { InputError, NotFoundError } from '@backstage/errors';
import Router from 'express-promise-router';
import type { RequestHandler, Router as ExpressRouter } from 'express';
import type { GrowthbookClient } from './client';
import type { SdkFlagsSource } from './sdkSource';
import {
  normalizeExperiment,
  normalizeFlagDetail,
  normalizeResults,
} from './helpers';

export type RouterOptions = {
  logger: LoggerService;
  /** URL of the GrowthBook web app, used to build links to experiments. */
  appUrl: string;
  /** Present when `growthbook.secretKey` is configured (Management API mode). */
  mgmt?: GrowthbookClient;
  /** Present when only SDK keys are configured. */
  sdk?: SdkFlagsSource;
};

const MGMT_REQUIRED =
  'This endpoint requires growthbook.secretKey to be configured';

export function createRouter(options: RouterOptions): ExpressRouter {
  const { logger, appUrl, mgmt, sdk } = options;
  const router = Router();

  const requireMgmt =
    (handler: (client: GrowthbookClient) => RequestHandler): RequestHandler =>
    (req, res, next) => {
      if (!mgmt) {
        res.status(501).json({ error: MGMT_REQUIRED });
        return undefined;
      }
      return handler(mgmt)(req, res, next);
    };

  /** Resolves an optional `?project=` name to a project id. */
  async function resolveProject(
    client: GrowthbookClient,
    name: string | undefined,
  ): Promise<string | undefined> {
    if (!name) return undefined;
    const projects = await client.listProjects();
    const id = projects.find(
      p => p.name.toLowerCase() === name.toLowerCase(),
    )?.id;
    if (!id) {
      throw new InputError('Unknown project');
    }
    return id;
  }

  router.get('/projects', async (_req, res) => {
    if (!mgmt) {
      res.json({ projects: [] });
      return;
    }
    const projects = await mgmt.listProjects();
    res.json({ projects: projects.map(p => p.name) });
  });

  router.get('/flags', async (req, res) => {
    const env = (req.query.env as string) || 'prod';
    const projectName = req.query.project as string | undefined;

    if (mgmt) {
      const projectId = await resolveProject(mgmt, projectName);
      res.json(await mgmt.getFlags(env, projectId));
      return;
    }

    if (projectName) {
      throw new InputError('Project filtering is not supported in SDK mode');
    }
    if (!sdk) {
      res.status(500).json({ error: 'SDK keys not configured' });
      return;
    }
    const flags = await sdk.getFlags(env);
    if (!flags) {
      throw new InputError('Unknown environment');
    }
    res.json(flags);
  });

  router.get(
    '/flags/:key',
    requireMgmt(client => async (req, res) => {
      const key = req.params.key;
      const feature = await client.getFeature(key);
      if (!feature) {
        throw new NotFoundError('Flag not found');
      }
      const stale = await client.getStale(key).catch(err => {
        logger.warn(
          `Failed to fetch GrowthBook stale status for ${key}: ${err}`,
        );
        return undefined;
      });
      res.json(normalizeFlagDetail(feature, stale));
    }),
  );

  router.get(
    '/experiments',
    requireMgmt(client => async (req, res) => {
      const projectId = await resolveProject(
        client,
        req.query.project as string | undefined,
      );
      const experiments = await client.listExperiments(projectId);
      res.json(experiments.map(e => normalizeExperiment(e, appUrl)));
    }),
  );

  router.get(
    '/experiments/:id/results',
    requireMgmt(client => async (req, res) => {
      const found = await client.getExperimentResults(req.params.id);
      res.json(
        found
          ? normalizeResults(found.experiment, found.result)
          : { available: false, variations: [] },
      );
    }),
  );

  router.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return router;
}
