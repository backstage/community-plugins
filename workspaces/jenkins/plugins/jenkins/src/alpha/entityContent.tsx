import React from 'react';
import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import { createEntityContentExtension } from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from '../plugin';

/**
 * @alpha
 */
export const entityJenkinsProjects = createEntityContentExtension({
  defaultPath: 'jenkins',
  defaultTitle: 'Jenkins',
  name: 'projects',
  routeRef: convertLegacyRouteRef(rootRouteRef),
  loader: () => import('../components/Router').then(m => <m.Router />),
});
