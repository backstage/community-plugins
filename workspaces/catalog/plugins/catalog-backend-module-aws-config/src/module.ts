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
import { AwsConfigInfrastructureProvider } from './providers/AwsConfigInfrastructureProvider';
import { incrementalIngestionProvidersExtensionPoint } from '@backstage/plugin-catalog-backend-module-incremental-ingestion';

/**
 * @public
 */
export const catalogModuleAwsConfig = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'aws-config-provider',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        incrementalBuilder: incrementalIngestionProvidersExtensionPoint,
      },
      async init({ logger, config, incrementalBuilder }) {
        const providers = await AwsConfigInfrastructureProvider.fromConfig(
          config,
          {
            logger,
          },
        );

        providers.forEach(provider => {
          const { burstLength, burstInterval, restLength } =
            provider.options?.incremental || {};

          const options = {
            burstLength: burstLength ?? { seconds: 3 },

            burstInterval: burstInterval ?? { seconds: 3 },

            restLength: restLength ?? { days: 1 },
          };

          incrementalBuilder.addProvider({
            provider: provider.provider,
            options,
          });
        });
      },
    });
  },
});
