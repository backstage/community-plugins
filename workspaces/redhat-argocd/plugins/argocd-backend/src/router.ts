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
import {
  HttpAuthService,
  LoggerService,
  PermissionsService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import Router from 'express-promise-router';
import { ArgoCDService } from './services/ArgoCDService';
import { argocdViewPermission } from '@backstage-community/plugin-redhat-argocd-common';

interface RouterOptions {
  argoCDService?: ArgoCDService;
  httpAuth: HttpAuthService;
  logger: LoggerService;
  config: RootConfigService;
  permissions: PermissionsService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { httpAuth, logger, config, permissions } = options;
  const service = options.argoCDService ?? new ArgoCDService(config, logger);

  const router = Router();
  router.use(express.json());

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: [argocdViewPermission],
  });

  const checkPermission = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const credentials = await httpAuth.credentials(req);
      const decision = (
        await permissions.authorize([{ permission: argocdViewPermission }], {
          credentials,
        })
      )[0];
      if (decision.result === AuthorizeResult.DENY) {
        res.status(403).json({
          error: 'Unauthorized, please ensure you have the correct permissions',
        });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };

  router.use(permissionIntegrationRouter);
  router.use('/argoInstance', checkPermission);

  router.get(
    '/argoInstance/:instanceName/applications/selector/:selector',
    async (req: express.Request, res: express.Response) => {
      const { instanceName, selector } = req.params;
      const { project, appNamespace } = req.query;
      const result = await service.listArgoApps(instanceName, {
        selector: selector,
        project: project as string,
        appNamespace: appNamespace as string,
      });
      return res.json(result);
    },
  );

  router.get(
    '/argoInstance/:instanceName/applications/:appName',
    async (req: express.Request, res: express.Response) => {
      const { instanceName, appName } = req.params;
      const { appNamespace, project } = req.query;

      const result = await service.getApplication(instanceName, {
        appName,
        appNamespace: appNamespace as string,
        project: project as string,
      });
      return res.json(result);
    },
  );

  router.get(
    '/argoInstance/:instanceName/applications/name/:appName/revisions/:revisionID/metadata',
    async (req: express.Request, res: express.Response) => {
      const { instanceName, appName, revisionID } = req.params;
      const { appNamespace, sourceIndex } = req.query;
      const result = await service.getRevisionDetails(
        instanceName,
        appName,
        revisionID,
        {
          appNamespace: appNamespace as string,
          sourceIndex: sourceIndex as string,
        },
      );
      return res.json(result);
    },
  );

  return router;
}
