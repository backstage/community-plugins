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
import { Request, Response } from 'express';
import { LoggerService } from '@backstage/backend-plugin-api';
import { EntityService } from '../entity.service';
import { ApplicationCacheService } from '../application-cache.service';
import { handleApiError, createUnifiedErrorResponse } from '../utils';
import { validateApplicationFilters } from '../validators';
import { ROUTER_PATH_APPLICATIONS } from '../../constants';

export interface ApplicationsHandlerDependencies {
  entityService: EntityService;
  cacheService: ApplicationCacheService;
  logger: LoggerService;
}

/**
 * Handler for listing applications endpoint
 * Fetches applications from cache (or API if cache miss) and returns them
 */
export function createApplicationsHandler(
  deps: ApplicationsHandlerDependencies,
) {
  return async (req: Request, res: Response) => {
    const { cacheService, entityService, logger } = deps;

    try {
      // Validate request body if present for applicationId filter
      let applicationId: string | undefined;
      let entityRef: string | undefined;
      if (req.body && typeof req.body === 'object') {
        const filterValidation = validateApplicationFilters(req.body);
        if (!filterValidation.isValid) {
          logger.warn(
            `${ROUTER_PATH_APPLICATIONS} - Invalid filters provided:`,
            {
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

        const validatedFilters = filterValidation.validatedFilters;
        applicationId = validatedFilters?.applicationId;
        entityRef = validatedFilters?.entityRef;
      }

      logger.debug(`${ROUTER_PATH_APPLICATIONS} - Request received`, {
        applicationId,
      });

      let entities: any[];
      if (entityRef) {
        const { entityResponse } = await entityService.getEntityByRef(
          req,
          entityRef,
        );
        if (!entityResponse) {
          logger.warn(`${ROUTER_PATH_APPLICATIONS} - No entity found`, {
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
        const result = await entityService.getAllEntities(req, 'System');
        entities = result.entities;
      }

      // Get repositories from cache or API
      let applicationsResult: { applications: any[]; totalCount: number };

      if (applicationId) {
        // Specific application requested by key
        logger.debug(
          `${ROUTER_PATH_APPLICATIONS} - Fetching specific application by key`,
          { applicationId },
        );
        applicationsResult = await cacheService.getApplicationById(
          applicationId,
        );

        if (!applicationsResult) {
          res.status(404).json(
            createUnifiedErrorResponse(404, 'Application not found', {
              applicationId,
            }),
          );
          return;
        }
      } else {
        // All applications requested
        logger.debug(
          `${ROUTER_PATH_APPLICATIONS} - Fetching all applications from cache`,
        );
        applicationsResult = await cacheService.getAllApplications();
      }

      if (!applicationsResult) {
        res
          .status(500)
          .json(
            createUnifiedErrorResponse(500, 'Failed to fetch applications', {}),
          );
        return;
      }

      const cacheStats = await cacheService.getCacheStats();

      logger.info(`${ROUTER_PATH_APPLICATIONS} - Returning all applications`, {
        totalApplications: applicationsResult.totalCount,
        cacheStats: {
          ...cacheStats,
          lastUpdated: cacheStats.lastUpdated || null,
        },
      });
      // Match applications with Backstage entities
      const matchedResult = cacheService.matchWithEntities(
        applicationsResult.applications,
        entities,
      );

      res.json(matchedResult);
    } catch (err: any) {
      handleApiError(err, res, logger, ROUTER_PATH_APPLICATIONS);
    }
  };
}
