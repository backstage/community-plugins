import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * Options for configuring the router.
 *
 * @public
 */
export interface RouterOptions {
  /**
   * The logger service to be used by the router.
   */
  logger: LoggerService;

  /**
   * The backstage config for the router.
   */
  config: Config;
}

/**
 * Creates and configures an Express router.
 *
 * @param options - The options for configuring the router.
 * @returns A promise that resolves to an Express router instance.
 *
 * @public
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, logger } = options;

  logger.info('Report portal backend plugin initialized');
  const hostsConfig = config.getConfigArray('reportPortal.integrations');

  const router = Router();
  router.use(express.json());

  router.get('/*', (req, res, next) => {
    const hostName = req.query.host;
    if (!hostName) {
      res.status(500).json({ message: 'Oops, I think you forgot something?' });
      return;
    }
    const reqConfig = hostsConfig
      .find(instance => instance.getString('host') === hostName)
      ?.get() as PluginConfig;

    const proxy = createProxyMiddleware({
      target: reqConfig.baseUrl,
      changeOrigin: true,
      secure: false,
      headers: {
        Authorization: reqConfig.token,
      },
      pathRewrite: {
        ['/api/report-portal']: '',
      },
    });

    proxy(req, res, next);
  });

  router.use(MiddlewareFactory.create({ config, logger }).error());
  return router;
}

/** @internal */
type PluginConfig = {
  host: string;
  baseUrl: string;
  token: string;
};
