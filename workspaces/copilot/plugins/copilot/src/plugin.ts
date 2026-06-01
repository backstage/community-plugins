/*
 * Copyright 2024 The Backstage Authors
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
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  RouteRef,
} from '@backstage/core-plugin-api';
import {
  CopilotClient,
  CopilotClientV2,
  copilotApiRef,
  copilotApiV2Ref,
} from './api';
import {
  copilotRouteRef,
  enterpriseRouteRef,
  organizationRouteRef,
  v2DashboardRouteRef,
  legacyCopilotRouteRef,
} from './routes';

/**
 * The Copilot plugin for Backstage.
 *
 * @public
 */
export const copilotPlugin = createPlugin({
  id: 'copilot',
  apis: [
    createApiFactory({
      api: copilotApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CopilotClient({ discoveryApi, fetchApi }),
    }),
    createApiFactory({
      api: copilotApiV2Ref,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CopilotClientV2({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    copilot: copilotRouteRef,
    enterprise: enterpriseRouteRef,
    organization: organizationRouteRef,
    v2Dashboard: v2DashboardRouteRef,
    legacyCopilot: legacyCopilotRouteRef,
  },
});

/**
 * CopilotIndexPage component for the Copilot plugin.
 *
 * @public
 */
export const CopilotIndexPage = copilotPlugin.provide(
  createRoutableExtension({
    name: 'CopilotIndexPage',
    component: () => import('./components/Pages').then(m => m.CopilotIndexPage),
    mountPoint: copilotRouteRef,
  }),
);

/**
 * CopilotSidebar component for the Copilot plugin.
 *
 * @public
 */
export const CopilotSidebar = copilotPlugin.provide(
  createComponentExtension({
    name: 'OrganizationCopilotPage',
    component: {
      lazy: () => import('./components/Sidebar').then(m => m.Sidebar),
    },
  }),
);

/**
 * V2DashboardPage component for the Copilot plugin.
 *
 * @public
 */
export const V2DashboardPage = copilotPlugin.provide(
  createRoutableExtension({
    name: 'V2DashboardPage',
    component: () => import('./components').then(m => m.V2DashboardPage),
    mountPoint: v2DashboardRouteRef as unknown as RouteRef<undefined>,
  }),
);

/**
 * CopilotLegacyPage component for the Copilot plugin.
 * Renders the pre-v2 dashboard. Only shown when copilot.showLegacyView is true.
 *
 * @public
 */
export const CopilotLegacyPage = copilotPlugin.provide(
  createRoutableExtension({
    name: 'CopilotLegacyPage',
    component: () => import('./components/Pages').then(m => m.HomePage),
    mountPoint: legacyCopilotRouteRef as unknown as RouteRef<undefined>,
  }),
);
