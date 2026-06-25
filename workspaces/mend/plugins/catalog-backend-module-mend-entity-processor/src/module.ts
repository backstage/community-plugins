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
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { MendAnnotationProcessor } from './processor';

/**
 * Catalog backend module for Mend entity annotation processing.
 *
 * Automatically adds Mend annotations to Component entities
 * based on their source location, enabling integration with Mend security insights.
 *
 * @public
 */
export const catalogModuleMendEntityProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'mend-entity-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        cache: coreServices.cache,
        logger: coreServices.logger,
      },
      async init({ catalog, config, cache, logger }) {
        catalog.addProcessor(
          new MendAnnotationProcessor(config, { cache, logger }),
        );
      },
    });
  },
});
