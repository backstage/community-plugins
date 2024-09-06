import React from 'react';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entityGrafanaDashboardsCard = EntityCardBlueprint.make({
  name: 'dashboards',
  params: {
    filter: 'kind:component',
    loader: () =>
      import('../components/DashboardsCard').then(m => <m.DashboardsCard />),
  },
});

/**
 * @alpha
 */
export const entityGrafanaAlertsCard = EntityCardBlueprint.make({
  name: 'alerts',
  params: {
    filter: 'kind:component',
    loader: () =>
      import('../components/AlertsCard').then(m => <m.AlertsCard />),
  },
});

/**
 * @alpha
 */
export const entityGrafanaOverviewDashboardViewer = EntityCardBlueprint.make({
  name: 'overview-dashboard',
  params: {
    filter: 'kind:component',
    loader: () =>
      import('../components/DashboardViewer').then(m => (
        <m.EntityDashboardViewer />
      )),
  },
});
