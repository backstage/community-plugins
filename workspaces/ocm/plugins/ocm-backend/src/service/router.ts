/*
 * Copyright 2020 The Backstage Authors
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
  coreServices,
  createBackendPlugin,
  HttpAuthService,
  LoggerService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';
import { NotAllowedError } from '@backstage/errors';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

import express, { Request } from 'express';

import {
  Cluster,
  ClusterOverview,
  ocmClusterReadPermission,
  ocmEntityPermissions,
  ocmEntityReadPermission,
} from '@backstage-community/plugin-ocm-common';

import { readOcmConfigs } from '../helpers/config';
import {
  getManagedCluster,
  getManagedClusterInfo,
  hubApiClient,
  listManagedClusterInfos,
  listManagedClusters,
} from '../helpers/kubernetes';
import {
  getClaim,
  parseClusterStatus,
  parseManagedCluster,
  parseNodeStatus,
  parseUpdateInfo,
  translateOCMToResource,
  translateResourceToOCM,
} from '../helpers/parser';
import { createOpenApiRouter } from '../schema/openapi.generated';
import { ClientDetails, ManagedClusterInfo } from '../types';

async function createRouter(deps: {
  config: Config;
  logger: LoggerService;
  httpAuth: HttpAuthService;
  permissions: PermissionsService;
}) {
  const { config, logger, httpAuth, permissions } = deps;
  const router = await createOpenApiRouter();

  const permissionsIntegrationRouter = createPermissionIntegrationRouter({
    permissions: ocmEntityPermissions,
  });

  router.use(express.json());
  router.use(permissionsIntegrationRouter);

  const providerConfigs = readOcmConfigs(config);

  const clientEntries = await Promise.all(
    providerConfigs.map(async provider => {
      const client = await hubApiClient(provider, logger);

      return [
        provider.id,
        {
          client: client,
          hubResourceName: provider.hubResourceName,
        },
      ];
    }),
  );

  const clients: { [k: string]: ClientDetails } =
    Object.fromEntries(clientEntries);

  const authorize = async (request: Request, permission: BasicPermission) => {
    const decision = (
      await permissions.authorize([{ permission: permission }], {
        credentials: await httpAuth.credentials(request),
      })
    )[0];

    return decision;
  };

  router.get('/status/:providerId/:clusterName', async (request, response) => {
    const decision = await authorize(request, ocmEntityReadPermission);

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    const { clusterName, providerId } = request.params;
    logger.debug(
      `Incoming status request for ${clusterName} cluster on ${providerId} hub`,
    );

    if (!clients.hasOwnProperty(providerId)) {
      throw Object.assign(new Error('Hub not found'), {
        statusCode: 404,
        name: 'HubNotFound',
      });
    }

    const normalizedClusterName = translateResourceToOCM(
      clusterName,
      clients[providerId].hubResourceName,
    );

    const mc = await getManagedCluster(
      clients[providerId].client,
      normalizedClusterName,
    );
    const mci = await getManagedClusterInfo(
      clients[providerId].client,
      normalizedClusterName,
    );

    response.send({
      name: clusterName,
      ...parseManagedCluster(mc),
      ...parseUpdateInfo(mci),
    } as Cluster);
  });

  router.get('/status', async (request, response) => {
    const decision = await authorize(request, ocmClusterReadPermission);

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError('Unauthorized');
    }

    logger.debug(`Incoming status request for all clusters`);

    const allClusters = await Promise.all(
      Object.values(clients).map(async c => {
        const mcs = await listManagedClusters(c.client);
        const mcis = await listManagedClusterInfos(c.client);

        return mcs.items.map(mc => {
          const mci =
            mcis.items.find(
              info => info.metadata?.name === mc.metadata!.name,
            ) || ({} as ManagedClusterInfo);

          return {
            name: translateOCMToResource(mc.metadata!.name!, c.hubResourceName),
            status: parseClusterStatus(mc),
            platform: getClaim(mc, 'platform.open-cluster-management.io'),
            openshiftVersion:
              mc.metadata!.labels?.openshiftVersion ??
              getClaim(mc, 'version.openshift.io'),
            nodes: parseNodeStatus(mci),
            ...parseUpdateInfo(mci),
          } as ClusterOverview;
        });
      }),
    );

    return response.send(allClusters.flat());
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}

/**
 * @public
 */
export const ocmPlugin = createBackendPlugin({
  pluginId: 'ocm',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        permissions: coreServices.permissions,
      },
      async init({ config, logger, http, httpAuth, permissions }) {
        http.use(await createRouter({ config, logger, httpAuth, permissions }));
      },
    });
  },
});
