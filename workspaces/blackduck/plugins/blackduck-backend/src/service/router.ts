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
import { createLegacyAuthAdapters } from '@backstage/backend-common';
import {
  blackduckPermissions,
  blackduckRiskProfileReadPermission,
  blackduckVulnerabilitiesReadPermission,
} from '@backstage-community/plugin-blackduck-common';
import { BlackDuckRestApi } from '../api/BlackDuckRestApi';

/** @public */
export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  permissions: PermissionsService;
  discovery: DiscoveryService;
  httpAuth?: HttpAuthService;
}

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, permissions } = options;
  const { httpAuth } = createLegacyAuthAdapters(options);
  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: blackduckPermissions,
  });

  const bdConfig = config.getConfig('blackduck');
  const bdHost = bdConfig.getString('host');
  const bdToken = bdConfig.getString('token');

  const router = Router();
  router.use(express.json());
  router.use(permissionIntegrationRouter);

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.post(
    '/risk-profile/:projectName/:projectVersion',
    async (_request, response) => {
      logger.debug('getting vulnarabilities..');
      const { projectName, projectVersion } = _request.params;
      const blackDuck = new BlackDuckRestApi(logger, bdHost, bdToken);
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

      await blackDuck.auth();
      const risk_profile = await blackDuck.getRiskProfile(
        projectName,
        projectVersion,
      );
      response.json(risk_profile);
    },
  );

  router.post(
    '/vulns/:projectName/:projectVersion',
    async (_request, response) => {
      const { projectName, projectVersion } = _request.params;
      const blackDuck = new BlackDuckRestApi(logger, bdHost, bdToken);
      const credentials = await httpAuth.credentials(_request);
      const entityRef = _request.body.entityRef;
      logger.info('getting vulnarabilities for project: ', entityRef);
      if (typeof entityRef !== 'string') {
        throw new InputError('Invalid entityRef, not a string');
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
