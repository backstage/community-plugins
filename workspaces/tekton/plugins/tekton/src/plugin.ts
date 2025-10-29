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
  createComponentExtension,
  createPlugin,
} from '@backstage/core-plugin-api';

/**
 * A Tekton plugin.
 *
 * @public
 */
export const tektonPlugin = createPlugin({
  id: 'tekton',
});

/**
 * Component for the catalog entity CI/CD tab.
 *
 * @public
 */
export const TektonCI = tektonPlugin.provide(
  createComponentExtension({
    name: 'TektonCI',
    component: {
      lazy: () => import('./components/Router').then(m => m.Router),
    },
  }),
);
