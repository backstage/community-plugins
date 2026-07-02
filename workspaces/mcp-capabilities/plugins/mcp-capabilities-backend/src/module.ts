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
import { McpServerCapabilitiesProcessor } from './processor/McpServerCapabilitiesProcessor';

/**
 * Catalog module that enriches native `mcp-server` API entities with a
 * discovered summary (capabilities, counts, server identity, tool names).
 *
 * @public
 */
export const catalogModuleMcpCapabilities = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'mcp-capabilities',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ catalog, logger }) {
        catalog.addProcessor(new McpServerCapabilitiesProcessor({ logger }));
      },
    });
  },
});
