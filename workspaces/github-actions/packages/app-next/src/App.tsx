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
import { FlatRoutes } from '@backstage/core-app-api';
import { convertLegacyApp } from '@backstage/core-compat-api';
import { createApp } from '@backstage/frontend-defaults';
import {
  createFrontendModule,
  PageBlueprint,
  SignInPageBlueprint,
} from '@backstage/frontend-plugin-api';

import { ApiExplorerPage } from '@backstage/plugin-api-docs';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import { Navigate, Route } from 'react-router';

import { navigationExtension } from './components/Sidebar';
import { SignInPage } from './components/auth/SignInPage';

import githubActionsPlugin from '@backstage-community/plugin-github-actions/alpha';

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props => <SignInPage {...props} />,
  },
});

const homePageExtension = PageBlueprint.make({
  name: 'home',
  params: {
    path: '/',
    loader: () => Promise.resolve(<Navigate to="catalog" />),
  },
});

const collectedLegacyPlugins = convertLegacyApp(
  <FlatRoutes>
    <Route path="/api-docs" element={<ApiExplorerPage />} />
  </FlatRoutes>,
);

export const app = createApp({
  features: [
    catalogPlugin,
    catalogImportPlugin,
    userSettingsPlugin,
    githubActionsPlugin,
    ...collectedLegacyPlugins,
    createFrontendModule({
      pluginId: 'app',
      extensions: [signInPage, homePageExtension, navigationExtension],
    }),
  ],
});

export default app.createRoot();
