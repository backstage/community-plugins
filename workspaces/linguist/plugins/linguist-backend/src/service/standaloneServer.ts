/*
 * Copyright 2022 The Backstage Authors
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
  ServerTokenManager,
  UrlReaders,
} from '@backstage/backend-common';
import { Server } from 'http';
import { createRouter } from './router';
import { TaskScheduleDefinition } from '@backstage/backend-tasks';
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
  const logger = options.logger.child({ service: 'linguist-backend' });
  const config = await loadBackendConfig({ logger, argv: process.argv });
  const manager = DatabaseManager.fromConfig(
    new ConfigReader({
      backend: {
        database: { client: 'better-sqlite3', connection: ':memory:' },
      },
    }),
  );
  const database = manager.forPlugin('linguist');

  const schedule: TaskScheduleDefinition = {
    frequency: { minutes: 2 },
    timeout: { minutes: 15 },
    initialDelay: { seconds: 15 },
  };

  logger.debug('Starting application server...');
  const router = await createRouter(
    { schedule: schedule, age: { days: 30 }, useSourceLocation: false },
    {
      database,
      discovery: HostDiscovery.fromConfig(config),
      reader: UrlReaders.default({ logger, config }),
      logger,
      tokenManager: ServerTokenManager.noop(),
    },
  );

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/linguist', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
