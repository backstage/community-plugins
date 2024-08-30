import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { reportPortalApiRef, ReportPortalClient } from './api';
import { entityRootRouteRef, rootRouteRef } from './routes';

/** @public */
export const reportPortalPlugin = createPlugin({
  id: 'report-portal',
  routes: {
    root: rootRouteRef,
    entityRoot: entityRootRouteRef,
  },
  apis: [
    createApiFactory({
      api: reportPortalApiRef,
      deps: {
        discovery: discoveryApiRef,
        fetch: fetchApiRef,
      },
      factory: ({ discovery, fetch }) =>
        new ReportPortalClient(discovery, fetch),
    }),
  ],
});

/** @public */
export const ReportPortalOverviewCard = reportPortalPlugin.provide(
  createComponentExtension({
    name: 'ReportPortalOverviewCard',
    component: {
      lazy: () =>
        import('./components/ReportPortalOverviewCard').then(
          m => m.ReportPortalOverviewCard,
        ),
    },
  }),
);

/** @public */
export const ReportPortalGlobalPage = reportPortalPlugin.provide(
  createRoutableExtension({
    name: 'ReportPortalGlobalPage',
    mountPoint: rootRouteRef,
    component: () => import('./components/Router').then(m => m.Router),
  }),
);
