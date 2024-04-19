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
import { createServiceBuilder } from '@backstage/backend-common';
import { Server } from 'http';
import { createRouter } from './router';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';

export interface ServerOptions {
  config: Config;
  enableCors: boolean;
  logger: LoggerService;
  port: number;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'nomad' });
  logger.debug('Starting application server...');
  const router = await createRouter({
    logger,
    config: options.config,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/nomad', router);
  if (options.enableCors) {
    service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
