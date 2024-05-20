import { errorHandler } from '@backstage/backend-common';
import {
  AuthService,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { LinkerdVizClient } from '../lib/linkerdVizClient';

export interface RouterOptions {
  logger: LoggerService;
  discovery: DiscoveryService;
  auth: AuthService;
  httpAuth: HttpAuthService;
}

export async function createRouter(
  opts: RouterOptions,
): Promise<express.Router> {
  const { discovery, auth, httpAuth } = opts;

  const linkerdVizClient = LinkerdVizClient.fromConfig({
    discovery,
    auth,
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

  router.use(errorHandler());
  return router;
}
