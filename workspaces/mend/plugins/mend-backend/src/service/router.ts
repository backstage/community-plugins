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
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import type { Config } from '@backstage/config';
import {
  dataFindingParser,
  dataMatcher,
  dataProjectParser,
  fetchQueryPagination,
  parseEntityURL,
} from './data.service.helpers';
import { MendDataService } from './data.service';
import { MendAuthSevice } from './auth.service';
import {
  PaginationQueryParams,
  ProjectStatisticsSuccessResponseData,
  OrganizationProjectSuccessResponseData,
  CodeFindingSuccessResponseData,
  DependenciesFindingSuccessResponseData,
  ContainersFindingSuccessResponseData,
  Finding,
} from './data.service.types';
import { MEND_API_VERSION } from '../constants';

/** @internal */
export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  auth: AuthService;
  httpAuth: HttpAuthService;
};

enum ROUTE {
  PROJECT = '/project',
  FINDING = '/finding',
}

/** @internal */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, discovery, auth, httpAuth } = options;

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

  // Init catalog client
  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  /**
   * Filters project IDs based on mend.permissionControl configuration
   * @param projectItems - Array of project items to filter
   * @returns Filtered array of project items
   */
  const filterProjectsByPermissionControl = <T extends { uuid: string }>(
    projectItems: T[],
  ): T[] => {
    const permissionControl = config.getOptionalConfig(
      'mend.permissionControl',
    );

    if (!permissionControl) {
      // No permission control configured, return all items
      return projectItems;
    }

    const ids = permissionControl.getOptionalStringArray('ids') || [];
    const exclude = permissionControl.getOptionalBoolean('exclude') ?? true;

    if (ids.length === 0) {
      // No IDs configured, return all items
      return projectItems;
    }

    return projectItems.filter(item => {
      const isInList = ids.includes(item.uuid);
      // If exclude is true (blocklist mode): filter out items in the list
      // If exclude is false (allowlist mode): only include items in the list
      return exclude ? !isInList : isInList;
    });
  };

  // Routes
  router.get(ROUTE.PROJECT, checkForAuth, async (request, response) => {
    try {
      // service to service auth
      const credentials = await httpAuth.credentials(request);
      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: credentials,
        targetPluginId: 'catalog',
      });

      // entity to project match
      const results = await Promise.all([
        catalogClient.getEntities(
          { filter: [{ kind: ['Component'] }] },
          { token },
        ),
        fetchQueryPagination<ProjectStatisticsSuccessResponseData>(
          mendDataService.getProjectStatistics,
        ),
        fetchQueryPagination<OrganizationProjectSuccessResponseData>(
          mendDataService.getOrganizationProject,
        ),
      ]);

      // Apply permission control from config
      const filteredItems = filterProjectsByPermissionControl(results[1]);

      const data = dataMatcher(results[0].items, filteredItems);

      // parse data
      const projects = dataProjectParser(data, results[2]);

      response.json({
        ...projects,
        clientUrl: MendAuthSevice.getClientUrl(),
        clientName: MendAuthSevice.getClientName(),
      });
      // Allow any object structure here
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

      // entity to project match
      const uid = request.body.uid;

      if (!uid) {
        response.status(400).json({
          message: 'Oops! No UUID provided',
          clientUrl: MendAuthSevice.getClientUrl(),
          clientName: MendAuthSevice.getClientName(),
        });
        return;
      }

      const projectResult = await Promise.all([
        catalogClient.getEntities(
          { filter: [{ 'metadata.uid': uid }] },
          { token },
        ),
        fetchQueryPagination<ProjectStatisticsSuccessResponseData>(
          mendDataService.getProjectStatistics,
        ),
        fetchQueryPagination<OrganizationProjectSuccessResponseData>(
          mendDataService.getOrganizationProject,
        ),
      ]);

      // Apply permission control from config
      const filteredItems = filterProjectsByPermissionControl(projectResult[1]);

      const data = dataMatcher(projectResult[0].items, filteredItems);

      const entityURL = parseEntityURL(
        projectResult[0].items[0]?.metadata?.annotations?.[
          'backstage.io/source-location'
        ],
      );

      const projectSourceUrl = entityURL?.host
        ? `${entityURL.host}${entityURL.path}`
        : '';

      if (!data.length) {
        response.status(404).json({
          message:
            'Results for this repository are either unavailable on Mend or can not be accessed.',
          clientUrl: MendAuthSevice.getClientUrl(),
          clientName: MendAuthSevice.getClientName(),
        });
        return;
      }

      const findingList: Finding[] = [];

      for (const projectItem of data) {
        const params = {
          pathParams: {
            uuid: projectItem.uuid,
          },
        };

        // get project findings
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

        const tempFindingList: Finding[] = dataFindingParser(
          findingResult[0].filter(item => !item.suppressed), // NOTE: Do not show suppressed item
          findingResult[1].filter(
            item => !(item.findingInfo.status === 'IGNORED'),
            projectItem,
          ), // NOTE: Do not show ignored item
          findingResult[2], // ESC-51: Follow Jira activity
          projectItem.name,
        );
        findingList.push(...tempFindingList);
      }

      const projects = dataProjectParser(data, projectResult[2]);

      response.json({
        findingList,
        ...projects,
        projectSourceUrl,
        clientUrl: MendAuthSevice.getClientUrl(),
        clientName: MendAuthSevice.getClientName(),
      });
      // Allow any object structure here
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
