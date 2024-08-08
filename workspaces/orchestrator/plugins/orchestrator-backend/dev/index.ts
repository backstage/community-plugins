import {
  createServiceBuilder,
  ServerTokenManager,
  UrlReader,
} from '@backstage/backend-common';
import { DiscoveryService, LoggerService } from '@backstage/backend-plugin-api';
import { PluginTaskScheduler } from '@backstage/backend-tasks';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';

import { Server } from 'http';

import { createRouter } from '../src/routerWrapper';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  catalogApi: CatalogApi;
  urlReader: UrlReader;
  scheduler: PluginTaskScheduler;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'orchestrator-backend' });
  logger.debug('Starting application server...');

  const permissions = ServerPermissionClient.fromConfig(options.config, {
    discovery: options.discovery,
    tokenManager: ServerTokenManager.noop(),
  });

  const router = await createRouter({
    logger,
    config: options.config,
    discovery: options.discovery,
    catalogApi: options.catalogApi,
    urlReader: options.urlReader,
    scheduler: options.scheduler,
    permissions: permissions,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/orchestrator', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
