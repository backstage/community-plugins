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
import { createUnifiedErrorResponse } from '../utils';

/**
 * Middleware to validate Content-Type header for POST/PUT/PATCH requests
 * Ensures that requests with body data have proper Content-Type header
 */
export function createContentTypeValidationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Only check POST, PUT, PATCH requests with body
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');

    if (!contentType) {
      res
        .status(400)
        .json(
          createUnifiedErrorResponse(
            400,
            'Content-Type header is required for requests with body',
          ),
        );
      return;
    }

    // Check if Content-Type is application/json (may include charset)
    if (!contentType.toLowerCase().includes('application/json')) {
      res
        .status(415)
        .json(
          createUnifiedErrorResponse(
            415,
            'Unsupported Media Type. Content-Type must be application/json',
            { providedContentType: contentType },
          ),
        );
      return;
    }
  }

  next();
}
