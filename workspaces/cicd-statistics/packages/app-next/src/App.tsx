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
import React from 'react';
import { Navigate, Route } from 'react-router';

import { navigationExtension } from './components/Sidebar';
import { SignInPage } from './components/auth/SignInPage';

import cicdStatisticsPlugin from '@backstage-community/plugin-cicd-statistics/alpha';
import cicdStatisticsGitlabPlugin from '@backstage-community/plugin-cicd-statistics-module-gitlab/alpha';

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

const signInPage = createSignInPageExtension({
  name: 'signInPage',
  loader: async () => props => <SignInPage {...props} />,
});

const homePageExtension = createPageExtension({
  namespace: 'home',
  defaultPath: '/',
  loader: () => Promise.resolve(<Navigate to="catalog" />),
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

export const app = createApp({
  features: [
    catalogPlugin,
    catalogImportPlugin,
    userSettingsPlugin,
    cicdStatisticsPlugin,
    cicdStatisticsGitlabPlugin,
    ...collectedLegacyPlugins,
    createExtensionOverrides({
      extensions: [
        signInPage,
        darkThemeExtension,
        lightThemeExtension,
        homePageExtension,
        scmAuthExtension,
        scmIntegrationApi,
        navigationExtension,
      ],
    }),
  ],
});

export default app.createRoot();
