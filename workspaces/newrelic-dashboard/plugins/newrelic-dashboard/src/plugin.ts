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

import {
  createPlugin,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  createComponentExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { newRelicDashboardApiRef, NewRelicDashboardClient } from './api';
import { rootRouteRef } from './routes';

/** @public */
export const newRelicDashboardPlugin = createPlugin({
  id: 'new-relic-dashboard',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: newRelicDashboardApiRef,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ configApi, discoveryApi, fetchApi }) =>
        new NewRelicDashboardClient({
          discoveryApi,
          fetchApi,
          baseUrl: configApi.getOptionalString('newrelicdashboard.baseUrl'),
        }),
    }),
  ],
});

/** @public */
export const EntityNewRelicDashboardContent = newRelicDashboardPlugin.provide(
  createComponentExtension({
    name: 'EntityNewRelicDashboardContent',
    component: {
      lazy: () => import('./Router').then(m => m.Router),
    },
  }),
);

/** @public */
export const EntityNewRelicDashboardCard = newRelicDashboardPlugin.provide(
  createComponentExtension({
    name: 'EntityNewRelicDashboardCard',
    component: {
      lazy: () =>
        import('./components/NewRelicDashboard/DashboardEntityList').then(
          m => m.DashboardEntityList,
        ),
    },
  }),
);

/**
 * Render dashboard snapshots from Newrelic in backstage. Use dashboards which have the tag `isDashboardPage: true`
 *
 * @remarks
 * This can be helpful for rendering dashboards outside of Entity Catalog.
 *
 * @public
 */
export const DashboardSnapshot = newRelicDashboardPlugin.provide(
  createComponentExtension({
    name: 'DashboardSnapshot',
    component: {
      lazy: () =>
        import(
          './components/NewRelicDashboard/DashboardSnapshotList/DashboardSnapshot'
        ).then(m => m.DashboardSnapshot),
    },
  }),
);

/**
 * Render dashboard snapshots from Newrelic in backstage. Use dashboards which have the tag `isDashboardPage: true`
 *
 * @deprecated
 * Use DashboardSnapshot export name instead
 *
 * @public
 */
export const DashboardSnapshotComponent = DashboardSnapshot;

/**
 * Render a dashboard snapshots list from Newrelic in backstage. Use dashboards which have the tag `isDashboardPage: true`
 *
 * @remarks
 * This can be helpful for rendering dashboards outside of Entity Catalog.
 *
 * @public
 */
export const DashboardSnapshotList = newRelicDashboardPlugin.provide(
  createComponentExtension({
    name: 'DashboardSnapshotList',
    component: {
      lazy: () =>
        import(
          './components/NewRelicDashboard/DashboardSnapshotList/DashboardSnapshotList'
        ).then(m => m.DashboardSnapshotList),
    },
  }),
);
