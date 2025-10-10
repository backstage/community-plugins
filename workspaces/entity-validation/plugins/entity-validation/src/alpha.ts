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
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import {
  createFrontendPlugin,
  NavItemBlueprint,
} from '@backstage/frontend-plugin-api';
import { entityValidationPage } from './alpha/entityPages';
import { rootRouteRef } from './routes';
import BuildIcon from '@material-ui/icons/Build';

/** @alpha */
const entityValidationNavItem = NavItemBlueprint.make({
  params: {
    icon: BuildIcon,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    title: 'Entity Validation',
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'entity-validation',
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
  extensions: [entityValidationPage, entityValidationNavItem],
});
