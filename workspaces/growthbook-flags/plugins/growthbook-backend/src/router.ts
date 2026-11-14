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
import type { Router as ExpressRouter } from 'express';
import type { GrowthbookClient } from './client';
import type { SdkFlagsSource } from './sdkSource';
import {
  normalizeExperiment,
  normalizeFlagDetail,
  normalizeResults,
} from './helpers';

/** Options for the router used when `growthbook.secretKey` is configured. */
export type ManagementRouterOptions = {
  logger: LoggerService;
  /** URL of the GrowthBook web app, used to build links to experiments. */
  appUrl: string;
  client: GrowthbookClient;
};

/** Options for the router used when only `growthbook.sdkKeys` are configured. */
export type SdkRouterOptions = {
  sdk: SdkFlagsSource;
};

/** Router backed by the GrowthBook Management API. */
export function createManagementRouter(
  options: ManagementRouterOptions,
): ExpressRouter {
  const { logger, appUrl, client } = options;
  const router = Router();

  /** Resolves an optional `?project=` name to a project id. */
  async function resolveProject(
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
    const projects = await client.listProjects();
    res.json({ projects: projects.map(p => p.name) });
  });

  router.get('/flags', async (req, res) => {
    const env = (req.query.env as string) || 'prod';
    const projectId = await resolveProject(req.query.project as string);
    res.json(await client.getFlags(env, projectId));
  });

  router.get('/flags/:key', async (req, res) => {
    const key = req.params.key;
    const feature = await client.getFeature(key);
    if (!feature) {
      throw new NotFoundError('Flag not found');
    }
    const stale = await client.getStale(key).catch(err => {
      logger.warn(`Failed to fetch GrowthBook stale status for ${key}: ${err}`);
      return undefined;
    });
    res.json(normalizeFlagDetail(feature, stale));
  });

  router.get('/experiments', async (req, res) => {
    const projectId = await resolveProject(req.query.project as string);
    const experiments = await client.listExperiments(projectId);
    res.json(experiments.map(e => normalizeExperiment(e, appUrl)));
  });

  router.get('/experiments/:id/results', async (req, res) => {
    const found = await client.getExperimentResults(req.params.id);
    res.json(
      found
        ? normalizeResults(found.experiment, found.result)
        : { available: false, variations: [] },
    );
  });

  return router;
}

/**
 * Router backed by the public SDK endpoints. Projects, experiments and flag
 * details need the Management API, so those answer 501.
 */
export function createSdkRouter(options: SdkRouterOptions): ExpressRouter {
  const { sdk } = options;
  const router = Router();

  router.get('/projects', (_req, res) => {
    res.json({ projects: [] });
  });

  router.get('/flags', async (req, res) => {
    if (req.query.project) {
      throw new InputError('Project filtering is not supported in SDK mode');
    }
    const flags = await sdk.getFlags((req.query.env as string) || 'prod');
    if (!flags) {
      throw new InputError('Unknown environment');
    }
    res.json(flags);
  });

  router.get(
    ['/flags/:key', '/experiments', '/experiments/:id/results'],
    (_req, res) => {
      res.status(501).json({
        error: 'This endpoint requires growthbook.secretKey to be configured',
      });
    },
  );

  return router;
}
