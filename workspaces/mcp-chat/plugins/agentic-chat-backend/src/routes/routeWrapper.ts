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
import type express from 'express';
import type { LoggerService } from '@backstage/backend-plugin-api';

type SendRouteError = (
  res: express.Response,
  error: unknown,
  logLabel: string,
  userFacingError: string,
  extra?: Record<string, unknown>,
  statusCode?: number,
) => void;

/**
 * Creates a `withRoute` helper bound to the given logger and error sender.
 * Each route handler gets automatic info-level logging and a standard
 * try/catch that delegates to `sendRouteError`.
 *
 * Handlers that need custom error paths (409, 400, etc.) should handle
 * those internally and let unexpected errors bubble up to the wrapper.
 */
export function createWithRoute(
  logger: LoggerService,
  sendRouteError: SendRouteError,
) {
  return function withRoute(
    logLabel: string | ((req: express.Request) => string),
    userFacingError: string,
    handler: (req: express.Request, res: express.Response) => Promise<void>,
  ): (req: express.Request, res: express.Response) => Promise<void> {
    return async (req, res) => {
      const label = typeof logLabel === 'function' ? logLabel(req) : logLabel;
      logger.info(label);
      try {
        await handler(req, res);
      } catch (error) {
        sendRouteError(res, error, label, userFacingError, { success: false });
      }
    };
  };
}

/**
 * Sends a standardized 404 JSON response.
 */
export function notFound(res: express.Response, entity: string): void {
  res
    .status(404)
    .json({ error: `${entity} not found`, message: `${entity} not found` });
}
