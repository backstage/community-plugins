/*
 * Copyright 2024 The Backstage Authors
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
import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import {
  LoggerService,
  RootConfigService,
  UrlReaderService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { readTechRadarResponseFromURL } from '../utils';

/**
 * See UrlReader documentation: https://backstage.io/docs/backend-system/core-services/url-reader/
 *
 * @public
 */
export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
  reader: UrlReaderService;
}

/**
 * Create the Tech Radar Router, used for reading the Tech Radar data from the provided URL.
 *
 * @public
 *
 * @param options - Router options
 */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, reader } = options;

  const router = Router();
  router.use(express.json());
  const url = config.getString('techRadar.url');

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/data', async (_, response) => {
    const dataFromUrl = await readTechRadarResponseFromURL(url, reader, logger);
    if (!dataFromUrl) {
      response
        .status(502)
        .json({ message: 'Unable to retrieve data from provided URL' });
    }
    response.json({ status: 'ok', data: dataFromUrl });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
