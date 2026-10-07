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
import { Router, RequestHandler } from 'express';
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

export function createRouter(options: RouterOptions): Router {
  const { logger, appUrl, mgmt, sdk } = options;
  const router = Router();

  const guarded =
    (what: string, handler: RequestHandler): RequestHandler =>
    async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (err) {
        logger.error(`Failed to fetch GrowthBook ${what}: ${err}`);
        res
          .status(502)
          .json({ error: `Failed to fetch ${what} from GrowthBook` });
      }
    };

  const requireMgmt =
    (handler: (client: GrowthbookClient) => RequestHandler): RequestHandler =>
    (req, res, next) => {
      if (!mgmt) {
        res.status(501).json({ error: MGMT_REQUIRED });
        return undefined;
      }
      return handler(mgmt)(req, res, next);
    };

  async function resolveProjectId(
    client: GrowthbookClient,
    name: string,
  ): Promise<string | undefined> {
    const projects = await client.listProjects();
    return projects.find(p => p.name.toLowerCase() === name.toLowerCase())?.id;
  }

  router.use((req, res, next) => {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    next();
  });

  router.get(
    '/projects',
    guarded('projects', async (_req, res) => {
      if (!mgmt) {
        res.json({ projects: [] });
        return;
      }
      const projects = await mgmt.listProjects();
      res.json({ projects: projects.map(p => p.name) });
    }),
  );

  router.get(
    '/flags',
    guarded('flags', async (req, res) => {
      const env = (req.query.env as string) || 'prod';
      const projectName = req.query.project as string | undefined;

      if (mgmt) {
        let projectId: string | undefined;
        if (projectName) {
          projectId = await resolveProjectId(mgmt, projectName);
          if (!projectId) {
            res.status(400).json({ error: 'Unknown project' });
            return;
          }
        }
        res.json(await mgmt.getFlags(env, projectId));
        return;
      }

      if (projectName) {
        res
          .status(400)
          .json({ error: 'Project filtering is not supported in SDK mode' });
        return;
      }
      if (!sdk) {
        res.status(500).json({ error: 'SDK keys not configured' });
        return;
      }
      const flags = await sdk.getFlags(env);
      if (!flags) {
        res.status(400).json({ error: 'Unknown environment' });
        return;
      }
      res.json(flags);
    }),
  );

  router.get(
    '/flags/:key',
    requireMgmt(client =>
      guarded('flag details', async (req, res) => {
        const key = req.params.key;
        const feature = await client.getFeature(key);
        if (!feature) {
          res.status(404).json({ error: 'Flag not found' });
          return;
        }
        const stale = await client.getStale(key).catch(err => {
          logger.warn(
            `Failed to fetch GrowthBook stale status for ${key}: ${err}`,
          );
          return undefined;
        });
        res.json(normalizeFlagDetail(feature, stale));
      }),
    ),
  );

  router.get(
    '/experiments',
    requireMgmt(client =>
      guarded('experiments', async (req, res) => {
        const projectName = req.query.project as string | undefined;
        let projectId: string | undefined;
        if (projectName) {
          projectId = await resolveProjectId(client, projectName);
          if (!projectId) {
            res.status(400).json({ error: 'Unknown project' });
            return;
          }
        }
        const experiments = await client.listExperiments(projectId);
        res.json(experiments.map(e => normalizeExperiment(e, appUrl)));
      }),
    ),
  );

  router.get(
    '/experiments/:id/results',
    requireMgmt(client =>
      guarded('experiment results', async (req, res) => {
        const found = await client.getExperimentResults(req.params.id);
        res.json(
          found
            ? normalizeResults(found.experiment, found.result)
            : { available: false, variations: [] },
        );
      }),
    ),
  );

  router.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return router;
}
