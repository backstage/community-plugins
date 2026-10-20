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
  createRouteRef,
  PageBlueprint,
  SubPageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  copilotApiRef,
  copilotApiV2Ref,
  CopilotClient,
  CopilotClientV2,
} from '../api';
import { myMetricsApiRef } from '../me/api';
import { MyMetricsClient } from '../me/api/MyMetricsClient';
import { copilotMeRouteRef } from '../me/routes';

import { compatWrapper } from '@backstage/core-compat-api';

import { RiCopilotLine as CopilotIcon } from '@remixicon/react';

export const copilotRouteRef = createRouteRef();

/** @alpha */
export const copilotLegacyApi = ApiBlueprint.make({
  name: 'copilot-legacy',
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
export const copilotApi = ApiBlueprint.make({
  name: 'copilot',
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
    title: 'Copilot Insights',
    icon: <CopilotIcon />,
    routeRef: copilotRouteRef,
  },
});

/**
 * The default Copilot V2 dashboard, rendered at `/copilot/v2` and used as
 * the parent page's default tab.
 *
 * @alpha
 */
export const copilotDashboardPage = SubPageBlueprint.make({
  name: 'dashboard',
  attachTo: { id: 'page:copilot', input: 'pages' },
  params: {
    path: '',
    title: 'Copilot Usage',
    loader: () =>
      import('../components').then(m => compatWrapper(<m.V2DashboardPage />)),
  },
});

/**
 * The privacy-scoped, individual ("me") Copilot metrics API. Its only
 * method resolves the caller's own login server-side, so this client can
 * never be used to fetch another user's or a team's metrics.
 *
 * @alpha
 */
export const copilotMyMetricsApi = ApiBlueprint.make({
  name: 'copilot-my-metrics',
  params: defineParams =>
    defineParams({
      api: myMetricsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new MyMetricsClient({ discoveryApi, fetchApi }),
    }),
});

/**
 * The individual ("me") Copilot metrics sub-page, mounted by default at
 * `/copilot/me` as a tab of the main `copilot` page. Consumers can override
 * this extension's `attachTo` to mount it elsewhere (see the
 * `copilot-me-override` example module in the sample app).
 *
 * @alpha
 */
export const copilotMePage = SubPageBlueprint.make({
  name: 'me',
  attachTo: { id: 'page:copilot', input: 'pages' },
  params: {
    path: 'me',
    title: 'My Copilot Metrics',
    routeRef: copilotMeRouteRef,
    loader: () => import('../me/components').then(m => <m.MyMetricsContent />),
  },
});

/** @alpha */
export const copilotLegacyPage = PageBlueprint.make({
  name: 'legacy',
  params: {
    path: '/copilot/legacy',
    title: 'Copilot Legacy',
    loader: () =>
      import('../components/Pages').then(m => compatWrapper(<m.HomePage />)),
  },
});

/** @alpha */
export const copilotLegacyEnterprisePage = PageBlueprint.make({
  name: 'legacy-enterprise',
  params: {
    path: '/copilot/legacy/enterprise',
    title: 'Copilot Legacy Enterprise',
    loader: () =>
      import('../components/Pages/EnterprisePage').then(m =>
        compatWrapper(<m.EnterprisePage />),
      ),
  },
});

/** @alpha */
export const copilotLegacyOrganizationPage = PageBlueprint.make({
  name: 'legacy-organization',
  params: {
    path: '/copilot/legacy/organization',
    title: 'Copilot Legacy Organization',
    loader: () =>
      import('../components/Pages/OrganizationPage').then(m =>
        compatWrapper(<m.OrganizationPage />),
      ),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'copilot',
  extensions: [
    copilotLegacyApi,
    copilotApi,
    copilotPage,
    copilotDashboardPage,
    copilotMyMetricsApi,
    copilotMePage,
    copilotLegacyPage,
    copilotLegacyEnterprisePage,
    copilotLegacyOrganizationPage,
  ],
  routes: {
    copilot: copilotRouteRef,
    copilotMe: copilotMeRouteRef,
  },
});
