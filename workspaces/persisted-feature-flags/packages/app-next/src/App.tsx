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
import { convertLegacyAppRoot } from '@backstage/core-compat-api';
import { createApp } from '@backstage/frontend-defaults';
import {
  createFrontendModule,
  SignInPageBlueprint,
} from '@backstage/frontend-plugin-api';
import { ApiExplorerPage } from '@backstage/plugin-api-docs';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import signalsPlugin from '@backstage/plugin-signals/alpha';
import { SignInPage } from '@backstage/core-components';
import { Route } from 'react-router';

import { navigationExtension } from './components/Sidebar';

import examplePlugins from './components/example-plugins';
import { UserSettingsPage } from '@backstage/plugin-user-settings';
import { customSettingsPage } from './components/settings';
import apis from './apis';

const signInPage = SignInPageBlueprint.make({
  params: {
    loader: async () => props =>
      <SignInPage {...props} providers={['guest']} />,
  },
});

const collectedLegacyPlugins = convertLegacyAppRoot(
  <FlatRoutes>
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route path="/settings" element={<UserSettingsPage />}>
      {customSettingsPage}
    </Route>
  </FlatRoutes>,
);

export const app = createApp({
  features: [
    catalogPlugin,
    catalogImportPlugin,
    userSettingsPlugin,
    signalsPlugin,
    ...collectedLegacyPlugins,
    ...examplePlugins,
    createFrontendModule({
      pluginId: 'app',
      extensions: [signInPage, navigationExtension, ...apis],
    }),
  ],
});

export default app.createRoot();
