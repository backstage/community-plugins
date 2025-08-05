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
import _ from 'lodash';
import { ValidationCategory } from '../clients/fetch';
import { KialiApiImpl } from '../clients/KialiAPIConnector';
import { readKialiConfigs } from './config';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export interface KialiProvidersApi {
  name: string;
  urlExternal: string;
  api: KialiApiImpl;
}

export const makeRouter = (
  logger: LoggerService,
  kialiApis: KialiProvidersApi[],
  config: Config,
): express.Router => {
  const router = express.Router();
  router.use(express.json());

  const kialiApiByProviderName = _.keyBy(kialiApis, item => item.name);
  router.post('/proxy', async (req, res) => {
    const endpoint = req.body.endpoint;
    const providerName = req.body.provider;
    const kialiApi = kialiApiByProviderName[providerName];
    if (!kialiApi) {
      const candidates = Object.keys(kialiApiByProviderName)
        .map(n => `"${n}"`)
        .join(', ');
      res.json({
        verify: false,
        category: ValidationCategory.configuration,
        title: `Found no configured provider "${providerName}", candidates are ${candidates}`,
        message: `Found no configured provider "${providerName}", candidates are ${candidates}`,
      });
    }
    logger.info(`[${providerName}] Call to ${endpoint}`);

    kialiApi.api.proxy(endpoint).then((response: any) => {
      if (endpoint.includes('api/status')) {
        // Include kiali external url to status
        response.status.kialiExternalUrl = kialiApi.urlExternal;
      }
      res.json(response);
    });
  });

  router.post('/status', async (req, res) => {
    let providerName = req.body.provider;
    if (providerName === undefined) {
      providerName = kialiApis[0].name;
    }
    const kialiApi = kialiApiByProviderName[providerName];
    if (!kialiApi) {
      const candidates = Object.keys(kialiApiByProviderName)
        .map(n => `"${n}"`)
        .join(', ');
      res.json({
        verify: false,
        category: ValidationCategory.configuration,
        title: `Found no configured provider "${providerName}", candidates are ${candidates}`,
        message: `Found no configured provider "${providerName}", candidates are ${candidates}`,
      });
    }
    logger.info(`Call to Kiali Status`);
    const response = await kialiApi.api.status();
    response.providers = kialiApis.map(item => item.name);
    res.json(response);
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
};

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const { config } = options;

  logger.info('Initializing Kiali backend');

  const providers = readKialiConfigs(config, logger);
  logger.info(JSON.stringify(providers));
  const kialiApis = providers.map(provider => ({
    name: provider.name,
    urlExternal: provider.urlExternal,
    api: new KialiApiImpl({ logger, kiali: provider }),
  }));
  return makeRouter(logger, kialiApis, config);
}
