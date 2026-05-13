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

import type {
  HttpAuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import {
  InputError,
  NotFoundError,
  ServiceUnavailableError,
  ForwardedError,
} from '@backstage/errors';
import type {
  KubernetesClustersSupplier,
  KubernetesFetcher,
  AuthenticationStrategy,
} from '@backstage/plugin-kubernetes-node';
import express from 'express';
import Router from 'express-promise-router';
import { ArgoWorkflowsService } from './service/ArgoWorkflowsService';

/**
 * Options for creating the Argo Workflows backend router.
 *
 * @public
 */
export interface RouterOptions {
  config: RootConfigService;
  httpAuth: HttpAuthService;
  logger: LoggerService;
  /** Optional — required when any instance uses `kubernetes.clusterName`. */
  clusterSupplier?: KubernetesClustersSupplier;
  /** Optional — required when any instance uses `kubernetes.clusterName`. */
  fetcher?: KubernetesFetcher;
  /** Optional — required when any instance uses `kubernetes.clusterName`. */
  authStrategy?: AuthenticationStrategy;
}

/**
 * Maps a caught error to an appropriate HTTP status code.
 */
function getStatusCodeForError(error: unknown): number {
  if (error instanceof InputError) {
    return 400;
  }
  if (error instanceof NotFoundError) {
    return 404;
  }
  if (error instanceof ServiceUnavailableError) {
    return 503;
  }
  if (error instanceof ForwardedError) {
    return 502;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as any).statusCode === 'number'
  ) {
    return (error as any).statusCode;
  }
  return 500;
}

/**
 * Creates the Express router for the Argo Workflows backend plugin.
 *
 * @param options - Router dependencies
 * @returns An Express router with Argo Workflows API routes
 *
 * @public
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, httpAuth, logger, clusterSupplier, fetcher, authStrategy } =
    options;

  const service = new ArgoWorkflowsService({
    config,
    logger,
    clusterSupplier,
    fetcher,
    authStrategy,
  });

  const router = Router();
  router.use(express.json());

  // GET /instances — list configured instance names
  router.get(
    '/instances',
    async (_req: express.Request, res: express.Response) => {
      res.json({
        instances: service.getInstanceDetails(),
        defaultInstance: service.getDefaultInstance(),
      });
    },
  );

  // GET /workflows — list workflows filtered by label selector
  router.get(
    '/workflows',
    async (req: express.Request, res: express.Response) => {
      const labelSelector = (req.query.labelSelector as string) ?? '';
      const instanceName = (req.query.instanceName as string) ?? '';
      const namespace = (req.query.namespace as string) || undefined;

      try {
        const credentials = await httpAuth.credentials(req);
        const workflows = await service.listWorkflows(
          instanceName,
          labelSelector,
          namespace,
          credentials,
        );
        res.json({ workflows });
      } catch (error) {
        const statusCode = getStatusCodeForError(error);
        const message =
          error instanceof Error ? error.message : 'Erreur interne du serveur';
        logger.error(`GET /workflows failed (${statusCode}): ${message}`);
        res.status(statusCode).json({ error: message });
      }
    },
  );

  // GET /workflows/:namespace/:name — get a single workflow detail
  router.get(
    '/workflows/:namespace/:name',
    async (req: express.Request, res: express.Response) => {
      const { namespace, name } = req.params;
      const instanceName = (req.query.instanceName as string) ?? '';

      try {
        const credentials = await httpAuth.credentials(req);
        const workflow = await service.getWorkflow(
          instanceName,
          namespace,
          name,
          credentials,
        );
        res.json(workflow);
      } catch (error) {
        const statusCode = getStatusCodeForError(error);
        const message =
          error instanceof Error ? error.message : 'Erreur interne du serveur';
        logger.error(
          `GET /workflows/${namespace}/${name} failed (${statusCode}): ${message}`,
        );
        res.status(statusCode).json({ error: message });
      }
    },
  );

  return router;
}
