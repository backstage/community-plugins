/*
 * Copyright 2021 The Backstage Authors
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

import { createBackendFeatureLoader } from '@backstage/backend-plugin-api';
import {
  techInsightsPlugin,
  techInsightsFactInsertServiceFactory,
} from './plugin';

/**
 * The default export bundles the tech-insights plugin together with built-in
 * service factories (such as {@link techInsightsFactInsertServiceFactory}) so
 * a single `backend.add(import('@backstage-community/plugin-tech-insights-backend'))`
 * registers everything needed to read and write facts.
 *
 * Note: prior to this change the default export was `techInsightsPlugin`
 * directly. The two are interchangeable when passed to `backend.add(...)`,
 * but consumers who imported the default and used it outside of
 * `backend.add` (for example, in custom composition or tests) may need to
 * switch to the named `techInsightsPlugin` export.
 *
 * @public
 */
export default createBackendFeatureLoader({
  loader: () => [techInsightsPlugin, techInsightsFactInsertServiceFactory],
});

export {
  techInsightsPlugin,
  techInsightsFactInsertServiceFactory,
} from './plugin';
export * from './deprecated';
export * from './service';
