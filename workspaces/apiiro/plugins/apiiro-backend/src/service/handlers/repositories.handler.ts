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
import { Request, Response } from 'express';
import { LoggerService } from '@backstage/backend-plugin-api';
import { ApiiroDataService } from '../data.service';
import { EntityService } from '../entity.service';
import { RepositoryCacheService } from '../cache.service';
import { handleApiError, createUnifiedErrorResponse } from '../utils';
import { validateRepositoryFilters } from '../validators';
import { ROUTER_PATH_REPOSITORIES } from '../../constants';

export interface RepositoriesHandlerDependencies {
  dataService: ApiiroDataService;
  entityService: EntityService;
  cacheService: RepositoryCacheService;
  logger: LoggerService;
}

/**
 * Handler for listing repositories endpoint
 * Fetches repositories from cache (or API if cache miss) and matches them with Backstage entities
 */
export function createRepositoriesHandler(
  deps: RepositoriesHandlerDependencies,
) {
  return async (req: Request, res: Response) => {
    const { cacheService, entityService, logger } = deps;

    try {
      // Validate request body if present for repositoryId filter
      let repositoryId: string | undefined;
      let applicationId: string | undefined;
      let entityRef: string | undefined;
      if (req.body && typeof req.body === 'object') {
        const filterValidation = validateRepositoryFilters(req.body);
        if (!filterValidation.isValid) {
          logger.warn(
            `${ROUTER_PATH_REPOSITORIES} - Invalid filters provided:`,
            {
              filters: req.body,
              errors: filterValidation.errors,
            },
          );
          res.status(400).json(
            createUnifiedErrorResponse(400, 'Invalid filters', {
              errors: filterValidation.errors,
            }),
          );
          return;
        }
        repositoryId = filterValidation.validatedFilters?.repositoryId;
        applicationId = filterValidation.validatedFilters?.applicationId;
        entityRef = filterValidation.validatedFilters?.entityRef;
      }

      logger.debug(
        `${ROUTER_PATH_REPOSITORIES} - Request received with query parameters:`,
        { repositoryId, applicationId, entityRef },
      );

      // Fetch entities (always fresh, as they might change frequently)
      let entities: any[];
      if (entityRef) {
        const { entityResponse } = await entityService.getEntityByRef(
          req,
          entityRef,
        );
        if (!entityResponse) {
          logger.warn(`${ROUTER_PATH_REPOSITORIES} - No entity found`, {
            entityRef,
          });
          res.status(404).json(
            createUnifiedErrorResponse(404, 'Entity not found', {
              entityRef,
            }),
          );
          return;
        }
        entities = [entityResponse];
      } else {
        const result = await entityService.getAllEntities(req, 'Component');
        entities = result.entities;
      }

      // Get repositories from cache or API
      let repositoriesResult: { repositories: any[]; totalCount: number };

      if (repositoryId) {
        // Specific repository requested - use cache with Key filtering
        logger.debug(
          `${ROUTER_PATH_REPOSITORIES} - Fetching specific repository by Key`,
          { repositoryId },
        );
        repositoriesResult = await cacheService.getRepositoriesById(
          repositoryId,
        );
      } else if (applicationId) {
        // All repositories for specific application requested
        logger.debug(
          `${ROUTER_PATH_REPOSITORIES} - Fetching all repositories for application`,
          { applicationId },
        );
        repositoriesResult = await cacheService.getAllRepositories(
          applicationId,
        );
      } else {
        // All repositories requested - use cache
        logger.debug(
          `${ROUTER_PATH_REPOSITORIES} - Fetching all repositories from cache`,
        );
        repositoriesResult = await cacheService.getAllRepositories();
      }

      if (!repositoriesResult) {
        res
          .status(500)
          .json(
            createUnifiedErrorResponse(500, 'Failed to fetch repositories', {}),
          );
        return;
      }

      const cacheStats = await cacheService.getCacheStats();

      logger.debug(`${ROUTER_PATH_REPOSITORIES} - Fetched data:`, {
        entitiesCount: entities.length,
        repositoriesCount: repositoriesResult.totalCount,
        cacheStats: {
          ...cacheStats,
          lastUpdated: cacheStats.lastUpdated || null,
        },
      });

      // Match repositories with Backstage entities
      const matchedResult = cacheService.matchWithEntities(
        repositoriesResult.repositories,
        entities,
      );

      res.json(matchedResult);
    } catch (err: any) {
      handleApiError(err, res, logger, ROUTER_PATH_REPOSITORIES);
    }
  };
}
