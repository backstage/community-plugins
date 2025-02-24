/*
 * Copyright 2024 The Backstage Authors
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
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import {
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import { InputError, NotAllowedError } from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  blackduckPermissions,
  blackduckRiskProfileReadPermission,
  blackduckVulnerabilitiesReadPermission,
} from '@backstage-community/plugin-blackduck-common';
import {
  BlackDuckRestApi,
  BlackDuckConfig,
} from '@backstage-community/plugin-blackduck-node';

/** @internal */
export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  permissions: PermissionsService;
  discovery: DiscoveryService;
  httpAuth: HttpAuthService;
  blackDuckConfig: BlackDuckConfig;
}

/** @internal */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, permissions, config, blackDuckConfig, httpAuth } = options;
  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: blackduckPermissions,
  });

  const router = Router();
  router.use(express.json());
  router.use(permissionIntegrationRouter);

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.post(
    '/risk-profile/:hostKey/:projectName/:projectVersion',
    async (_request, response) => {
      logger.debug('getting vulnarabilities..');
      const { hostKey, projectName, projectVersion } = _request.params;

      if (!hostKey || !projectName || !projectVersion) {
        response.status(400).json({
          message: 'The hostKey, projectName and projectVersion are required',
        });
        return;
      }

      let host: string;
      let token: string;

      try {
        const hostConfig = blackDuckConfig.getHostConfigByName(hostKey);
        host = hostConfig.host;
        token = hostConfig.token;
      } catch (error) {
        response.status(400).json({
          message: 'The hostKey is not valid.',
        });
        return;
      }

      const credentials = await httpAuth.credentials(_request);
      const entityRef = _request.body.entityRef;
      logger.info('getting risk profile for project: ', entityRef);
      if (typeof entityRef !== 'string') {
        throw new InputError('Invalid entityRef, not a string');
      }

      const decision = (
        await permissions.authorize(
          [
            {
              permission: blackduckRiskProfileReadPermission,
              resourceRef: entityRef,
            },
          ],
          {
            credentials,
          },
        )
      )[0];

      if (decision.result !== AuthorizeResult.ALLOW) {
        throw new NotAllowedError('Unauthorized');
      }

      const blackDuck = new BlackDuckRestApi(logger, host, token);

      await blackDuck.auth();
      const risk_profile = await blackDuck.getRiskProfile(
        projectName,
        projectVersion,
      );
      response.json(risk_profile);
    },
  );

  router.post(
    '/vulns/:hostKey/:projectName/:projectVersion',
    async (_request, response) => {
      const { hostKey, projectName, projectVersion } = _request.params;
      const credentials = await httpAuth.credentials(_request);
      const entityRef = _request.body.entityRef;
      logger.info('getting vulnarabilities for project: ', entityRef);
      if (typeof entityRef !== 'string') {
        throw new InputError('Invalid entityRef, not a string');
      }

      if (!hostKey || !projectName || !projectVersion) {
        response.status(400).json({
          message: 'The hostKey, projectName and projectVersion are required',
        });
        return;
      }

      let host: string;
      let token: string;

      try {
        const hostConfig = blackDuckConfig.getHostConfigByName(hostKey);
        host = hostConfig.host;
        token = hostConfig.token;
      } catch (error) {
        response.status(400).json({
          message: 'The hostKey is not valid.',
        });
        return;
      }

      const decision = (
        await permissions.authorize(
          [
            {
              permission: blackduckVulnerabilitiesReadPermission,
              resourceRef: entityRef,
            },
          ],
          {
            credentials,
          },
        )
      )[0];
      logger.info('decision', decision);
      if (decision.result !== AuthorizeResult.ALLOW) {
        throw new NotAllowedError('Unauthorized');
      }

      const blackDuck = new BlackDuckRestApi(logger, host, token);

      await blackDuck.auth();
      const vulns = await blackDuck.getVulnerableComponents(
        projectName,
        projectVersion,
      );
      response.json(vulns);
    },
  );

  router.use(middleware.error());
  return router;
}
