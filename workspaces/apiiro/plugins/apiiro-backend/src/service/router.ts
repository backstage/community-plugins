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
import * as express from 'express';
import Router from 'express-promise-router';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { Config } from '@backstage/config';
import {
  HttpAuthService,
  AuthService,
  LoggerService,
  DiscoveryService,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { ApiiroDataService } from './data.service';
import { EntityService } from './entity.service';
import { RepositoryCacheService } from './cache.service';
import {
  createAuthMiddleware,
  createEntityAccessMiddleware,
  createPermissionCheckMiddleware,
  createJsonErrorHandlerMiddleware,
  createContentTypeValidationMiddleware,
} from './middleware';
import {
  createRepositoriesHandler,
  createRisksHandler,
  createMttrStatisticsHandler,
  createRiskScoreOverTimeHandler,
  createSlaBreachHandler,
  createTopRisksHandler,
  createHealthHandler,
  createFilterOptionsHandler,
} from './handlers';
import {
  ROUTER_PATH_REPOSITORIES,
  ROUTER_PATH_RISKS,
  ROUTER_PATH_MTTR_STATISTICS,
  ROUTER_PATH_RISK_SCORE_OVER_TIME,
  ROUTER_PATH_SLA_BREACH,
  ROUTER_PATH_TOP_RISKS,
  ROUTER_PATH_FILTER_OPTIONS,
  ROUTER_PATH_HEALTH,
} from '../constants';

export type RouterOptions = {
  logger?: LoggerService;
  config: Config;
  auth: AuthService;
  discovery: DiscoveryService;
  httpAuth: HttpAuthService;
  cacheService?: RepositoryCacheService;
};

/**
 * Helper function to create a LoggerService from Console
 */
function toLoggerService(c: Console): LoggerService {
  return {
    info: (...args: any[]) => c.info(...args),
    warn: (...args: any[]) => c.warn(...args),
    error: (...args: any[]) => c.error(...args),
    debug: (...args: any[]) => c.debug(...args),
    child: () => toLoggerService(c),
  };
}

/**
 * Creates and configures the Express router for the Apiiro backend plugin
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, discovery, auth, httpAuth } = options;
  const logger = options.logger ?? toLoggerService(console);

  const router = Router();

  // Initialize services
  const dataService = ApiiroDataService.fromConfig(config, logger);
  const catalogClient = new CatalogClient({ discoveryApi: discovery });
  const entityService = new EntityService({
    httpAuth,
    auth,
    catalogClient,
    logger,
  });

  // Initialize cache service (either provided or create new)
  const cacheService =
    options.cacheService || new RepositoryCacheService(dataService, logger);

  // Initialize middleware
  const checkForAuth = createAuthMiddleware(config, logger);
  const checkEntityAccess = createEntityAccessMiddleware(entityService, logger);
  const checkViewPermission = createPermissionCheckMiddleware(config, logger);
  const jsonErrorHandler = createJsonErrorHandlerMiddleware(logger);

  // Apply global middleware
  // Add request size limit to prevent memory exhaustion attacks
  router.use(express.json({ limit: '1mb' }));
  router.use(createContentTypeValidationMiddleware);

  // Initialize handlers with dependencies
  const repositoriesHandler = createRepositoriesHandler({
    dataService,
    entityService,
    cacheService,
    logger,
  });

  const risksHandler = createRisksHandler({
    dataService,
    logger,
  });

  const mttrStatisticsHandler = createMttrStatisticsHandler({
    dataService,
    entityService,
    logger,
  });

  const riskScoreOverTimeHandler = createRiskScoreOverTimeHandler({
    dataService,
    entityService,
    logger,
  });

  const slaBreachHandler = createSlaBreachHandler({
    dataService,
    entityService,
    logger,
  });

  const topRisksHandler = createTopRisksHandler({
    dataService,
    entityService,
    logger,
  });

  const healthHandler = createHealthHandler({ logger });

  const filterOptionsHandler = createFilterOptionsHandler({
    dataService,
    logger,
  });

  // Define routes
  router.post(ROUTER_PATH_REPOSITORIES, checkForAuth, repositoriesHandler);

  router.post(ROUTER_PATH_RISKS, checkForAuth, checkEntityAccess, risksHandler);

  router.post(
    ROUTER_PATH_MTTR_STATISTICS,
    checkForAuth,
    checkEntityAccess,
    checkViewPermission,
    mttrStatisticsHandler,
  );

  router.post(
    ROUTER_PATH_RISK_SCORE_OVER_TIME,
    checkForAuth,
    checkEntityAccess,
    checkViewPermission,
    riskScoreOverTimeHandler,
  );

  router.post(
    ROUTER_PATH_SLA_BREACH,
    checkForAuth,
    checkEntityAccess,
    checkViewPermission,
    slaBreachHandler,
  );

  router.post(
    ROUTER_PATH_TOP_RISKS,
    checkForAuth,
    checkEntityAccess,
    checkViewPermission,
    topRisksHandler,
  );

  router.get(ROUTER_PATH_FILTER_OPTIONS, checkForAuth, filterOptionsHandler);

  router.get(ROUTER_PATH_HEALTH, healthHandler);

  // Handle 404 for undefined routes
  // This must be defined after all route handlers
  router.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      // Only handle if response hasn't been sent yet
      if (res.headersSent) {
        return next();
      }

      logger.warn('Route not found:', {
        method: req.method,
        path: req.path,
        url: req.url,
      });

      const response = {
        error: 'Not Found',
        details: {
          status: 404,
          error: `Route ${req.method} ${req.path} not found`,
        },
      };
      return res.status(404).json(response);
    },
  );

  // Apply custom error handling middleware
  // This catches ApiiroNotConfiguredError and JSON parsing errors
  router.use(jsonErrorHandler);

  // Apply default error handling middleware
  // This catches any remaining errors thrown by handlers or middleware
  const middleware = MiddlewareFactory.create({ logger, config });
  router.use(middleware.error());

  return router;
}
