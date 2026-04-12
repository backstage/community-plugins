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
import {
  createFrontendModule,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { TranslationBlueprint } from '@backstage/plugin-app-react';
import { rootRouteRef } from '../routes';
import { topologyTranslations } from '../translations';
import { topologyEntityContent } from './extensions/entityTab';

const topologyTranslation = TranslationBlueprint.make({
  params: {
    resource: topologyTranslations,
  },
});

export default createFrontendPlugin({
  pluginId: 'topology',
  extensions: [],
  routes: {
    root: rootRouteRef,
  },
});

export const topologyCatalogModule = createFrontendModule({
  pluginId: 'catalog',
  extensions: [topologyEntityContent],
});

export const topologyTranslationsModule = createFrontendModule({
  pluginId: 'app',
  extensions: [topologyTranslation],
});

export * from '../translations';
