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
 * New Frontend System dev mode for the Topology plugin (mock data).
 */

import '@backstage/cli/asset-types';
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui';

import ReactDOM from 'react-dom/client';

import { createApp } from '@backstage/frontend-defaults';
import {
  ApiBlueprint,
  createFrontendModule,
  pluginHeaderActionsApiRef,
} from '@backstage/frontend-plugin-api';
import {
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import {
  SidebarLanguageSwitcher,
  SidebarSignOutButton,
} from '@backstage/dev-utils';

import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  kubernetesApiRef,
  kubernetesAuthProvidersApiRef,
} from '@backstage/plugin-kubernetes-react';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { permissionApiRef } from '@backstage/plugin-permission-react';

import {
  topologyCatalogModule,
  topologyTranslationsModule,
} from '../../src/alpha';

import {
  mockCatalogApi,
  mockKubernetesClient,
  mockKubernetesAuthProviderApi,
} from '../mocks';

const catalogDevModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      name: 'catalog',
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => mockCatalogApi,
        }),
    }),
  ],
});

const kubernetesDevModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    ApiBlueprint.make({
      name: 'kubernetes',
      params: defineParams =>
        defineParams({
          api: kubernetesApiRef,
          deps: {},
          factory: () => mockKubernetesClient,
        }),
    }),
    ApiBlueprint.make({
      name: 'kubernetes-auth-providers',
      params: defineParams =>
        defineParams({
          api: kubernetesAuthProvidersApiRef,
          deps: {},
          factory: () => mockKubernetesAuthProviderApi,
        }),
    }),
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

const devSidebarContent = NavContentBlueprint.make({
  params: {
    component: props => (
      <Sidebar>
        <SidebarGroup label="Menu">
          <SidebarScrollWrapper>
            {props.navItems
              ? props.navItems
                  .rest()
                  .map((item, index) => (
                    <SidebarItem
                      key={index}
                      icon={() => item.icon}
                      to={item.href}
                      text={item.title}
                    />
                  ))
              : (props as any).items?.map((item: any, index: number) => (
                  <SidebarItem key={index} {...item} />
                ))}
          </SidebarScrollWrapper>
        </SidebarGroup>
        <SidebarSpace />
        <SidebarLanguageSwitcher />
        <SidebarSignOutButton />
      </Sidebar>
    ),
  },
});

const devNavModule = createFrontendModule({
  pluginId: 'app',
  extensions: [devSidebarContent],
});

const app = createApp({
  features: [
    devNavModule,
    topologyCatalogModule,
    topologyTranslationsModule,
    catalogDevModule,
    kubernetesDevModule,
  ],
});

if (window.location.pathname === '/') {
  window.location.replace('/catalog');
}

const root = app.createRoot();

ReactDOM.createRoot(document.getElementById('root')!).render(root);
