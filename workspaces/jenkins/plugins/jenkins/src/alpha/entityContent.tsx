import React from 'react';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { rootRouteRef } from '../plugin';

/**
 * @alpha
 */
export const entityJenkinsProjects = EntityContentBlueprint.make({
  name: 'entity',
  params: {
    defaultPath: 'jenkins',
    defaultTitle: 'Jenkins',
    filter: 'kind:component',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('../components/Router').then(m => compatWrapper(<m.Router />)),
  },
});
