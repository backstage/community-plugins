/*
 * Copyright 2020 The Backstage Authors
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

import { techRadarApiRef } from './api';
import { SampleTechRadarApi } from './sample';
import {
  createPlugin,
  createRouteRef,
  createRoutableExtension,
  createApiFactory,
} from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'tech-radar',
});

/**
 * Tech Radar plugin instance
 *
 * @public
 */
export const techRadarPlugin = createPlugin({
  id: 'tech-radar',
  routes: {
    root: rootRouteRef,
  },
  apis: [createApiFactory(techRadarApiRef, new SampleTechRadarApi())],
});

/**
 * Main Tech Radar Page
 *
 * @remarks
 *
 * Uses {@link TechRadarPageProps} as props
 *
 * @public
 */
export const TechRadarPage = techRadarPlugin.provide(
  createRoutableExtension({
    name: 'TechRadarPage',
    component: () => import('./components/RadarPage').then(m => m.RadarPage),
    mountPoint: rootRouteRef,
  }),
);
