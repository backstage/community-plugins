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
  ApiBlueprint,
  configApiRef,
  NavItemBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { rootRouteRef } from '../plugin';
import { lighthouseApiRef } from '../api';
import { LighthouseRestApi } from '@backstage-community/plugin-lighthouse-common';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { isLighthouseAvailable } from '../Router';
import Highlight from '@material-ui/icons/Highlight';

export const lighthousePage = PageBlueprint.make({
  params: {
    path: '/lighthouse',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: async () =>
      import('../Router').then(m => compatWrapper(<m.Router />)),
  },
});

export const lighthouseApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: lighthouseApiRef,
      deps: {
        configApi: configApiRef,
      },
      factory: ({ configApi }) => LighthouseRestApi.fromConfig(configApi),
    }),
});

export const lighthouseNavItem = NavItemBlueprint.make({
  params: {
    icon: Highlight,
    routeRef: convertLegacyRouteRef(rootRouteRef),
    title: 'Lighthouse',
  },
});

export const lighthouseEntityCard = EntityCardBlueprint.make({
  name: 'lighthouse',
  params: {
    filter: isLighthouseAvailable,
    loader: async () =>
      import('../components/Cards/LastLighthouseAuditCard').then(m =>
        compatWrapper(<m.LastLighthouseAuditCard />),
      ),
  },
});

export const lighthouseEntityContent = EntityContentBlueprint.make({
  name: 'lighthouse',
  params: {
    path: '/lighthouse',
    title: 'Lighthouse',
    filter: isLighthouseAvailable,
    loader: async () =>
      import('../Router').then(m => compatWrapper(<m.EmbeddedRouter />)),
  },
});
