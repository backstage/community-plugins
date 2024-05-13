import { errorHandler } from '@backstage/backend-common';
import {
  AuthService,
  BackstageCredentials,
  DiscoveryService,
  HttpAuthService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { ResponseError } from '@backstage/errors';
import express, { Request } from 'express';
import Router from 'express-promise-router';
import fetch from 'node-fetch';
import qs from 'qs';
import ms from 'ms';

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

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  const makeProxyRequest = async <T = any>(
    url: string,
    options: { credentials: BackstageCredentials },
  ) => {
    const k8sBase = await discovery.getBaseUrl('kubernetes');
    const targetUrl = `${k8sBase}/proxy/api/v1/namespaces/linkerd-viz/services/web:8084/proxy${url}`;

    const credentials = await auth.getPluginRequestToken({
      onBehalfOf: options.credentials,
      targetPluginId: 'kubernetes',
    });

    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${credentials.token}`,
      },
    });

    if (!response.ok) {
      throw ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  };

  const generateTpsStats = async (
    options:
      | {
          to_name: string;
          to_namespace: string;
          to_type: string;
        }
      | {
          from_name: string;
          from_namespace: string;
          from_type: string;
        },
    req: Request,
  ) => {
    const actualOptions = {
      ...options,
      resource_type: 'all',
      all_namespaces: true,
      tcp_stats: true,
      window: '30s',
    };

    const requests = await makeProxyRequest(
      `/api/tps-reports?${qs.stringify(actualOptions)}`,
      { credentials: await httpAuth.credentials(req) },
    );

    return requests.ok.statTables
      .filter((table: any) => table.podGroup.rows.length)
      .map((table: any) =>
        table.podGroup.rows.reduce(
          (prev: any[], current: any) => [...prev, current],
          [],
        ),
      )
      .flat()
      .reduce((prev: any, current: any) => {
        prev[current.resource.type] = prev[current.resource.type] || {};
        prev[current.resource.type][current.resource.name] =
          prev[current.resource.type][current.resource.name] || {};

        const timeWindowSeconds = Number(ms(current.timeWindow ?? 0)) / 1000;
        const successCount = parseInt(current.stats?.successCount, 10);
        const failureCount = parseInt(current.stats?.failureCount, 10);
        const totalRequests = successCount + failureCount;

        const b7e = {
          totalRequests,
          rps: totalRequests / timeWindowSeconds,
          successRate: (successCount / totalRequests) * 100,
          failureRate: (failureCount / totalRequests) * 100,
        };

        prev[current.resource.type][current.resource.name] = {
          ...current,
          b7e,
        };
        return prev;
      }, {});
  };

  router.get('/namespace/:namespace/deployments', async (req, response) => {
    const {
      params: { namespace },
    } = req;

    const podRequest = await makeProxyRequest(
      `/api/pods?namespace=${namespace}`,
      {
        credentials: await httpAuth.credentials(req),
      },
    );

    response.json(podRequest.pods);
  });

  router.get(
    '/namespace/:namespace/deployments/:deployment/stats',
    async (request, response) => {
      const {
        params: { namespace, deployment },
      } = request;
      const toOptions = {
        to_name: deployment,
        to_namespace: namespace,
        to_type: 'deployment',
      };

      const fromOptions = {
        from_name: deployment,
        from_namespace: namespace,
        from_type: 'deployment',
      };

      response.send({
        incoming: await generateTpsStats(toOptions, request),
        outgoing: await generateTpsStats(fromOptions, request),
      });
    },
  );

  router.use(errorHandler());
  return router;
}
