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
import {
  handleApiError,
  createUnifiedErrorResponse,
  validateRepositoryParams,
} from '../utils';
import {
  ROUTER_PATH_MTTR_STATISTICS,
  ROUTER_PATH_RISK_SCORE_OVER_TIME,
  ROUTER_PATH_SLA_BREACH,
  ROUTER_PATH_TOP_RISKS,
} from '../../constants';

export interface StatisticsHandlerDependencies {
  dataService: ApiiroDataService;
  entityService: EntityService;
  logger: LoggerService;
}

/**
 * Handler for MTTR vs SLA statistics endpoint
 */
export function createMttrStatisticsHandler(
  deps: StatisticsHandlerDependencies,
) {
  return async (req: Request, res: Response) => {
    const { dataService, entityService, logger } = deps;

    try {
      await entityService.getCredentialsAndToken(req);

      if (!req.body || typeof req.body !== 'object') {
        logger.warn(
          `${ROUTER_PATH_MTTR_STATISTICS} - Invalid or missing request body`,
        );
        res
          .status(400)
          .json(createUnifiedErrorResponse(400, 'Invalid request body'));
        return;
      }

      const { repositoryKey, entityRef } = req.body;

      // Validate required fields using common validation function
      if (
        !validateRepositoryParams(
          { repositoryKey, entityRef },
          res,
          logger,
          ROUTER_PATH_MTTR_STATISTICS,
        )
      ) {
        return;
      }

      // Fetch MTTR statistics for the repository
      logger.debug(
        `${ROUTER_PATH_MTTR_STATISTICS} - Fetching MTTR statistics for repository`,
        { repositoryKey },
      );
      const mttrData = await dataService.getMttrStatistics(
        repositoryKey as string,
      );
      logger.debug(
        `${ROUTER_PATH_MTTR_STATISTICS} - Successfully fetched MTTR statistics`,
        {
          dataLength: mttrData.length,
        },
      );
      res.json(mttrData);
    } catch (err: any) {
      handleApiError(err, res, logger, ROUTER_PATH_MTTR_STATISTICS);
    }
  };
}

/**
 * Handler for risk score over time statistics endpoint
 */
export function createRiskScoreOverTimeHandler(
  deps: StatisticsHandlerDependencies,
) {
  return async (req: Request, res: Response) => {
    const { dataService, entityService, logger } = deps;

    try {
      await entityService.getCredentialsAndToken(req);

      if (!req.body || typeof req.body !== 'object') {
        logger.warn(
          `${ROUTER_PATH_RISK_SCORE_OVER_TIME} - Invalid or missing request body`,
        );
        res
          .status(400)
          .json(createUnifiedErrorResponse(400, 'Invalid request body'));
        return;
      }

      const { repositoryKey, entityRef } = req.body;

      // Validate required fields using common validation function
      if (
        !validateRepositoryParams(
          { repositoryKey, entityRef },
          res,
          logger,
          ROUTER_PATH_RISK_SCORE_OVER_TIME,
        )
      ) {
        return;
      }

      // Fetch risk score over time data for the repository
      logger.debug(
        `${ROUTER_PATH_RISK_SCORE_OVER_TIME} - Fetching risk score over time data for repository`,
        { repositoryKey },
      );
      const riskScoreData = await dataService.getRiskScoreOverTime(
        repositoryKey as string,
      );
      logger.debug(
        `${ROUTER_PATH_RISK_SCORE_OVER_TIME} - Successfully fetched risk score over time data`,
        {
          dataLength: riskScoreData.length,
        },
      );
      res.json(riskScoreData);
    } catch (err: any) {
      handleApiError(err, res, logger, ROUTER_PATH_RISK_SCORE_OVER_TIME);
    }
  };
}

/**
 * Handler for SLA breach statistics endpoint
 */
export function createSlaBreachHandler(deps: StatisticsHandlerDependencies) {
  return async (req: Request, res: Response) => {
    const { dataService, entityService, logger } = deps;

    try {
      await entityService.getCredentialsAndToken(req);

      if (!req.body || typeof req.body !== 'object') {
        logger.warn(
          `${ROUTER_PATH_SLA_BREACH} - Invalid or missing request body`,
        );
        res
          .status(400)
          .json(createUnifiedErrorResponse(400, 'Invalid request body'));
        return;
      }

      const { repositoryKey, entityRef } = req.body;

      // Validate required fields using common validation function
      if (
        !validateRepositoryParams(
          { repositoryKey, entityRef },
          res,
          logger,
          ROUTER_PATH_SLA_BREACH,
        )
      ) {
        return;
      }

      // Fetch SLA breach data for the repository
      logger.debug(
        `${ROUTER_PATH_SLA_BREACH} - Fetching SLA breach data for repository`,
        { repositoryKey },
      );
      const slaBreachData = await dataService.getSlaBreachStatistics(
        repositoryKey as string,
      );
      logger.debug(
        `${ROUTER_PATH_SLA_BREACH} - Successfully fetched SLA breach data`,
        {
          dataLength: slaBreachData.length,
        },
      );
      res.json(slaBreachData);
    } catch (err: any) {
      handleApiError(err, res, logger, ROUTER_PATH_SLA_BREACH);
    }
  };
}

/**
 * Handler for top risks statistics endpoint
 */
export function createTopRisksHandler(deps: StatisticsHandlerDependencies) {
  return async (req: Request, res: Response) => {
    const { dataService, entityService, logger } = deps;

    try {
      await entityService.getCredentialsAndToken(req);

      if (!req.body || typeof req.body !== 'object') {
        logger.warn(
          `${ROUTER_PATH_TOP_RISKS} - Invalid or missing request body`,
        );
        res
          .status(400)
          .json(createUnifiedErrorResponse(400, 'Invalid request body'));
        return;
      }

      const { repositoryKey, entityRef } = req.body;

      // Validate required fields using common validation function
      if (
        !validateRepositoryParams(
          { repositoryKey, entityRef },
          res,
          logger,
          ROUTER_PATH_TOP_RISKS,
        )
      ) {
        return;
      }

      // Fetch top risks statistics for the repository
      logger.debug(
        `${ROUTER_PATH_TOP_RISKS} - Fetching top risks statistics for repository`,
        {
          repositoryKey,
          entityRef,
        },
      );
      const topRisksData = await dataService.getTopRisksStatistics(
        repositoryKey as string,
      );
      logger.debug(
        `${ROUTER_PATH_TOP_RISKS} - Successfully fetched top risks statistics`,
        {
          dataLength: topRisksData.length,
        },
      );
      res.json(topRisksData);
    } catch (err: any) {
      handleApiError(err, res, logger, ROUTER_PATH_TOP_RISKS);
    }
  };
}
