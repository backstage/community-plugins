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

/**
 * Legacy frontend system API surface for the Topology plugin.
 *
 * @packageDocumentation
 */
import {
  createPlugin,
  createComponentExtension,
} from '@backstage/core-plugin-api';

/**
 * Topology plugin (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const topologyPlugin = createPlugin({
  id: 'topology',
});

/**
 * Topology page (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const TopologyPage = topologyPlugin.provide(
  createComponentExtension({
    name: 'TopologyPage',
    component: {
      lazy: () =>
        import('./components/Topology').then(m => m.TopologyComponent),
    },
  }),
);

export { isTopologyAvailable } from './isTopologyAvailable';
