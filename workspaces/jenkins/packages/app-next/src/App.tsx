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
import React from 'react';
import { FlatRoutes } from '@backstage/core-app-api';
import { convertLegacyApp } from '@backstage/core-compat-api';
import { createApp } from '@backstage/frontend-app-api';
import {
  ApiBlueprint,
  configApiRef,
  createApiFactory,
  createExtensionOverrides,
  createFrontendModule,
  PageBlueprint,
  SignInPageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  ScmAuth,
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';
import { ApiExplorerPage } from '@backstage/plugin-api-docs';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import { Navigate, Route } from 'react-router';

import jenkinsPlugin from '@backstage-community/plugin-jenkins/alpha';
import { SignInPage } from '@backstage/core-components';

const homePageExtension = PageBlueprint.make({
  name: 'catalog-root',
  params: {
    defaultPath: '/',
    loader: () => Promise.resolve(<Navigate to="catalog" />),
  },
});

const signInPage = SignInPageBlueprint.make({
  name: 'guest',
  params: {
    loader: async () => props =>
      <SignInPage {...props} providers={['guest']} />,
  },
});

export const signInPageModule = createFrontendModule({
  pluginId: 'app',
  extensions: [signInPage],
});

const collectedLegacyPlugins = convertLegacyApp(
  <FlatRoutes>
    <Route path="/api-docs" element={<ApiExplorerPage />} />
  </FlatRoutes>,
);

const scmModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    ApiBlueprint.make({
      name: 'scm-auth',
      params: {
        factory: ScmAuth.createDefaultApiFactory(),
      },
    }),
    ApiBlueprint.make({
      name: 'scm-integrations',
      params: {
        factory: createApiFactory({
          api: scmIntegrationsApiRef,
          deps: { configApi: configApiRef },
          factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
        }),
      },
    }),
  ],
});

export const app = createApp({
  features: [
    catalogPlugin,
    catalogImportPlugin,
    userSettingsPlugin,
    jenkinsPlugin,
    ...collectedLegacyPlugins,
    signInPageModule,
    scmModule,
    createExtensionOverrides({
      extensions: [homePageExtension],
    }),
  ],
});

export default app.createRoot();
