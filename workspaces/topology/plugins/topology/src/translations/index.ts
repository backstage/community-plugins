/*
 * Copyright 2025 The Backstage Authors
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
  createTranslationResource,
} from '@backstage/frontend-plugin-api';
import { TranslationBlueprint } from '@backstage/plugin-app-react';
import { topologyTranslationRef } from './ref';

/**
 * Translation resources for the Topology plugin.
 * @alpha
 */
export const topologyTranslations = createTranslationResource({
  ref: topologyTranslationRef,
  translations: {
    de: () => import('./de'),
    fr: () => import('./fr'),
    it: () => import('./it'),
    es: () => import('./es'),
    ja: () => import('./ja'),
  },
});

export { topologyTranslationRef };

/**
 * App module that automatically registers the topology plugin translations.
 *
 * @public
 */
export const topologyTranslationsModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    TranslationBlueprint.make({
      name: 'topology-translations',
      params: {
        resource: topologyTranslations,
      },
    }),
  ],
});

export default topologyTranslationsModule;
