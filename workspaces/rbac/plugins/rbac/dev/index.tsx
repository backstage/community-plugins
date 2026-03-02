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
 * New Frontend System dev mode for the RBAC plugin
 */

import '@backstage/ui/css/styles.css';
import { createApp } from '@backstage/frontend-defaults';
import { configApiRef } from '@backstage/core-plugin-api';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import ReactDOM from 'react-dom/client';
import { mockApis } from '@backstage/test-utils';

import {
  ApiBlueprint,
  createFrontendModule,
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
import { rbacApiRef } from '../src/api/RBACBackendClient';
import { licensedUsersApiRef } from '../src/api/LicensedUsersClient';

import { rbacPlugin, rbacTranslationsModule } from '../src/alpha';
import { mockConfigApi, mockLicensedUsersApi, mockRBACApi } from './mocks';

const rbacDevModule = createFrontendModule({
  pluginId: 'rbac',
  extensions: [
    ApiBlueprint.make({
      name: 'rbac',
      params: defineParams =>
        defineParams({
          api: rbacApiRef,
          deps: {},
          factory: () => mockRBACApi,
        }),
    }),
    ApiBlueprint.make({
      name: 'licensed-users',
      params: defineParams =>
        defineParams({
          api: licensedUsersApiRef,
          deps: {},
          factory: () => mockLicensedUsersApi,
        }),
    }),
    ApiBlueprint.make({
      name: 'config',
      params: defineParams =>
        defineParams({
          api: configApiRef,
          deps: {},
          factory: () => mockConfigApi,
        }),
    }),
    ApiBlueprint.make({
      name: 'permission',
      params: defineParams =>
        defineParams({
          api: permissionApiRef,
          deps: {},
          factory: () => mockApis.permission(),
        }),
    }),
  ],
});

const devSidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ items }) => (
      <Sidebar>
        <SidebarGroup label="Menu">
          <SidebarScrollWrapper>
            {items.map((item, index) => (
              <SidebarItem {...item} key={index} />
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

// redirect to this page on load after sign-in
const defaultPage = '/rbac';

const app = createApp({
  features: [rbacPlugin, rbacTranslationsModule, rbacDevModule, devNavModule],
});

const root = app.createRoot();

// Same redirect as dev-utils render(): if at root and we have a default page, go there
if (typeof window !== 'undefined' && window.location.pathname === '/') {
  window.location.pathname = defaultPage;
}

ReactDOM.createRoot(document.getElementById('root')!).render(root);
