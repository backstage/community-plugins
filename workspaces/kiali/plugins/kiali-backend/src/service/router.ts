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
import type { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import express from 'express';

import { KialiApiImpl } from '../clients/KialiAPIConnector';
import { readKialiConfigs } from './config';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const { config } = options;

  logger.info('Initializing Kiali backend');

  const kiali = readKialiConfigs(config);

  const kialiAPI = new KialiApiImpl({ logger, kiali });

  const router = express.Router();
  router.use(express.json());

  // curl -H "Content-type: application/json" -H "Accept: application/json" -X GET localhost:7007/api/kiali/proxy --data '{"endpoint": "api/namespaces"}'
  router.post('/proxy', async (req, res) => {
    const endpoint = req.body.endpoint;
    logger.info(`Call to Kiali ${endpoint}`);

    kialiAPI.proxy(endpoint).then((response: any) => {
      if (endpoint.includes('api/status')) {
        // Include kiali external url to status
        response.status.kialiExternalUrl = kiali.urlExternal;
      }
      res.json(response);
    });
  });

  router.post('/status', async (_, res) => {
    logger.info(`Call to Kiali Status`);
    res.json(await kialiAPI.status());
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
