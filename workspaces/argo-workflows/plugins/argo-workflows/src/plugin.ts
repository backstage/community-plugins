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
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

/**
 * The Argo Workflows frontend plugin.
 *
 * @public
 */
export const argoWorkflowsPlugin = createPlugin({
  id: 'argo-workflows',
});

/**
 * Component extension that renders the Argo Workflows CI/CD view
 * for a catalog entity.
 *
 * @public
 */
export const ArgoWorkflowsCI = argoWorkflowsPlugin.provide(
  createComponentExtension({
    name: 'ArgoWorkflowsCI',
    component: {
      lazy: () => import('./components/Router').then(m => m.Router),
    },
  }),
);
