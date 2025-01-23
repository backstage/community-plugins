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
  createServiceFactory,
  createServiceRef,
} from '@backstage/backend-plugin-api';
import { AzureResourceGraphClient } from './AzureResourceGraphClient';

/**
 * The {@link AzureResourceGraphClient} that is used to interact with Azure resources.
 *
 * @public
 */
export const azureResourcesServiceRef =
  createServiceRef<AzureResourceGraphClient>({
    id: 'azure-resources.service',
    defaultFactory: async service =>
      createServiceFactory({
        service,
        deps: {
          logger: coreServices.logger,
          rootConfig: coreServices.rootConfig,
        },
        factory({ logger, rootConfig }) {
          const config = rootConfig.getOptionalConfig('azure-resources');
          return AzureResourceGraphClient.fromConfig(logger, config);
        },
      }),
  });
