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
  compatWrapper,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import {
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import MoneyIcon from '@material-ui/icons/MonetizationOn';
import { rootRouteRef } from './routes';

const openCostPage = PageBlueprint.make({
  params: {
    path: '/opencost',
    title: 'OpenCost',
    icon: <MoneyIcon />,
    noHeader: true,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('./components/OpenCostPage').then(m =>
        compatWrapper(<m.OpenCostPage />),
      ),
  },
});

/** @alpha */
const openCostFrontendPlugin = createFrontendPlugin({
  pluginId: 'opencost',
  extensions: [openCostPage],
  routes: convertLegacyRouteRefs({ root: rootRouteRef }),
});

export default openCostFrontendPlugin;
