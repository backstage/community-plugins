/*
 * Copyright 2023 The Backstage Authors
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
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import {
  ApiBlueprint,
  NavItemBlueprint,
  PageBlueprint,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { techRadarApiRef } from './api';
import { DefaultTechRadarApi } from './defaultApi';
import {
  compatWrapper,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import MapIcon from '@material-ui/icons/MyLocation';
import { rootRouteRef } from './plugin';

/** @alpha */
export const techRadarNavItem = NavItemBlueprint.make({
  params: {
    icon: MapIcon,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    title: 'Tech Radar',
  },
});

/** @alpha */
export const techRadarPage = PageBlueprint.makeWithOverrides({
  config: {
    schema: {
      subtitle: z =>
        z
          .string()
          .default('Pick the recommended technologies for your projects'),
      pageTitle: z => z.string().default('Company Radar'),
      width: z => z.number().optional(),
      height: z => z.number().optional(),
    },
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      path: '/tech-radar',
      routeRef: convertLegacyRouteRef(rootRouteRef),
      loader: async () =>
        import('./components').then(m =>
          compatWrapper(<m.RadarPage {...config} />),
        ),
    });
  },
});

/** @alpha */
export const techRadarApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: techRadarApiRef,
      deps: {
        identityApi: identityApiRef,
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ identityApi, discoveryApi, fetchApi }) => {
        return new DefaultTechRadarApi({
          discoveryApi,
          fetchApi,
          identityApi,
        });
      },
    }),
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'tech-radar',
  extensions: [techRadarPage, techRadarApi, techRadarNavItem],
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
});
