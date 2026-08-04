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
import { createTranslationResource } from '@backstage/core-plugin-api/alpha';
import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { TranslationBlueprint } from '@backstage/plugin-app-react';
import { rbacTranslationRef } from './ref';

/**
 * @public
 */
export const rbacTranslations = createTranslationResource({
  ref: rbacTranslationRef,
  translations: {
    de: () => import('./de'),
    fr: () => import('./fr'),
    it: () => import('./it'),
    es: () => import('./es'),
    ja: () => import('./ja'),
  },
});

export { rbacTranslationRef };

/**
 * Translation module for the RBAC plugin.
 * @public
 */
const rbacTranslationsModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    TranslationBlueprint.make({
      name: 'rbac-translations',
      params: {
        resource: rbacTranslations,
      },
    }),
  ],
});

export default rbacTranslationsModule;
