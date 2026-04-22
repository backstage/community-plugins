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
  createFrontendPlugin,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { TranslationBlueprint } from '@backstage/plugin-app-react';
import { argocdApi, argocdInstanceApi } from './apis';
import { argocdDeploymentLifecycleContent } from './entityContent';
import { argocdDeploymentSummaryCard } from './entityCard';
import { argocdTranslations } from '../translations';

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'backstage-community-argocd',
  extensions: [
    argocdApi,
    argocdInstanceApi,
    argocdDeploymentLifecycleContent,
    argocdDeploymentSummaryCard,
  ],
});

/**
 * @alpha
 */
export const argocdTranslationsModule = createFrontendModule({
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
