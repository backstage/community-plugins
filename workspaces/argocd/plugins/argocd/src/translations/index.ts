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

import { createTranslationResource } from '@backstage/core-plugin-api/alpha';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { TranslationBlueprint } from '@backstage/plugin-app-react';

import { argocdTranslationRef } from './ref';

/**
 * The translation resource for the ArgoCD plugin
 * @public
 */
export const argocdTranslations = createTranslationResource({
  ref: argocdTranslationRef,
  translations: {
    de: () => import('./de'),
    es: () => import('./es'),
    fr: () => import('./fr'),
    it: () => import('./it'),
    ja: () => import('./ja'),
  },
});

export { argocdTranslationRef };

/**
 * Translation module for the ArgoCD plugin (new frontend system).
 * @public
 */
const argocdTranslationsModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    TranslationBlueprint.make({
      name: 'argocd-translations',
      params: {
        resource: argocdTranslations,
      },
    }),
  ],
});

export default argocdTranslationsModule;
