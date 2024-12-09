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
  DatabaseService,
  DiscoveryService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
  SchedulerService,
  SchedulerServiceTaskScheduleDefinition,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { LinguistBackendApi } from '../api';
import { LinguistBackendDatabase } from '../db';
import { HumanDuration, JsonObject } from '@backstage/types';
import { CatalogClient } from '@backstage/catalog-client';
import { LinguistBackendClient } from '../api/LinguistBackendClient';
import { Config } from '@backstage/config';
import { AuthService, LoggerService } from '@backstage/backend-plugin-api';
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';

/**
 * @internal
 * */
export interface RouterOptions {
  linguistBackendApi?: LinguistBackendApi;
  logger: LoggerService;
  reader: UrlReaderService;
  database: DatabaseService;
  discovery: DiscoveryService;
  config: Config;
  auth: AuthService;
  scheduler?: SchedulerService;
}

/**
 * @internal
 * */
export async function createRouter(
  routerOptions: RouterOptions,
): Promise<express.Router> {
  const { logger, reader, database, discovery, scheduler, auth, config } =
    routerOptions;

  let schedule: SchedulerServiceTaskScheduleDefinition | undefined;
  if (config.has('linguist.schedule')) {
    schedule = readSchedulerServiceTaskScheduleDefinitionFromConfig(
      config.getConfig('linguist.schedule'),
    );
  }
  const batchSize = config.getOptionalNumber('linguist.batchSize');
  const useSourceLocation =
    config.getOptionalBoolean('linguist.useSourceLocation') ?? false;
  const age = config.getOptional<JsonObject>('linguist.age') as
    | HumanDuration
    | undefined;
  const kind = config.getOptionalStringArray('linguist.kind');
  const linguistJsOptions = config.getOptional(
    'linguist.linguistJsOptions',
  ) as Record<string, unknown>;

  const linguistBackendStore = await LinguistBackendDatabase.create(
    await database.getClient(),
  );

  const catalogClient = new CatalogClient({ discoveryApi: discovery });

  const linguistBackendClient =
    routerOptions.linguistBackendApi ||
    new LinguistBackendClient(
      logger,
      linguistBackendStore,
      reader,
      auth,
      catalogClient,
      age,
      batchSize,
      useSourceLocation,
      kind,
      linguistJsOptions,
    );

  if (scheduler && schedule) {
    logger.info(
      `Scheduling processing of entities with: ${JSON.stringify(schedule)}`,
    );
    await scheduler.scheduleTask({
      id: 'linguist_process_entities',
      frequency: schedule.frequency,
      timeout: schedule.timeout,
      initialDelay: schedule.initialDelay,
      scope: schedule.scope,
      fn: async () => {
        await linguistBackendClient.processEntities();
      },
    });
  }

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.send({ status: 'ok' });
  });

  /**
   * /entity-languages?entity=component:default/my-component
   */
  router.get('/entity-languages', async (req, res) => {
    const { entityRef: entityRef } = req.query;

    if (!entityRef) {
      throw new Error('No entityRef was provided');
    }

    const entityLanguages = await linguistBackendClient.getEntityLanguages(
      entityRef as string,
    );
    res.status(200).json(entityLanguages);
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
