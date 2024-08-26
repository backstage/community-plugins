import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { FeedbackAPI, feedbackApiRef } from './api';
import { entityRootRouteRef, rootRouteRef, viewDocsRouteRef } from './routes';

export const feedbackPlugin = createPlugin({
  id: 'feedback',
  routes: {
    root: rootRouteRef,
    entityRoot: entityRootRouteRef,
  },
  externalRoutes: {
    viewDocs: viewDocsRouteRef,
  },
  apis: [
    createApiFactory({
      api: feedbackApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        identityApi: identityApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, configApi, identityApi, fetchApi }) => {
        return new FeedbackAPI({
          discoveryApi,
          configApi,
          identityApi,
          fetchApi,
        });
      },
    }),
  ],
});

export const GlobalFeedbackPage = feedbackPlugin.provide(
  createRoutableExtension({
    name: 'GlobalFeedbackPage',
    component: () =>
      import('./components/GlobalFeedbackPage').then(m => m.GlobalFeedbackPage),
    mountPoint: rootRouteRef,
  }),
);

export const EntityFeedbackPage = feedbackPlugin.provide(
  createRoutableExtension({
    name: 'EntityFeedbackPage',
    component: () =>
      import('./components/EntityFeedbackPage').then(m => m.EntityFeedbackPage),
    mountPoint: entityRootRouteRef,
  }),
);

export const OpcFeedbackComponent = feedbackPlugin.provide(
  createComponentExtension({
    name: 'OpcFeedbackComponent',
    component: {
      lazy: () =>
        import('./components/OpcFeedbackComponent').then(
          m => m.OpcFeedbackComponent,
        ),
    },
  }),
);
