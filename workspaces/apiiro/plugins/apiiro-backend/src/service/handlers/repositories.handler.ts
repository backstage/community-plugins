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
  return async (req: express.Request, res: express.Response) => {
    const { cacheService, entityService, logger } = deps;

    try {
      // Validate request body if present for repositoryKey filter
      let repositoryKey: string | undefined;
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
        repositoryKey = filterValidation.validatedFilters?.repositoryKey;
        entityRef = filterValidation.validatedFilters?.entityRef;
      }

      logger.debug(
        `${ROUTER_PATH_REPOSITORIES} - Request received with repositoryKey filter:`,
        { repositoryKey },
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
        const result = await entityService.getAllEntities(req);
        entities = result.entities;
      }

      // Get repositories from cache or API
      let repositoriesResult: { repositories: any[]; totalCount: number };

      if (repositoryKey) {
        // Specific repository requested - use cache with URL filtering
        logger.debug(
          `${ROUTER_PATH_REPOSITORIES} - Fetching specific repository by URL`,
          { repositoryKey },
        );
        repositoriesResult = await cacheService.getRepositoriesByKey(
          repositoryKey,
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

      logger.debug(`${ROUTER_PATH_REPOSITORIES} - Fetched data:`, {
        entitiesCount: entities.length,
        repositoriesCount: repositoriesResult.totalCount,
        cacheStats: {
          ...cacheService.getCacheStats(),
          lastUpdated:
            cacheService.getCacheStats().lastUpdated?.toISOString() || null,
        },
      });

      // Match repositories with Backstage entities
      const matchedResult = cacheService.matchWithEntities(
        repositoriesResult.repositories,
        entities,
      );

      logger.info(
        `${ROUTER_PATH_REPOSITORIES} - Final filtered repositories:`,
        {
          totalEntities: entities.length,
          totalRepositories: repositoriesResult.totalCount,
          matchedRepositories: matchedResult.totalCount,
        },
      );

      res.json(matchedResult);
    } catch (err: any) {
      handleApiError(err, res, logger, ROUTER_PATH_REPOSITORIES);
    }
  };
}
