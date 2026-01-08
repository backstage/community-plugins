/*
 * Copyright 2026 The Backstage Authors
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
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { mssvViewPermission } from '@backstage-community/plugin-multi-source-security-viewer-common';
import {
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';

export async function createRouter({
  httpAuth,
  permissions,
}: {
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  const checkPermissions = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<void> => {
    try {
      const credentials = await httpAuth.credentials(req);
      const decision = (
        await permissions.authorize([{ permission: mssvViewPermission }], {
          credentials,
        })
      )[0];

      if (decision.result === AuthorizeResult.DENY) {
        res.status(403).json({
          error: 'UNAUTHORIZED, please ensure you have the correct permissions',
        });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
  router.use(checkPermissions);

  return router;
}
