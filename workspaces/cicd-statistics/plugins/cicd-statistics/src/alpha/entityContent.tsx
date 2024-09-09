import React from 'react';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { rootCatalogCicdStatsRouteRef } from '../plugin';

/**
 * @alpha
 */
export const entityCicdChartsContent = EntityContentBlueprint.make({
  name: 'entity',
  params: {
    defaultPath: 'cicd-statistics',
    defaultTitle: 'CI/CD Statistics',
    filter: 'kind:component',
    routeRef: convertLegacyRouteRef(rootCatalogCicdStatsRouteRef),
    loader: async () => {
      const { EntityPageCicdCharts } = await import('../entity-page');
      return <EntityPageCicdCharts />;
    },
  },
});
