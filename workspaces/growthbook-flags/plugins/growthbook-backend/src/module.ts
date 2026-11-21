/*
 * Copyright 2026 The Backstage Authors
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
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { GrowthbookClient } from './client';
import { createManagementRouter, createSdkRouter } from './router';
import { resolveAppUrl } from './helpers';
import { createSdkFlagsSource } from './sdkSource';

/** @public */
const growthbookFlagsPlugin = createBackendPlugin({
  pluginId: 'backstage-community-growthbook',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        http: coreServices.httpRouter,
      },
      async init({ logger, config, http }) {
        const gbConfig = config.getOptionalConfig('growthbook');
        if (!gbConfig) {
          logger.warn(
            'growthbook config not found — growthbook-flags plugin will not initialize',
          );
          return;
        }

        const baseUrl = gbConfig.getString('baseUrl').replace(/\/+$/, '');
        const appUrl = resolveAppUrl(
          gbConfig.getOptionalString('appUrl'),
          baseUrl,
        );
        const secretKey = gbConfig.getOptionalString('secretKey');

        if (secretKey) {
          http.use(
            createManagementRouter({
              logger,
              appUrl,
              client: new GrowthbookClient({ baseUrl, secretKey }),
            }),
          );
        } else {
          const sdkKeys = gbConfig.getOptionalConfig('sdkKeys');
          if (!sdkKeys) {
            logger.error(
              'Invalid growthbook config: either growthbook.secretKey or growthbook.sdkKeys must be configured',
            );
            throw new Error(
              'Missing required GrowthBook configuration: growthbook.secretKey or growthbook.sdkKeys',
            );
          }
          http.use(
            createSdkRouter({
              sdk: createSdkFlagsSource({
                baseUrl,
                resolveKey: gbEnv => {
                  try {
                    return sdkKeys.getString(gbEnv);
                  } catch {
                    return undefined;
                  }
                },
              }),
            }),
          );
        }
        logger.info(
          `GrowthBook Flags plugin initialized at /api/backstage-community-growthbook (mode: ${
            secretKey ? 'management API' : 'SDK API'
          })`,
        );
      },
    });
  },
});

export default growthbookFlagsPlugin;
