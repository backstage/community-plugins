import React from 'react';
import { createEntityCardExtension } from '@backstage/plugin-catalog-react/alpha';

/**
 * @alpha
 */
export const entityGrafanaDashboardsCard = createEntityCardExtension({
  name: 'dashboards',
  loader: () =>
    import('../components/DashboardsCard').then(m => <m.DashboardsCard />),
});

/**
 * @alpha
 */
export const entityGrafanaAlertsCard = createEntityCardExtension({
  name: 'alerts',
  loader: () => import('../components/AlertsCard').then(m => <m.AlertsCard />),
});

/**
 * @alpha
 */
export const entityGrafanaOverviewDashboardViewer = createEntityCardExtension({
  name: 'overview-dashboard',
  loader: () =>
    import('../components/DashboardViewer').then(m => (
      <m.EntityDashboardViewer />
    )),
});
