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
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { ApiiroAuthService } from '../auth.service';
import { createUnifiedErrorResponse } from '../utils';

/**
 * Middleware to check for Apiiro authentication
 * Ensures that the Apiiro bearer token is available, connecting if necessary
 */
export function createAuthMiddleware(config: Config, logger: LoggerService) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (ApiiroAuthService.getBearerToken()) {
      next();
      return;
    }

    ApiiroAuthService.connect(config)
      .then(next)
      .catch(err => {
        logger.error('auth.connect', err);
        const statusCode = (err as any)?.status || 401;
        res
          .status(statusCode)
          .json(createUnifiedErrorResponse(statusCode, 'Unauthorized'));
      });
  };
}
