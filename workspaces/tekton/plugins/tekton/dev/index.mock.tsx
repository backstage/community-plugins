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

/**
 * Playwright NFS entry. Same mocked NFS app as `yarn start` (`dev/index.tsx`).
 *
 * Must be self-contained: a static `import './index'` compiles under rspack
 * but React never mounts, so Playwright sees a blank page.
 */

import '@backstage/cli/asset-types';
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import ReactDOM from 'react-dom/client';

import { createApp } from '@backstage/frontend-defaults';
import { SignInPage } from '@backstage/core-components';
import {
  ApiBlueprint,
  createFrontendModule,
  pluginHeaderActionsApiRef,
} from '@backstage/frontend-plugin-api';
import { SignInPageBlueprint } from '@backstage/plugin-app-react';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import {
  kubernetesApiRef,
  kubernetesAuthProvidersApiRef,
  kubernetesProxyApiRef,
} from '@backstage/plugin-kubernetes-react';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { permissionApiRef } from '@backstage/plugin-permission-react';

import tektonPlugin from '../src';
import tektonTranslationsModule from '../src/translations';
import { devSidebarContent } from './shared';
import {
  mockCatalogApi,
  mockKubernetesAuthProviderApi,
  mockKubernetesClient,
  mockKubernetesProxyApi,
} from './mocks';

const catalogPluginOverrides = catalogPlugin.withOverrides({
  extensions: [
    catalogPlugin.getExtension('api:catalog').override({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => mockCatalogApi,
        }),
    }),
  ],
});

const kubernetesPluginOverrides = kubernetesPlugin.withOverrides({
  extensions: [
    kubernetesPlugin.getExtension('api:kubernetes').override({
      params: defineParams =>
        defineParams({
          api: kubernetesApiRef,
          deps: {},
          factory: () => mockKubernetesClient,
        }),
    }),
    kubernetesPlugin.getExtension('api:kubernetes/proxy').override({
      params: defineParams =>
        defineParams({
          api: kubernetesProxyApiRef,
          deps: {},
          factory: () => mockKubernetesProxyApi,
        }),
    }),
    kubernetesPlugin.getExtension('api:kubernetes/auth-providers').override({
      params: defineParams =>
        defineParams({
          api: kubernetesAuthProvidersApiRef,
          deps: {},
          factory: () => mockKubernetesAuthProviderApi,
        }),
    }),
  ],
});

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      (
        <SignInPage
          {...props}
          title="Select a sign-in method"
          align="center"
          providers={['guest']}
        />
      ),
  },
});

const appDevModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    signInPage,
    ApiBlueprint.make({
      name: 'permission',
      params: defineParams =>
        defineParams({
          api: permissionApiRef,
          deps: {},
          factory: () => ({
            authorize: async () => ({
              result: window.location.pathname.includes('permission-denied')
                ? AuthorizeResult.DENY
                : AuthorizeResult.ALLOW,
            }),
          }),
        }),
    }),
    ApiBlueprint.make({
      name: 'plugin-header-actions',
      params: defineParams =>
        defineParams({
          api: pluginHeaderActionsApiRef,
          deps: {},
          factory: () => ({
            getPluginHeaderActions: () => [],
          }),
        }),
    }),
  ],
});

const devNavModule = createFrontendModule({
  pluginId: 'app',
  extensions: [devSidebarContent],
});

const app = createApp({
  features: [
    catalogPluginOverrides,
    kubernetesPluginOverrides,
    tektonPlugin,
    tektonTranslationsModule,
    devNavModule,
    appDevModule,
  ],
});

if (window.location.pathname === '/') {
  window.location.replace('/catalog');
}

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(root);
