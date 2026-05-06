/*
 * Copyright 2025 The Backstage Authors
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
  LoggerService,
  DiscoveryService,
  AuthService,
  HttpAuthService,
  CacheService,
  SchedulerService,
} from '@backstage/backend-plugin-api';
import {
  CATALOG_FILTER_EXISTS,
  CatalogClient,
} from '@backstage/catalog-client';
import type { Config } from '@backstage/config';
import {
  dataFindingParser,
  fetchQueryPagination,
  parseEntityURL,
  generateEntityUrl,
} from './data.service.helpers';
import { MendDataService } from './data.service';
import { MendAuthSevice } from './auth.service';
import {
  PaginationQueryParams,
  CodeFindingSuccessResponseData,
  DependenciesFindingSuccessResponseData,
  ContainersFindingSuccessResponseData,
  Finding,
  Project,
} from './data.service.types';
import { MendCacheManager } from './cache.service';
import {
  MEND_API_VERSION,
  MEND_PROJECT_ANNOTATION,
  BACKSTAGE_SOURCE_LOCATION_ANNOTATION,
} from '../constants';

/** @internal */
export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  auth: AuthService;
  httpAuth: HttpAuthService;
  cache: CacheService;
  scheduler: SchedulerService;
};

enum ROUTE {
  PROJECT = '/project',
  FINDING = '/finding',
}

