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
import { Navigate } from 'react-router';
import { createApp } from '@backstage/frontend-defaults';
import {
  createFrontendModule,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';

import apiDocsPlugin from '@backstage/plugin-api-docs/alpha';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogGraphPlugin from '@backstage/plugin-catalog-graph/alpha';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';
import orgPlugin from '@backstage/plugin-org/alpha';
import scaffolderPlugin from '@backstage/plugin-scaffolder/alpha';
import searchPlugin from '@backstage/plugin-search/alpha';
import techdocsPlugin from '@backstage/plugin-techdocs/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';

import rbacPlugin from '@backstage-community/plugin-rbac/alpha';

import { oidcAuthApi } from './apis';
import { navModule } from './modules/nav';

const homePageExtension = PageBlueprint.make({
  name: 'homePage',
  params: {
    path: '/',
    loader: () => Promise.resolve(<Navigate to="catalog" />),
  },
});

export default createApp({
  features: [
    createFrontendModule({
      pluginId: 'app',
      extensions: [homePageExtension, oidcAuthApi],
    }),
    catalogPlugin,
    catalogImportPlugin,
    catalogGraphPlugin,
    orgPlugin,
    apiDocsPlugin,
    scaffolderPlugin,
    techdocsPlugin,
    userSettingsPlugin,
    searchPlugin,
    rbacPlugin,
    navModule,
  ],
});
