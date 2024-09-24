/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
