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
import { createApp } from '@backstage/frontend-defaults';
import {
  createFrontendModule,
  ApiBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import catalogImportPlugin from '@backstage/plugin-catalog-import/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import { Navigate } from 'react-router';
import { techRadarApiRef } from '@backstage-community/plugin-tech-radar';
import techRadarPlugin from '@backstage-community/plugin-tech-radar/alpha';
import { SampleTechRadarApi } from './sampleTechRadarApi';

const homePageExtension = PageBlueprint.make({
  name: 'homePage',
  params: {
    path: '/',
    loader: () => Promise.resolve(<Navigate to="catalog" />),
  },
});

// Overrides the Tech Radar plugin's API with local mock data. A module for the
// plugin replaces the plugin's own 'api:tech-radar' extension. Remove
// techRadarModuleSampleData from the features below to load the data
// configured in app-config.yaml instead.
const techRadarModuleSampleData = createFrontendModule({
  pluginId: 'tech-radar',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: techRadarApiRef,
          deps: {},
          factory: () => new SampleTechRadarApi(),
        }),
    }),
  ],
});

export const app = createApp({
  features: [
    catalogPlugin,
    catalogImportPlugin,
    userSettingsPlugin,
    techRadarPlugin,
    techRadarModuleSampleData,
    createFrontendModule({
      pluginId: 'app',
      extensions: [homePageExtension],
    }),
  ],
});

export default app.createRoot();
