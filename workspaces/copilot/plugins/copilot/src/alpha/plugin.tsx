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

import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import {
  ApiBlueprint,
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  copilotApiRef,
  copilotApiV2Ref,
  CopilotClient,
  CopilotClientV2,
} from '../api';

import {
  compatWrapper,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';

import { SupportAgent as SupportAgentIcon } from '@mui/icons-material';

import {
  copilotRouteRef,
  enterpriseRouteRef,
  organizationRouteRef,
  v2DashboardRouteRef,
  legacyCopilotRouteRef,
} from '../routes';

/** @alpha */
export const copilotApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: copilotApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CopilotClient({ discoveryApi, fetchApi }),
    }),
});

/** @alpha */
export const copilotApiV2 = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: copilotApiV2Ref,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CopilotClientV2({ discoveryApi, fetchApi }),
    }),
});

/** @alpha */
export const copilotPage = PageBlueprint.make({
  params: {
    path: '/copilot',
    title: 'Copilot',
    icon: <SupportAgentIcon />,
    routeRef: convertLegacyRouteRef(copilotRouteRef),
    loader: () =>
      import('../components/Pages').then(m =>
        compatWrapper(<m.CopilotIndexPage />),
      ),
  },
});

/** @alpha */
export const copilotV2Page = PageBlueprint.make({
  params: {
    path: '/copilot/v2',
    title: 'Copilot V2',
    icon: <SupportAgentIcon />,
    routeRef: convertLegacyRouteRef(v2DashboardRouteRef as any),
    loader: () =>
      import('../components').then(m => compatWrapper(<m.V2DashboardPage />)),
  },
});

/** @alpha */
export const copilotLegacyPage = PageBlueprint.make({
  params: {
    path: '/copilot/legacy',
    title: 'Copilot Legacy',
    icon: <SupportAgentIcon />,
    routeRef: convertLegacyRouteRef(legacyCopilotRouteRef as any),
    loader: () =>
      import('../components/Pages').then(m => compatWrapper(<m.HomePage />)),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'copilot',
  extensions: [
    copilotApi,
    copilotApiV2,
    copilotPage,
    copilotV2Page,
    copilotLegacyPage,
  ],
  routes: convertLegacyRouteRefs({
    copilot: copilotRouteRef,
    enterprise: enterpriseRouteRef,
    organization: organizationRouteRef,
    v2Dashboard: v2DashboardRouteRef,
    legacyCopilot: legacyCopilotRouteRef,
  }),
});
