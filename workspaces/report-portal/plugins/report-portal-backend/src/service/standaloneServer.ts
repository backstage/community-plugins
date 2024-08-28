import { createServiceBuilder } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

import { Logger } from 'winston';

import { Server } from 'http';

import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const config = new ConfigReader({});
  const logger = options.logger.child({ service: 'report-portal-backend' });
  logger.debug('Starting application server...');
  const router = await createRouter({
    logger,
    config,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/report-portal', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error('Dev server failed:', err);
    process.exit(1);
  });
}

module.hot?.accept();
