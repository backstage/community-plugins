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
  loadBackendConfig,
} from '@backstage/backend-common';
import { Server } from 'http';
import { createRouter } from './router';
import { TaskScheduler } from '@backstage/backend-tasks';
import {
  LoggerService,
  SchedulerServiceTaskScheduleDefinition,
} from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: LoggerService;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'copilot-backend' });
  const config = await loadBackendConfig({ logger, argv: process.argv });
  const manager = DatabaseManager.fromConfig(
    new ConfigReader({
      backend: {
        database: { client: 'better-sqlite3', connection: ':memory:' },
      },
    }),
  );
  const schedule: SchedulerServiceTaskScheduleDefinition = {
    frequency: { cron: '0 2 * * *' },
    timeout: { minutes: 15 },
    initialDelay: { seconds: 15 },
    scope: 'local',
  };

  const database = manager.forPlugin('copilot');

  options.logger.debug('Starting application server...');

  const router = await createRouter(
    {
      config,
      database,
      logger,
      scheduler: TaskScheduler.forPlugin({
        databaseManager: database,
        pluginId: 'copilot',
        logger,
      }),
    },
    {
      schedule,
    },
  );

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/copilot', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
