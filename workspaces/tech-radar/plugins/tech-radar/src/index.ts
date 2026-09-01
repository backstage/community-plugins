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

/**
 * A Backstage plugin that lets you display a Tech Radar for your organization
 *
 * @packageDocumentation
 */

import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { techRadarApi } from './apis';
import { techRadarPage } from './pages';
import { rootRouteRef } from './plugin';

/**
 * Tech Radar plugin for the new frontend system.
 *
 * @public
 */
export default createFrontendPlugin({
  pluginId: 'tech-radar',
  extensions: [techRadarPage, techRadarApi],
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
});

export { techRadarApi } from './apis';
export { techRadarPage } from './pages';
export { techRadarApiRef } from './api';
export type { TechRadarApi } from './api';
