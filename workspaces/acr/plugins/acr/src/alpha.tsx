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
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

import { isAcrAvailable } from './utils/isAcrAvailable';
import {
  AzureContainerRegistryApiClient,
  AzureContainerRegistryApiRef,
} from './api';

/**
 * An API to communicate via the proxy to an ACR container registry.
 *
 * @alpha
 */
export const acrApi = ApiBlueprint.make({
  name: 'acrApi',
  params: defineParams =>
    defineParams({
      api: AzureContainerRegistryApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, configApi, identityApi }) =>
        new AzureContainerRegistryApiClient({
          discoveryApi,
          configApi,
          identityApi,
        }),
    }),
});

/**
 * A catalog entity content (tab) that shows the ACR container images.
 *
 * @alpha
 */
export const acrImagesEntityContent = EntityContentBlueprint.make({
  name: 'acrImagesEntityContent',
  params: {
    path: 'acr-images',
    title: 'ACR images',
    filter: isAcrAvailable,
    loader: () =>
      import('./components/AcrImagesEntityContent').then(m => (
        <m.AcrImagesEntityContent />
      )),
  },
});

/**
 * Backstage frontend plugin.
 *
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'acr',
  extensions: [acrApi, acrImagesEntityContent],
});
