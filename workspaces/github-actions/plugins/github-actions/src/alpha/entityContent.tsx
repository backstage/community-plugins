import React from 'react';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import { createEntityContentExtension } from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from '../routes';

/**
 * @alpha
 */
export const entityGithubActionsContent = createEntityContentExtension({
  defaultPath: 'github-actions',
  defaultTitle: 'GitHub Actions',
  name: 'entity',
  routeRef: convertLegacyRouteRef(rootRouteRef),
  loader: () =>
    import('../components/Router').then(m => <m.Router view="table" />),
});
