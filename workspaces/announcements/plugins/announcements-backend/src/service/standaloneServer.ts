import { Server } from 'http';
import Knex from 'knex';
import { Logger } from 'winston';
import {
  createServiceBuilder,
  ServerTokenManager,
  loadBackendConfig,
  HostDiscovery,
  createLegacyAuthAdapters,
} from '@backstage/backend-common';
import { buildAnnouncementsContext } from './announcementsContextBuilder';
import { createRouter } from './router';
import { ServerPermissionClient } from '@backstage/plugin-permission-node';
import { HttpAuthService } from '@backstage/backend-plugin-api';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({
    service: 'announcements-backend-backend',
  });
  const config = await loadBackendConfig({ logger, argv: process.argv });
  const discovery = HostDiscovery.fromConfig(config);
  const tokenManager = ServerTokenManager.fromConfig(config, { logger });
  const permissions = ServerPermissionClient.fromConfig(config, {
    discovery,
    tokenManager,
  });
  // TODO: Move to use services instead of this hack
  const { httpAuth } = createLegacyAuthAdapters<
    any,
    { httpAuth: HttpAuthService }
  >({
    tokenManager,
    discovery,
  });

  logger.debug('Starting application server...');

  const database = Knex({
    client: 'better-sqlite3',
    connection: {
      filename: 'db/local.sqlite',
    },
    useNullAsDefault: true,
  });

  const announcementsContext = await buildAnnouncementsContext({
    logger: logger,
    database: { getClient: async () => database },
    permissions: permissions,
    httpAuth: httpAuth,
  });

  const router = await createRouter(announcementsContext);

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/api/announcements', router)
    .addRouter('/api/permission', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
