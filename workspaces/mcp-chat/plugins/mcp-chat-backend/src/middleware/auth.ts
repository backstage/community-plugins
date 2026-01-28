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

import { HttpAuthService } from '@backstage/backend-plugin-api';
import { Request, Response, NextFunction } from 'express';
import { validate as uuidValidate } from 'uuid';
import { isGuestUser } from '../utils';

/**
 * Extended Express Request with userId attached by auth middleware.
 */
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * Creates middleware that extracts user ID from Backstage auth and attaches to request.
 *
 * @param httpAuth - Backstage HTTP auth service
 * @returns Express middleware function
 */
export function createAuthMiddleware(httpAuth: HttpAuthService) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const credentials = await httpAuth.credentials(req, {
        allow: ['user'],
        allowLimitedAccess: true,
      });
      req.userId = credentials.principal.userEntityRef;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

/**
 * Middleware that requires the user to be a non-guest user.
 * Must be used after createAuthMiddleware.
 */
export function requireNonGuest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.userId || isGuestUser(req.userId)) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  return next();
}

/**
 * Creates middleware that validates a UUID parameter.
 *
 * @param paramName - Name of the route parameter to validate
 * @returns Express middleware function
 */
export function validateUuidParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params[paramName];
    if (!value || !uuidValidate(value)) {
      return res.status(400).json({ error: `Invalid ${paramName} format` });
    }
    return next();
  };
}
