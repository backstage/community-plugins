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
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { Entity } from '@backstage/catalog-model';
import { APIIRO_METRICS_VIEW_ANNOTATION } from '@backstage-community/plugin-apiiro-common';
import { createUnifiedErrorResponse } from '../utils';

/**
 * Middleware factory to check view permission annotation
 * This middleware runs after entity-access middleware and validates
 * that the entity has the required annotation for viewing metrics
 *
 * Prerequisites:
 * - Must run after authentication middleware
 * - Must run after entity-access middleware (expects req.entity to be set)
 */
export function createPermissionCheckMiddleware(
  config: Config,
  logger: LoggerService,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const endpoint = req.path;
    const entity = (req as any).entity as Entity | undefined;

    // Ensure entity exists (should be set by entity-access middleware)
    if (!entity) {
      logger.error(
        `${endpoint} - Permission check failed: No entity attached to request`,
      );
      res
        .status(500)
        .json(
          createUnifiedErrorResponse(
            500,
            'Internal Server Error: Entity not found in request context',
          ),
        );
      return;
    }

    // Extract entityRef for logging
    const entityRef =
      (req.query.entityRef as string) ||
      (req.body?.entityRef as string) ||
      'unknown';

    // Check if entity has the required annotation
    const hasAnnotation =
      entity.metadata?.annotations?.[APIIRO_METRICS_VIEW_ANNOTATION] === 'true';

    const defaultPermission =
      config.getOptionalBoolean('apiiro.defaultAllowMetricsView') ?? true;

    if (!hasAnnotation && !defaultPermission) {
      logger.warn(
        `${endpoint} - Permission denied: Entity does not have the access to view metrics for '${entityRef}'`,
        {
          entityRef,
          requiredAnnotation: APIIRO_METRICS_VIEW_ANNOTATION,
          entityAnnotations: entity.metadata?.annotations,
        },
      );
      res
        .status(403)
        .json(
          createUnifiedErrorResponse(
            403,
            `Forbidden: Entity does not have the access to view metrics for '${entityRef}'`,
          ),
        );
      return;
    }

    logger.debug(`${endpoint} - Permission check passed`, {
      entityRef,
      annotation: APIIRO_METRICS_VIEW_ANNOTATION,
    });

    next();
  };
}
