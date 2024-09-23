import React from 'react';
import { createApp } from '@backstage/frontend-defaults';
import {
  configApiRef,
  createApiFactory,
  createFrontendModule,
  SignInPageBlueprint,
  ApiBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  ScmAuth,
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';
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
} from '@backstage/theme';
import { Navigate } from 'react-router';
import { SignInPage } from './components/auth/SignInPage';
import techRadarPlugin from '@backstage-community/plugin-tech-radar/alpha';
import {
  TechRadarApi,
  TechRadarLoaderResponse,
  techRadarApiRef,
} from '@backstage-community/plugin-tech-radar';

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

const homePageExtension = PageBlueprint.make({
  name: 'homePage',
  params: {
    defaultPath: '/',
    loader: () => Promise.resolve(<Navigate to="catalog" />),
  },
});

const signInPage = SignInPageBlueprint.make({
  name: 'SignInPage',
  params: {
    loader: async () => props => <SignInPage {...props} />,
  },
});

const scmAuthExtension = ApiBlueprint.make({
  name: 'scmAuth',
  params: {
    factory: ScmAuth.createDefaultApiFactory(),
  },
});

const scmIntegrationApi = ApiBlueprint.make({
  name: 'scmIntegrationsApi',
  params: {
    factory: createApiFactory({
      api: scmIntegrationsApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
    }),
  },
});

const mock: TechRadarLoaderResponse = {
  entries: [],
  quadrants: [
    { id: 'infrastructure', name: 'Infrastructure' },
    { id: 'frameworks', name: 'Frameworks' },
    { id: 'languages', name: 'Languages' },
    { id: 'process', name: 'Process' },
  ],
  rings: [],
};
class SampleTechRadarApi implements TechRadarApi {
  async load() {
    return mock;
  }
}

// overriding the api is one way to change the radar content
const techRadarApi = ApiBlueprint.make({
  name: 'techRadarApi',
  params: {
    factory: createApiFactory(techRadarApiRef, new SampleTechRadarApi()),
  },
});

export const app = createApp({
  features: [
    catalogPlugin,
    catalogImportPlugin,
    userSettingsPlugin,
    techRadarPlugin,
    createFrontendModule({
      pluginId: 'app',
      extensions: [
        signInPage,
        homePageExtension,
        scmAuthExtension,
        scmIntegrationApi,
        techRadarApi,
      ],
    }),
  ],
});

export default app.createRoot();
