import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createPlugin } from '@backstage/frontend-plugin-api';
import { entityCicdChartsContent } from './alpha/index';
import { rootCatalogCicdStatsRouteRef } from './plugin';

/**
 * @alpha
 */
export default createPlugin({
  id: 'cicd-statistics',
  routes: convertLegacyRouteRefs({
    entityContent: rootCatalogCicdStatsRouteRef,
  }),
  extensions: [
    entityCicdChartsContent,
  ],
})
