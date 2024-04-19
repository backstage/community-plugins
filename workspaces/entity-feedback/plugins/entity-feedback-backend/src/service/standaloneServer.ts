/*
 * Copyright 2023 The Backstage Authors
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
  createServiceBuilder,
  DatabaseManager,
  HostDiscovery,
  loadBackendConfig,
} from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';
import { DefaultIdentityClient } from '@backstage/plugin-auth-node';
import { Server } from 'http';
import { createRouter } from './router';
import { LoggerService } from '@backstage/backend-plugin-api';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: LoggerService;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'entity-feedback-backend' });
  const config = await loadBackendConfig({ logger, argv: process.argv });
  const discovery = HostDiscovery.fromConfig(config);

  const manager = DatabaseManager.fromConfig(
    new ConfigReader({
      backend: {
        database: { client: 'better-sqlite3', connection: ':memory:' },
      },
    }),
  );
  const database = manager.forPlugin('entity-feedback');

  const identity = DefaultIdentityClient.create({
    discovery,
    issuer: await discovery.getExternalBaseUrl('auth'),
  });

  logger.debug('Starting application server...');
  const router = await createRouter({
    database,
    discovery,
    identity,
    logger,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/entity-feedback', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
