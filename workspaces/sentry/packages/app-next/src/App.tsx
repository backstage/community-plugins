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
  configApiRef,
  createApiExtension,
  createApiFactory,
  createExtensionOverrides,
  createPageExtension,
  createSignInPageExtension,
  createThemeExtension,
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
import {
  createUnifiedTheme,
  createBaseThemeOptions,
  pageTheme as defaultPageThemes,
  palettes,
  genPageTheme,
  colorVariants,
  shapes,
  UnifiedTheme,
  UnifiedThemeProvider,
} from '@backstage/theme';
import { Navigate, Route } from 'react-router';

import sentryPlugin from '@backstage-community/plugin-sentry/alpha';
import {
  MockSentryApi,
  sentryApiRef,
} from '@backstage-community/plugin-sentry';
import { SignInPage } from './components/auth/SignInPage';

const pageTheme = {
  ...defaultPageThemes,
  dataset: genPageTheme({
    colors: colorVariants.purpleSky,
    shape: shapes.wave,
  }),
};

export const lightTheme: UnifiedTheme = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: { ...palettes.light },
  }),
  pageTheme,
});

export const darkTheme: UnifiedTheme = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: { ...palettes.dark },
  }),
  pageTheme,
});

const lightThemeExtension = createThemeExtension({
  id: 'mui-light',
  title: 'MUI Light',
  variant: 'light',
  Provider: ({ children }) => (
    <UnifiedThemeProvider theme={lightTheme} children={children} />
  ),
});
const darkThemeExtension = createThemeExtension({
  id: 'mui-dark',
  title: 'MUI Dark',
  variant: 'dark',
  Provider: ({ children }) => (
    <UnifiedThemeProvider theme={darkTheme} children={children} />
  ),
});

const homePageExtension = createPageExtension({
  namespace: 'home',
  defaultPath: '/',
  loader: () => Promise.resolve(<Navigate to="catalog" />),
});

const signInPage = createSignInPageExtension({
  name: 'signInPage',
  loader: async () => props => <SignInPage {...props} />,
});

const collectedLegacyPlugins = convertLegacyApp(
  <FlatRoutes>
    <Route path="/api-docs" element={<ApiExplorerPage />} />
  </FlatRoutes>,
);

const scmAuthExtension = createApiExtension({
  factory: ScmAuth.createDefaultApiFactory(),
});

const scmIntegrationApi = createApiExtension({
  factory: createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
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
    createExtensionOverrides({
      extensions: [
        signInPage,
        darkThemeExtension,
        lightThemeExtension,
        homePageExtension,
        scmAuthExtension,
        scmIntegrationApi,
        sentryMockApi,
      ],
    }),
  ],
});

export default app.createRoot();
