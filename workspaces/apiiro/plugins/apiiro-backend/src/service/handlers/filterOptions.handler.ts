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
import { handleApiError } from '../utils';
import { ROUTER_PATH_FILTER_OPTIONS } from '../../constants';

export interface FilterOptionsHandlerDependencies {
  dataService: ApiiroDataService;
  logger: LoggerService;
}

/**
 * Handler for filter options endpoint.
 * Fetches filter options from Apiiro API.
 * The filtering based on defaultRiskFilters config is handled by ApiiroDataService.
 */
export function createFilterOptionsHandler(
  deps: FilterOptionsHandlerDependencies,
) {
  return async (_req: express.Request, res: express.Response) => {
    const { dataService, logger } = deps;

    try {
      logger.debug(`${ROUTER_PATH_FILTER_OPTIONS} - Fetching filter options`);

      // Fetch filter options (already filtered by defaultRiskFilters in data service)
      const filterOptions = await dataService.getFilterOptions();

      res.json(filterOptions);
    } catch (err: any) {
      handleApiError(err, res, logger, ROUTER_PATH_FILTER_OPTIONS);
    }
  };
}
