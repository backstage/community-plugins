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
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import {
  AzureContainerRegistryApiClient,
  AzureContainerRegistryApiRef,
} from './api';

/**
 * Backstage plugin.
 *
 * @public
 */
export const acrPlugin = createPlugin({
  id: 'acr',
  apis: [
    createApiFactory({
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
  ],
});

/**
 * A catalog entity content (tab) that shows the ACR container images.
 *
 * @public
 */
export const AcrImagesEntityContent = acrPlugin.provide(
  createComponentExtension({
    name: 'AcrImagesEntityContent',
    component: {
      lazy: () =>
        import('./components/AcrImagesEntityContent').then(
          m => m.AcrImagesEntityContent,
        ),
    },
  }),
);

/**
 * A catalog entity content (tab) that shows the ACR container images.
 *
 * @public
 * @deprecated Please use `AcrImagesEntityContent` instead of `AcrPage`.
 */
export const AcrPage = AcrImagesEntityContent;
