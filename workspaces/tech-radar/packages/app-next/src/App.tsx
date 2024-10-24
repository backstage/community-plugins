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
import { createApp } from '@backstage/frontend-defaults';
import {
  configApiRef,
  createApiFactory,
  createFrontendModule,
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
import { Navigate } from 'react-router';
import {
  TechRadarApi,
  techRadarApiRef,
} from '@backstage-community/plugin-tech-radar';
import { TechRadarLoaderResponse } from '@backstage-community/plugin-tech-radar-common';
import techRadarPlugin from '@backstage-community/plugin-tech-radar/alpha';

const homePageExtension = PageBlueprint.make({
  name: 'homePage',
  params: {
    defaultPath: '/',
    loader: () => Promise.resolve(<Navigate to="catalog" />),
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
        homePageExtension,
        scmAuthExtension,
        scmIntegrationApi,
        techRadarApi, // comment this line out to test the default API implementation
      ],
    }),
  ],
});

export default app.createRoot();
