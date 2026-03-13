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
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { CatalogClient } from '@backstage/catalog-client';
import { ApiiroAnnotationProcessor } from './processor';

/**
 * Catalog backend module for Apiiro entity annotation processing.
 *
 * Automatically adds Apiiro annotations to Component and System entities
 * based on their source location or name, enabling integration with Apiiro security insights.
 *
 * @public
 */
export const catalogModuleApiiroEntityProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'apiiro-entity-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        auth: coreServices.auth,
      },
      async init({ catalog, config, discovery, auth }) {
        const catalogApi = new CatalogClient({ discoveryApi: discovery });
        catalog.addProcessor(
          new ApiiroAnnotationProcessor(config, { catalogApi, auth }),
        );
      },
    });
  },
});
