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

import { PluginTaskScheduler } from '@backstage/backend-tasks';
import { CATALOG_FILTER_EXISTS, CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { LighthouseRestApi } from '@backstage-community/plugin-lighthouse-common';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { LighthouseAuditScheduleImpl } from '../config';
import {
  createLegacyAuthAdapters,
  TokenManager,
} from '@backstage/backend-common';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';

/** @public **/
export interface CreateLighthouseSchedulerOptions {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  scheduler?: PluginTaskScheduler;
  catalogClient: CatalogApi;
  tokenManager: TokenManager;
  auth?: AuthService;
}

/** @public **/
export async function createScheduler(
  options: CreateLighthouseSchedulerOptions,
) {
  const { logger, scheduler, catalogClient, config } = options;
  const { auth } = createLegacyAuthAdapters(options);
  const lighthouseApi = LighthouseRestApi.fromConfig(config);

  const lighthouseAuditConfig = LighthouseAuditScheduleImpl.fromConfig(config, {
    logger,
  });
  const formFactorToScreenEmulationMap = {
    // the default is mobile, so no need to override
    mobile: undefined,
    // Values from lighthouse's cli "desktop" preset
    // https://github.com/GoogleChrome/lighthouse/blob/a6738e0033e7e5ca308b97c1c36f298b7d399402/lighthouse-core/config/constants.js#L71-L77
    desktop: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false,
    },
  };

  logger.info(
    `Running with Scheduler Config ${JSON.stringify(
      lighthouseAuditConfig.frequency,
    )} and timeout ${JSON.stringify(lighthouseAuditConfig.timeout)}`,
  );

  if (scheduler) {
    await scheduler.scheduleTask({
      id: 'lighthouse_audit',
      frequency: lighthouseAuditConfig.frequency,
      timeout: lighthouseAuditConfig.timeout,
      initialDelay: lighthouseAuditConfig.initialDelay,
      fn: async () => {
        const filter: Record<string, symbol | string> = {
          kind: 'Component',
          'spec.type': 'website',
          ['metadata.annotations.lighthouse.com/website-url']:
            CATALOG_FILTER_EXISTS,
        };

        logger.info('Running Lighthouse Audit Task');

        const { token } = await auth.getPluginRequestToken({
          onBehalfOf: await auth.getOwnServiceCredentials(),
          targetPluginId: 'catalog',
        });
        const websitesWithUrl = await catalogClient.getEntities(
          {
            filter: [filter],
          },
          { token },
        );

        let index = 0;
        for (const entity of websitesWithUrl.items) {
          const websiteUrl =
            entity.metadata.annotations?.['lighthouse.com/website-url'] ?? '';

          if (!websiteUrl) {
            continue;
          }

          const controller = new AbortController();

          await scheduler.scheduleTask({
            id: `lighthouse_audit_${stringifyEntityRef(entity)}`,
            frequency: {},
            timeout: {},
            initialDelay: { minutes: index * 2 },
            signal: controller.signal,
            fn: async () => {
              logger.info(
                `Processing Website Url ${websiteUrl} for Entity ${entity.metadata.name}`,
              );

              await lighthouseApi.triggerAudit({
                url: websiteUrl,
                options: {
                  lighthouseConfig: {
                    settings: {
                      formFactor: 'mobile',
                      emulatedFormFactor: 'mobile',
                      screenEmulation: formFactorToScreenEmulationMap.mobile,
                    },
                  },
                },
              });

              logger.info('Stop Scheduled Task');
              controller.abort();
            },
          });
          index++;
        }
      },
    });
  }
}
