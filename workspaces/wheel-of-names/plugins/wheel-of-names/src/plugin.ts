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
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

/**
 * The Wheel of Names plugin instance.
 * @public
 */
export const wheelOfNamesPlugin = createPlugin({
  id: 'wheel-of-names',
  routes: {
    root: rootRouteRef,
  },
});

/**
 * A page component that displays the Wheel of Names functionality.
 * @public
 */
export const WheelOfNamesPage = wheelOfNamesPlugin.provide(
  createRoutableExtension({
    name: 'WheelOfNamesPage',
    component: () =>
      import('./pages/WheelOfNamesPage').then(m => m.WheelOfNamesPage),
    mountPoint: rootRouteRef,
  }),
);
