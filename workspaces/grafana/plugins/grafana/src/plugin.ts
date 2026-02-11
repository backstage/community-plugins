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
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { grafanaApiRef, GrafanaApiClient } from './api';
import { readHosts } from './config';

/**
 * The grafana plugin.
 * @public
 */
export const grafanaPlugin = createPlugin({
  id: 'grafana',
  apis: [
    createApiFactory({
      api: grafanaApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, fetchApi, configApi }) => {
        const hosts = readHosts(configApi);

        return new GrafanaApiClient({
          discoveryApi,
          fetchApi,
          hosts,
          grafanaDashboardSearchLimit: configApi.getOptionalNumber(
            'grafana.grafanaDashboardSearchLimit',
          ),
          grafanaDashboardMaxPages: configApi.getOptionalNumber(
            'grafana.grafanaDashboardMaxPages',
          ),
        });
      },
    }),
  ],
});

/**
 * Component which displays the grafana dashboards found for an entity
 * @public
 */
export const EntityGrafanaDashboardsCard = grafanaPlugin.provide(
  createComponentExtension({
    name: 'EntityGrafanaDashboardsCard',
    component: {
      lazy: () =>
        import('./components/DashboardsCard').then(m => m.DashboardsCard),
    },
  }),
);

/**
 * Component which displays the grafana alerts found for an entity
 * @public
 */
export const EntityGrafanaAlertsCard = grafanaPlugin.provide(
  createComponentExtension({
    name: 'EntityGrafanaAlertsCard',
    component: {
      lazy: () => import('./components/AlertsCard').then(m => m.AlertsCard),
    },
  }),
);

/**
 * Component which displays the defined grafana dashboard for an entity
 * @public
 */
export const EntityOverviewDashboardViewer = grafanaPlugin.provide(
  createComponentExtension({
    name: 'EntityOverviewDashboardViewer',
    component: {
      lazy: () =>
        import('./components/DashboardViewer').then(
          m => m.EntityDashboardViewer,
        ),
    },
  }),
);
