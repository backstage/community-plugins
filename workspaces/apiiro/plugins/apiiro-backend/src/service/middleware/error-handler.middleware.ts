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
import { createUnifiedErrorResponse } from '../utils';
import { ApiiroNotConfiguredError } from '../utils/errors';

/**
 * Middleware to handle JSON parsing errors and Apiiro-specific errors
 */
export function createJsonErrorHandlerMiddleware(logger: LoggerService) {
  return (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void => {
    // Check if Apiiro is not configured - return 401
    if (err instanceof ApiiroNotConfiguredError) {
      logger.warn('Apiiro not configured:', {
        message: err.message,
        path: req.path,
        method: req.method,
      });

      const response = createUnifiedErrorResponse(401, 'Unauthorized', {
        message: err.message,
        name: err.name,
      });

      res.status(401).json(response);
      return;
    }

    // Check if it's a JSON parsing error from body-parser
    if (
      err instanceof SyntaxError &&
      (err as any).status === 400 &&
      'body' in err
    ) {
      logger.error('JSON parsing error:', {
        message: err.message,
        path: req.path,
        method: req.method,
      });

      const response = createUnifiedErrorResponse(400, 'Bad Request', {
        message: 'Invalid JSON in request body',
        name: err.name,
      });

      res.status(400).json(response);
      return;
    }

    // Pass other errors to next error handler
    next(err);
  };
}
