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
import { z } from 'zod';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import {
  isAlertSelectorAvailable,
  isDashboardSelectorAvailable,
  isOverviewDashboardAvailable,
} from '../constants';

/**
 * The table options both cards accept, as the legacy `EntityGrafanaAlertsCard`
 * and `EntityGrafanaDashboardsCard` components take them as props. Exposed as
 * extension config so the New Frontend System can set them from
 * `app-config.yaml`; without this the cards always rendered with the defaults.
 */
const tableOptionsSchema = {
  paged: z.boolean().optional(),
  searchable: z.boolean().optional(),
  pageSize: z.number().int().positive().optional(),
  sortable: z.boolean().optional(),
  title: z.string().optional(),
};

/**
 * @alpha
 */
export const entityGrafanaDashboardsCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'dashboards',
    // `additionalDashboards` is a function and cannot come from config, so it
    // stays a prop of the legacy component only.
    configSchema: tableOptionsSchema,
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: entity => Boolean(isDashboardSelectorAvailable(entity)),
        loader: async () =>
          import('../components/DashboardsCard').then(m => (
            <m.DashboardsCard {...config} />
          )),
      });
    },
  });

/**
 * @alpha
 */
export const entityGrafanaAlertsCard = EntityCardBlueprint.makeWithOverrides({
  name: 'alerts',
  configSchema: {
    ...tableOptionsSchema,
    showState: z.boolean().optional(),
  },
  factory(originalFactory, { config }) {
    return originalFactory({
      filter: entity =>
        Boolean(isDashboardSelectorAvailable(entity)) ||
        isAlertSelectorAvailable(entity),
      loader: async () =>
        import('../components/AlertsCard').then(m => (
          <m.AlertsCard {...config} />
        )),
    });
  },
});

/**
 * @alpha
 */
export const entityGrafanaOverviewDashboardViewer = EntityCardBlueprint.make({
  name: 'overview-dashboard',
  params: {
    filter: entity => isOverviewDashboardAvailable(entity),
    loader: () =>
      import('../components/DashboardViewer').then(m => (
        <m.EntityDashboardViewer />
      )),
  },
});
