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
  createFrontendPlugin,
  PageBlueprint,
  type FrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import { rootRouteRef } from './routes';

const wheelOfNamesPage = PageBlueprint.make({
  params: {
    // This is the path that was previously defined in the app code.
    // It's labelled as the default one because it can be changed via configuration.
    path: '/wheel-of-names',
    // You can reuse the existing routeRef by wrapping it with convertLegacyRouteRef.
    routeRef: convertLegacyRouteRef(rootRouteRef),
    // these inputs usually match the props required by the component.
    loader: () =>
      import('./pages/WheelOfNamesPage').then(m =>
        // The compatWrapper utility allows you to keep using @backstage/core-plugin-api in the
        // implementation of the component and switch to @backstage/frontend-plugin-api later.
        compatWrapper(<m.WheelOfNamesPage />),
      ),
  },
});

/**
 * The Wheel of Names plugin instance for the new frontend system.
 * @alpha
 */
const plugin: FrontendPlugin = createFrontendPlugin({
  // The plugin ID is now provided as `pluginId` instead of `id`
  pluginId: 'wheel-of-names',
  // bind all the extensions to the plugin
  extensions: [wheelOfNamesPage],
  // convert old route refs to the new system
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
});

export default plugin;
