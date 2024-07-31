import { createPlugin } from '@backstage/frontend-plugin-api';
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
export default createPlugin({
  id: 'grafana',
  extensions: [
    grafanaApiExtension,
    entityGrafanaAlertsCard,
    entityGrafanaDashboardsCard,
    entityGrafanaOverviewDashboardViewer,
  ],
});
