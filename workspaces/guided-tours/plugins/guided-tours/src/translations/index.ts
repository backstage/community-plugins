/*
 * Copyright 2026 The Backstage Authors
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
import { guidedTourTranslationRef } from './ref';

/**
 * German, Spanish, French, Italian and Japanese translations of the guided
 * tours plugin.
 *
 * @alpha
 */
export const guidedToursTranslations = createTranslationResource({
  ref: guidedTourTranslationRef,
  translations: {
    de: () => import('./de'),
    es: () => import('./es'),
    fr: () => import('./fr'),
    it: () => import('./it'),
    ja: () => import('./ja'),
  },
});

export { guidedTourTranslationRef };

/**
 * App module that registers the translations of the guided tours plugin.
 *
 * @alpha
 */
export const guidedToursTranslationsModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    TranslationBlueprint.make({
      name: 'guided-tours-translations',
      params: {
        resource: guidedToursTranslations,
      },
    }),
  ],
});

export default guidedToursTranslationsModule;
