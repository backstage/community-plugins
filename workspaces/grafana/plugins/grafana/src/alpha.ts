import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  entityGrafanaAlertsCard,
  entityGrafanaDashboardsCard,
  entityGrafanaOverviewDashboardViewer,
  grafanaApiExtension,
} from './alpha/index';

/**
 * The Grafana backstage plugin.
 *
 * @alpha
 */
export default createFrontendPlugin({
  id: 'grafana',
  extensions: [
    grafanaApiExtension,
    entityGrafanaAlertsCard,
    entityGrafanaDashboardsCard,
    entityGrafanaOverviewDashboardViewer,
  ],
});
