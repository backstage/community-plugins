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
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { eventsServiceRef } from '@backstage/plugin-events-node';
import { notificationService } from '@backstage/plugin-notifications-node';
import { CatalogClient } from '@backstage/catalog-client';

import { ScaffolderRelationEntityProcessor } from './ScaffolderRelationEntityProcessor';
import { handleTemplateUpdateNotifications } from './templateVersionUtils';
import { readScaffolderRelationProcessorConfig } from './templateVersionUtils';
import { TEMPLATE_VERSION_UPDATED_TOPIC } from './constants';

/**
 * Catalog processor that adds link relation between scaffolder templates and their generated entities
 *
 * @public
 */
export const catalogModuleScaffolderRelationProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'scaffolder-relation-processor',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        events: eventsServiceRef,
        notifications: notificationService,
        auth: coreServices.auth,
        discovery: coreServices.discovery,
      },
      async init({
        catalog,
        logger,
        config,
        events,
        notifications,
        auth,
        discovery,
      }) {
        logger.debug(
          'Registering the scaffolder-relation-processor catalog module',
        );

        const processorConfig = readScaffolderRelationProcessorConfig(config);

        const catalogClient = new CatalogClient({ discoveryApi: discovery });

        // Only subscribe to events if notifications are enabled
        if (processorConfig.notifications?.templateUpdate?.enabled) {
          await events.subscribe({
            id: 'scaffolder-relation-processor',
            topics: [TEMPLATE_VERSION_UPDATED_TOPIC],
            async onEvent(params) {
              const payload = params.eventPayload as {
                entityRef: string;
                previousVersion: string;
                currentVersion: string;
              };

              logger.info(
                `Received template update event for ${payload.entityRef}: ` +
                  `${payload.previousVersion} -> ${payload.currentVersion}`,
              );

              handleTemplateUpdateNotifications(
                catalogClient,
                notifications,
                auth,
                processorConfig,
                payload,
              );
            },
          });
        }

        catalog.addProcessor(new ScaffolderRelationEntityProcessor(events));
      },
    });
  },
});