/** @internal */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, discovery, auth, httpAuth, cache, scheduler } =
    options;

  const router = Router();
  router.use(express.json());

  const checkForAuth = (
    _request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    // Check if activation key is configured
    if (!MendAuthSevice.isConfigured()) {
      response.status(401).json({
        name: 'ConfigurationError',
        message: MendAuthSevice.getConfigurationError(),
      });
      return;
    }

    if (MendAuthSevice.getAuthToken()) {
      next();
      return;
    }

    MendAuthSevice.connect()
      .then(next)
      .catch(err => {
        const errorMessage =
          err instanceof Error ? err?.message : err?.statusText;
        logger.error(errorMessage || 'Oops! Unauthorized');
        response
          .status(err?.status || 401)
          .json({ error: err?.statusText || 'Oops! Unauthorized' });
      });
  };

  const activationKey = config.getOptionalString('mend.activationKey') ?? '';

  // Init auth service with logger (logs warning if activation key is missing/invalid)
  MendAuthSevice.init({
    apiVersion: MEND_API_VERSION,
    activationKey,
    logger,
  });

  // Init api service
  const mendDataService = new MendDataService({
    apiVersion: MEND_API_VERSION,
    activationKey,
    logger,
  });

  // Init cache manager with scheduler
  const mendCacheManager = new MendCacheManager(
    config,
    cache,
    logger,
    scheduler,
    mendDataService,
  );

  // Init catalog client
  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  // Routes
  router.get(ROUTE.PROJECT, checkForAuth, async (request, response) => {
    try {
      // service to service auth
      const credentials = await httpAuth.credentials(request);
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'catalog',
      });

      // Get all entities with mend annotation and cached projects
      const [entities, projectsById] = await Promise.all([
        catalogClient.getEntities(
          {
            filter: [
              {
                kind: 'Component',
                [`metadata.annotations.${MEND_PROJECT_ANNOTATION}`]:
                  CATALOG_FILTER_EXISTS,
              },
            ],
          },
          { token },
        ),
        mendCacheManager.getProjectsById(),
      ]);

      // Build project list from entities with annotations
      const projectList: (Project & { entityUrl?: string })[] = [];

      for (const entity of entities.items) {
        const projectIdsAnnotation =
          entity.metadata.annotations?.[MEND_PROJECT_ANNOTATION];
        if (!projectIdsAnnotation) continue;

        const projectIds = projectIdsAnnotation
          .split(',')
          .map(id => id.trim())
          .filter(id => id.length > 0);

        const entityUrl = generateEntityUrl(entity) ?? undefined;

        for (const projectId of projectIds) {
          const project = projectsById[projectId];
          if (project) {
            projectList.push({ ...project, entityUrl });
          }
        }
      }

      // Sort by critical severity (descending)
      projectList.sort((a, b) => b.statistics.critical - a.statistics.critical);

      response.json({
        projectList,
        clientUrl: MendAuthSevice.getClientUrl(),
        clientName: MendAuthSevice.getClientName(),
      });
    } catch (error: any) {
      logger.error('/project', error);
      response.status(500).json({ error: 'Oops! Please try again later.' });
    }
  });

  router.post(ROUTE.FINDING, checkForAuth, async (request, response) => {
    try {
      // service to service auth
      const credentials = await httpAuth.credentials(request);
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'catalog',
      });

      const uid = request.body.uid;
      let projectId = request.body.projectId;

      if (!uid) {
        response.status(400).json({
          message: 'Oops! No UUID provided',
          clientUrl: MendAuthSevice.getClientUrl(),
          clientName: MendAuthSevice.getClientName(),
        });
        return;
      }

      // Get entity and cached projects
      const [entityResult, projectsById] = await Promise.all([
        catalogClient.getEntities(
          { filter: [{ 'metadata.uid': uid }] },
          { token },
        ),
        mendCacheManager.getProjectsById(),
      ]);

      const entity = entityResult.items[0];
      if (!entity) {
        response.status(404).json({
          message: 'Entity not found.',
          clientUrl: MendAuthSevice.getClientUrl(),
          clientName: MendAuthSevice.getClientName(),
        });
        return;
      }

      // Get project IDs from annotation
      const projectIdsAnnotation =
        entity.metadata.annotations?.[MEND_PROJECT_ANNOTATION];

      if (!projectIdsAnnotation) {
        response.status(404).json({
          message:
            'Results for this repository unavailable on Mend or cannot be accessed.',
          clientUrl: MendAuthSevice.getClientUrl(),
          clientName: MendAuthSevice.getClientName(),
        });
        return;
      }

      const projectIds = projectIdsAnnotation
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      // Verify that the requested project ID is associated with this entity
      if (projectId && !projectIds.includes(projectId)) {
        response.status(403).json({
          message:
            'Provided Mend project ID is not associated with this entity.',
          clientUrl: MendAuthSevice.getClientUrl(),
          clientName: MendAuthSevice.getClientName(),
        });
        return;
      }

      // Get all projects for this entity
      const allEntityProjects: Project[] = projectIds
        .map(id => projectsById[id])
        .filter((p): p is Project => p !== undefined);

      if (allEntityProjects.length === 0) {
        response.status(404).json({
          message:
            'Results for this repository are either unavailable on Mend or cannot be accessed.',
          clientUrl: MendAuthSevice.getClientUrl(),
          clientName: MendAuthSevice.getClientName(),
        });
        return;
      }

      // If no projectId provided, use the first project
      if (!projectId) {
        projectId = allEntityProjects[0].uuid;
      }

      // Get the specific project by ID
      const project = projectsById[projectId];

      if (!project) {
        response.status(404).json({
          message:
            'Results for this repository are either unavailable on Mend or cannot be accessed.',
          clientUrl: MendAuthSevice.getClientUrl(),
          clientName: MendAuthSevice.getClientName(),
        });
        return;
      }

      // Get projectSourceUrl from entity
      const entityURL = parseEntityURL(
        entity.metadata.annotations?.[BACKSTAGE_SOURCE_LOCATION_ANNOTATION],
      );
      const projectSourceUrl = entityURL?.host
        ? `${entityURL.host}${entityURL.path}`
        : '';

      // Fetch findings for the specific project
      const params = {
        pathParams: {
          uuid: project.uuid,
        },
      };

      const findingResult = await Promise.all([
        fetchQueryPagination<CodeFindingSuccessResponseData>(
          (queryParam: PaginationQueryParams) =>
            mendDataService.getCodeFinding({
              ...params,
              ...queryParam,
            }),
        ),
        fetchQueryPagination<DependenciesFindingSuccessResponseData>(
          (queryParam: PaginationQueryParams) =>
            mendDataService.getDependenciesFinding({
              ...params,
              ...queryParam,
            }),
        ),
        fetchQueryPagination<ContainersFindingSuccessResponseData>(
          (queryParam: PaginationQueryParams) =>
            mendDataService.getContainersFinding({
              ...params,
              ...queryParam,
            }),
        ),
      ]);

      const findingList: Finding[] = dataFindingParser(
        findingResult[0].filter(item => !item.suppressed),
        findingResult[1].filter(
          item => !(item.findingInfo.status === 'IGNORED'),
        ),
        findingResult[2],
        project.name,
      );

      response.json({
        findingList,
        projectList: allEntityProjects,
        selectedProject: project,
        projectSourceUrl,
        clientUrl: MendAuthSevice.getClientUrl(),
        clientName: MendAuthSevice.getClientName(),
      });
    } catch (error: any) {
      logger.error('/finding', error);
      response.status(500).json({ error: 'Oops! Please try again later.' });
    }
  });

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
