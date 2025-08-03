/*
 * Copyright 2025 The Backstage Authors
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
import { UnclaimedEntityProvider } from './providers/UnclaimedEntityProvider';
import { UnclaimedEntityProcessor } from './processors/UnclaimedEntityProcessor';

export const catalogModuleUnclaimedEntities = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'unclaimed-entities',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, config, scheduler, catalog }) {
        // Get array of providers from configuration
        const providers = UnclaimedEntityProvider.fromConfig(config, {
          logger,
          scheduler,
        });

        // Register each provider
        for (const provider of providers) {
          catalog.addEntityProvider(provider);
        }

        // Register the processor to handle Unclaimed entities
        catalog.addProcessor(new UnclaimedEntityProcessor());
      },
    });
  },
});
