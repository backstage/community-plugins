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
import ReactDOM from 'react-dom/client';

// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import { createApp } from '@backstage/frontend-defaults';
import {
  ApiBlueprint,
  createFrontendModule,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import {
  kubernetesApiRef,
  kubernetesAuthProvidersApiRef,
  kubernetesProxyApiRef,
} from '@backstage/plugin-kubernetes-react';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';

import tektonPlugin from '../src';
import tektonTranslationsModule from '../src/translations';
import {
  mockEntity,
  mockKubernetesAuthProviderApi,
  mockKubernetesClient,
  mockKubernetesProxyApi,
} from './shared';

const kubernetesStubPlugin = createFrontendPlugin({
  pluginId: 'kubernetes',
  extensions: [],
});

const kubernetesDevModule = createFrontendModule({
  pluginId: 'kubernetes',
  extensions: [
    ApiBlueprint.make({
      name: 'kubernetes-mock',
      params: defineParams =>
        defineParams({
          api: kubernetesApiRef,
          deps: {},
          factory: () => mockKubernetesClient,
        }),
    }),
    ApiBlueprint.make({
      name: 'kubernetes-proxy-mock',
      params: defineParams =>
        defineParams({
          api: kubernetesProxyApiRef,
          deps: {},
          factory: () => mockKubernetesProxyApi,
        }),
    }),
  ],
});

const kubernetesAuthStubPlugin = createFrontendPlugin({
  pluginId: 'kubernetes-auth-providers',
  extensions: [],
});

const kubernetesAuthDevModule = createFrontendModule({
  pluginId: 'kubernetes-auth-providers',
  extensions: [
    ApiBlueprint.make({
      name: 'kubernetes-auth-mock',
      params: defineParams =>
        defineParams({
          api: kubernetesAuthProvidersApiRef,
          deps: {},
          factory: () => mockKubernetesAuthProviderApi,
        }),
    }),
  ],
});

const permissionDevModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    ApiBlueprint.make({
      name: 'permission',
      params: defineParams =>
        defineParams({
          api: permissionApiRef,
          deps: {},
          factory: () => ({
            authorize: async () => ({ result: AuthorizeResult.ALLOW }),
          }),
        }),
    }),
  ],
});

const catalogDevModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      name: 'catalog-mock',
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => catalogApiMock({ entities: [mockEntity] }),
        }),
    }),
  ],
});

const app = createApp({
  features: [
    catalogPlugin,
    userSettingsPlugin,
    tektonPlugin,
    tektonTranslationsModule,
    catalogDevModule,
    kubernetesStubPlugin,
    kubernetesDevModule,
    kubernetesAuthStubPlugin,
    kubernetesAuthDevModule,
    permissionDevModule,
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(app.createRoot());
