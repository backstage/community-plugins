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
import { createApp } from '@backstage/frontend-defaults';
import {
  configApiRef,
  createApiFactory,
  createFrontendModule,
  PageBlueprint,
  ApiBlueprint,
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

import sentryPlugin from '@backstage-community/plugin-sentry/alpha';
import {
  MockSentryApi,
  sentryApiRef,
} from '@backstage-community/plugin-sentry';

const homePageExtension = PageBlueprint.make({
  name: 'home',
  params: {
    defaultPath: '/',
    loader: () => Promise.resolve(<Navigate to="catalog" />),
  },
});

const collectedLegacyPlugins = convertLegacyApp(
  <FlatRoutes>
    <Route path="/api-docs" element={<ApiExplorerPage />} />
  </FlatRoutes>,
);

const scmAuthApi = ApiBlueprint.make({
  name: 'scm-auth',
  params: {
    factory: ScmAuth.createDefaultApiFactory(),
  },
});

const scmIntegrationsApi = ApiBlueprint.make({
  name: 'scm-integrations',
  params: {
    factory: createApiFactory({
      api: scmIntegrationsApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
    }),
  },
});

const sentryMockApi = ApiBlueprint.make({
  name: 'sentry',
  params: {
    factory: createApiFactory({
      api: sentryApiRef,
      deps: {},
      factory: () => new MockSentryApi(),
    }),
  },
});

export const app = createApp({
  features: [
    catalogPlugin,
    catalogImportPlugin,
    userSettingsPlugin,
    sentryPlugin,
    ...collectedLegacyPlugins,
    createFrontendModule({
      pluginId: 'app',
      extensions: [
        homePageExtension,
        scmAuthApi,
        scmIntegrationsApi,
        sentryMockApi,
      ],
    }),
  ],
});

export default app.createRoot();
