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
import {
  handleApiError,
  createUnifiedErrorResponse,
  validateRepositoryParams,
} from '../utils';
import { validateRiskFilters } from '../validators';
import { ROUTER_PATH_RISKS } from '../../constants';

export interface RisksHandlerDependencies {
  dataService: ApiiroDataService;
  logger: LoggerService;
}

/**
 * Handler for listing risks/issues endpoint
 * Fetches all risks for a specific repository with optional filters
 */
export function createRisksHandler(deps: RisksHandlerDependencies) {
  return async (req: express.Request, res: express.Response) => {
    const { dataService, logger } = deps;

    try {
      if (!req.body || typeof req.body !== 'object') {
        logger.warn(`${ROUTER_PATH_RISKS} - Invalid or missing request body`);
        res
          .status(400)
          .json(createUnifiedErrorResponse(400, 'Invalid request body'));
        return;
      }

      const { repositoryKey, entityRef, filters = {} } = req.body;

      // Validate required fields using common validation function
      if (
        !validateRepositoryParams(
          { repositoryKey, entityRef },
          res,
          logger,
          ROUTER_PATH_RISKS,
        )
      ) {
        return;
      }

      logger.debug(`${ROUTER_PATH_RISKS} - Request received:`, {
        repositoryKey,
        entityRef,
        filters,
      });

      // Validate filters
      const filterValidation = validateRiskFilters(filters);
      if (!filterValidation.isValid) {
        logger.warn(`${ROUTER_PATH_RISKS} - Invalid filters provided:`, {
          filters,
          errors: filterValidation.errors,
        });
        res.status(400).json(
          createUnifiedErrorResponse(400, 'Invalid filters', {
            errors: filterValidation.errors,
          }),
        );
        return;
      }

      // Fetch risks for the repository
      logger.debug(`${ROUTER_PATH_RISKS} - Fetching risks for repository`, {
        repositoryKey,
      });
      const aggregated = await dataService.getAllRisks(
        repositoryKey,
        filterValidation.validatedFilters,
      );
      logger.debug(`${ROUTER_PATH_RISKS} - Successfully fetched risks:`, {
        totalCount: aggregated.totalCount,
      });
      res.json(aggregated);
    } catch (err: any) {
      handleApiError(err, res, logger, ROUTER_PATH_RISKS);
    }
  };
}
