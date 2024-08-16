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
import {
  AuthService,
  LoggerService,
  RootConfigService,
  coreServices,
  createBackendPlugin,
  DiscoveryService,
  UrlReaderService,
  HttpAuthService,
  DatabaseService,
} from '@backstage/backend-plugin-api';
import {
  errorHandler,
  createLegacyAuthAdapters,
} from '@backstage/backend-common';
import { PluginTaskScheduler } from '@backstage/backend-tasks';
import express from 'express';
import Router from 'express-promise-router';
import { PluginInitializer } from './pluginInitializer';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
  discovery: DiscoveryService;
  database: DatabaseService;
  scheduler: PluginTaskScheduler;
  urlReader: UrlReaderService;
  auth?: AuthService;
  httpAuth?: HttpAuthService;
}

function registerRouter() {
  const router = Router();
  router.use(express.json());
  return router;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, database, scheduler } = options;
  const baseRouter = registerRouter();
  const { auth } = createLegacyAuthAdapters(options);
  const plugin = await PluginInitializer.builder(
    baseRouter,
    logger,
    config,
    auth,
    database,
    scheduler,
  );
  const router = plugin.timeSaverRouter;
  router.use(errorHandler());
  return router;
}

export const timeSaverPlugin = createBackendPlugin({
  pluginId: 'time-saver',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        auth: coreServices.auth,
        scheduler: coreServices.scheduler,
        database: coreServices.database,
        http: coreServices.httpRouter,
        httpRouter: coreServices.httpRouter,
        urlReader: coreServices.urlReader,
      },
      async init({
        auth,
        config,
        logger,
        scheduler,
        database,
        http,
        httpRouter,
      }) {
        const baseRouter = registerRouter();
        const plugin = await PluginInitializer.builder(
          baseRouter,
          logger,
          config,
          auth,
          database,
          scheduler,
        );
        const router = plugin.timeSaverRouter;
        http.use(router);

        httpRouter.addAuthPolicy({
          path: '/migrate',
          allow: 'unauthenticated',
        });

        httpRouter.addAuthPolicy({
          path: '/generate-sample-classification',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
