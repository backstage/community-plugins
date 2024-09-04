import { createServiceBuilder, HostDiscovery } from '@backstage/backend-common';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';
import { Config, ConfigReader } from '@backstage/config';

import { Server } from 'http';

import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: LoggerService;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const config: Config = new ConfigReader({});
  const discovery: DiscoveryService = HostDiscovery.fromConfig(config);
  const auth: AuthService = mockServices.auth({ pluginId: 'feedback' });
  const logger: LoggerService = options.logger.child({
    service: 'feedback-backend',
  });
  logger.debug('Starting application server...');
  const router = await createRouter({
    logger,
    config: config,
    discovery: discovery,
    auth: auth,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/feedback', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
