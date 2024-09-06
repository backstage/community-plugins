import React from 'react';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from '../routes';

/**
 * @alpha
 */
export const entityGithubActionsContent = EntityContentBlueprint.make({
  name: 'entity',
  params: {
    defaultPath: 'github-actions',
    defaultTitle: 'GitHub Actions',
    filter: 'kind:component',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('../components/Router').then(m => <m.Router view="table" />),
  },
});
