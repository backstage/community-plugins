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
  createFrontendPlugin,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { TranslationBlueprint } from '@backstage/plugin-app-react';
import { rbacApi, licensedUsersApi } from './apis';
import rbacNavItem from './navItems';
import rbacPage from './pages';
import { rootRouteRef } from '../routes';
import { rbacTranslations } from './translations';

/**
 * RBAC plugin
 * @alpha
 */

export default createFrontendPlugin({
  pluginId: 'rbac',
  info: { packageJson: () => import('../../package.json') },
  extensions: [rbacApi, licensedUsersApi, rbacPage, rbacNavItem],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * Translation module for the rbac plugin
 * @alpha
 */

const rbacTranslationsModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    TranslationBlueprint.make({
      name: 'rbac-translations',
      params: {
        resource: rbacTranslations,
      },
    }),
  ],
});

export { rbacTranslationsModule };

export { rbacTranslationRef, rbacTranslations } from './translations';
