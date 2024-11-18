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

import {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { LinkerdVizClient } from '../lib/linkerdVizClient';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';

export interface RouterOptions {
  logger: LoggerService;
  discovery: DiscoveryService;
  auth: AuthService;
  config: RootConfigService;
  httpAuth: HttpAuthService;
}

export async function createRouter(
  opts: RouterOptions,
): Promise<express.Router> {
  const { discovery, auth, httpAuth, config, logger } = opts;

  const linkerdVizClient = LinkerdVizClient.fromConfig({
    discovery,
    auth,
    config,
  });

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  router.get(
    '/namespace/:namespace/deployments/:deployment/stats',
    async (request, response) => {
      const {
        params: { namespace, deployment },
      } = request;
      const [current] = await linkerdVizClient.stats(
        { resourceType: 'deployment', namespace, resourceName: deployment },
        { credentials: await httpAuth.credentials(request) },
      );

      const incoming = await linkerdVizClient.stats(
        {
          allNamespaces: true,
          toName: deployment,
          toNamespace: namespace,
          toType: 'deployment',
          resourceType: 'all',
        },
        { credentials: await httpAuth.credentials(request) },
      );

      const outgoing = await linkerdVizClient.stats(
        {
          allNamespaces: true,
          fromName: deployment,
          fromNamespace: namespace,
          fromType: 'deployment',
          resourceType: 'all',
        },
        { credentials: await httpAuth.credentials(request) },
      );

      const edges = await linkerdVizClient.edges(
        { namespace, resourceType: 'deployment' },
        { credentials: await httpAuth.credentials(request) },
      );

      response.send({
        current,
        incoming,
        outgoing,
        edges,
      });
    },
  );

  router.use(MiddlewareFactory.create({ config, logger }).error());
  return router;
}
