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
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  ApiBlueprint,
  createFrontendPlugin,
  NavItemBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { copilotApiRef, CopilotClient } from '../api';

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
} from '../routes';

/** @alpha */
export const copilotApi = ApiBlueprint.make({
  params: {
    factory: createApiFactory({
      api: copilotApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CopilotClient({ discoveryApi, fetchApi }),
    }),
  },
});

/** @alpha */
export const copilotPage = PageBlueprint.make({
  params: {
    defaultPath: '/copilot',
    routeRef: convertLegacyRouteRef(copilotRouteRef),
    loader: () =>
      import('../components/Pages').then(m =>
        compatWrapper(<m.CopilotIndexPage />),
      ),
  },
});

/**
 * @alpha
 */
export const copilotNavItem = NavItemBlueprint.make({
  params: {
    title: 'Copilot',
    routeRef: convertLegacyRouteRef(copilotRouteRef),
    icon: SupportAgentIcon,
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'copilot',
  extensions: [copilotApi, copilotPage, copilotNavItem],
  routes: convertLegacyRouteRefs({
    copilot: copilotRouteRef,
    enterprise: enterpriseRouteRef,
    organization: organizationRouteRef,
  }),
});
