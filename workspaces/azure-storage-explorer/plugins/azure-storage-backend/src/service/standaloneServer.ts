import { createServiceBuilder, loadBackendConfig } from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';
import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'azure-storage-backend' });
  const config = await loadBackendConfig({logger, argv: process.argv})
  logger.debug('Starting application server...');
  const router = await createRouter({
    logger,
    config
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/azure-storage', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
