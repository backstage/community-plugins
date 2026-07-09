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
 * New Frontend System dev mode for the RBAC plugin using mock API data (e2e / UI-only).
 */
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';
import { createApp } from '@backstage/frontend-defaults';
import ReactDOM from 'react-dom/client';

import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { configApiRef } from '@backstage/core-plugin-api';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { mockApis } from '@backstage/test-utils';

import { rbacApiRef } from '../../src/api/RBACBackendClient';
import { licensedUsersApiRef } from '../../src/api/LicensedUsersClient';
import rbacPlugin, { rbacTranslationsModule } from '../../src/alpha';
import { mockConfigApi, mockLicensedUsersApi, mockRBACApi } from '../mocks';
import { devSidebarContent } from './shared';

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
  ],
});

const devNavModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    devSidebarContent,
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

const defaultPage = '/rbac';

const app = createApp({
  features: [rbacPlugin, rbacTranslationsModule, rbacDevModule, devNavModule],
});

const root = app.createRoot();

if (typeof window !== 'undefined' && window.location.pathname === '/') {
  window.location.pathname = defaultPage;
}

ReactDOM.createRoot(document.getElementById('root')!).render(root);
