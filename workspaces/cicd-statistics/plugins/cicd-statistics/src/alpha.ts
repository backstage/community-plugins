import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createPlugin } from '@backstage/frontend-plugin-api';
import { rootCatalogCicdStatsRouteRef } from './plugin';

/**
 * @alpha
 */
export default createPlugin({
  id: 'cicd-statistics',
  routes: convertLegacyRouteRefs({
    entityContent: rootCatalogCicdStatsRouteRef,
  }),
  extensions: [],
})
