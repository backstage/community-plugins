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
export const entitySentryContent = EntityContentBlueprint.make({
  name: 'sentry-issues',
  params: {
    defaultPath: '/sentry',
    defaultTitle: 'Sentry',
    filter: 'kind:component',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('../components/Router').then(m => compatWrapper(<m.Router />)),
  },
});
