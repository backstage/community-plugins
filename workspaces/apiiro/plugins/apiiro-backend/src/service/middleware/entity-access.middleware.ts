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
import { EntityService } from '../entity.service';
import { handleApiError, createUnifiedErrorResponse } from '../utils';

/**
 * Middleware factory to validate entity access
 * This middleware runs after authentication and:
 * 1. Validates entityRef is provided in request
 * 2. Fetches the entity from the catalog
 * 3. Attaches the entity to the request for downstream use
 *
 * Note: Permission checking (annotation validation) should be done
 * by a separate permission-check middleware
 */
export function createEntityAccessMiddleware(
  entityService: EntityService,
  logger: LoggerService,
) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const endpoint = req.path;

    // Support both query params (GET) and body params (POST)
    const entityRef =
      (req.query.entityRef as string) || (req.body?.entityRef as string);

    if (!entityRef || typeof entityRef !== 'string') {
      logger.warn(`${endpoint} - Missing or invalid Entity Reference`, {
        entityRef,
      });
      res
        .status(400)
        .json(
          createUnifiedErrorResponse(
            400,
            'Entity Reference is required and must be a non-empty string',
          ),
        );
      return;
    }

    try {
      // Fetch entity from catalog
      const { entityResponse } = await entityService.getEntityByRef(
        req,
        entityRef,
      );

      if (!entityResponse) {
        logger.warn(`${endpoint} - No entity found`, {
          entityRef,
        });
        res
          .status(404)
          .json(
            createUnifiedErrorResponse(404, 'Entity not found', { entityRef }),
          );
        return;
      }

      // Attach entity to request for downstream use
      (req as any).entity = entityResponse;

      logger.debug(`${endpoint} - Entity fetched successfully`, {
        entityRef,
      });

      next();
    } catch (err: any) {
      logger.error(`${endpoint} - Error fetching entity:`, {
        entityRef,
        error: err.message,
      });
      handleApiError(err, res, logger, endpoint);
    }
  };
}
