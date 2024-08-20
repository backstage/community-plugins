import React from 'react';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import { createEntityContentExtension } from '@backstage/plugin-catalog-react/alpha';
import { rootCatalogCicdStatsRouteRef } from '../plugin';

/**
 * @alpha
 */
export const entityCicdChartsContent = createEntityContentExtension({
  defaultPath: 'cicd-statistics',
  defaultTitle: 'CI/CD Statistics',
  name: 'entity',
  routeRef: convertLegacyRouteRef(rootCatalogCicdStatsRouteRef),
  loader: async () => {
    const { EntityPageCicdCharts } = await import('../entity-page');
    return <EntityPageCicdCharts />;
  }
});
