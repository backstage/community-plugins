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
import { azureResourcesServiceRef } from '@backstage-community/plugin-azure-resources-node';
import { readProviderConfigs } from './lib';
import { AzureResourceProvider } from './provider/AzureResourceProvider';

/**
 * A catalog module that adds the Azure Resources entity provider.
 * Reads the provider configuration from the `catalog.providers.azureResources` array in the app config.
 *
 * @public
 */
export const catalogModuleAzureResources = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'azure-resources',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        catalog: catalogProcessingExtensionPoint,
        scheduler: coreServices.scheduler,
        rootConfig: coreServices.rootConfig,
        azureClient: azureResourcesServiceRef,
      },
      async init({ logger, catalog, rootConfig, azureClient, scheduler }) {
        const providerConfigs = readProviderConfigs(rootConfig);

        if (!providerConfigs || providerConfigs.length === 0) {
          logger.info(
            'No Azure Resources providers configured, skipping initialization',
          );
          return;
        }

        // For each provider config, create and register a provider
        const providers = providerConfigs.map(config => {
          const provider = AzureResourceProvider.fromConfig(
            scheduler,
            config,
            logger,
            azureClient,
          );
          return provider;
        });
        catalog.addEntityProvider(providers);
      },
    });
  },
});
