/*
 * Copyright 2020 The Backstage Authors
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
  loadBackendConfig,
} from '@backstage/backend-common';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { Server } from 'http';
import { createRouter } from './router';
import { ConfigReader } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: LoggerService;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'bazaar-backend' });
  const config = await loadBackendConfig({ logger, argv: process.argv });

  const manager = DatabaseManager.fromConfig(
    new ConfigReader({
      backend: {
        database: { client: 'better-sqlite3', connection: ':memory:' },
      },
    }),
  );
  const database = manager.forPlugin('bazaar');

  const router = await createRouter({
    logger,
    database,
    config: config,
    identity: {} as IdentityApi,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/bazaar', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
