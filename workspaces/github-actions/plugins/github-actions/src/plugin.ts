/*
 * Copyright 2020 The Backstage Authors
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

import { githubActionsApiRef, GithubActionsClient } from './api';
import { rootRouteRef } from './routes';
import {
  configApiRef,
  createPlugin,
  createApiFactory,
  createRoutableExtension,
  createComponentExtension,
} from '@backstage/core-plugin-api';
import { scmAuthApiRef } from '@backstage/integration-react';

/** @public */
export const githubActionsPlugin = createPlugin({
  id: 'github-actions',
  apis: [
    createApiFactory({
      api: githubActionsApiRef,
      deps: { configApi: configApiRef, scmAuthApi: scmAuthApiRef },
      factory: ({ configApi, scmAuthApi }) =>
        new GithubActionsClient({ configApi, scmAuthApi }),
    }),
  ],
  routes: {
    entityContent: rootRouteRef,
  },
});

/** @public */
export const EntityGithubActionsContent = githubActionsPlugin.provide(
  createRoutableExtension({
    name: 'EntityGithubActionsContent',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

/** @public */
export const EntityLatestGithubActionRunCard = githubActionsPlugin.provide(
  createComponentExtension({
    name: 'EntityLatestGithubActionRunCard',
    component: {
      lazy: () =>
        import('./components/Cards').then(m => m.LatestWorkflowRunCard),
    },
  }),
);

/** @public */
export const EntityLatestGithubActionsForBranchCard =
  githubActionsPlugin.provide(
    createComponentExtension({
      name: 'EntityLatestGithubActionsForBranchCard',
      component: {
        lazy: () =>
          import('./components/Cards').then(
            m => m.LatestWorkflowsForBranchCard,
          ),
      },
    }),
  );

/** @public */
export const EntityRecentGithubActionsRunsCard = githubActionsPlugin.provide(
  createComponentExtension({
    name: 'EntityRecentGithubActionsRunsCard',
    component: {
      lazy: () =>
        import('./components/Cards').then(m => m.RecentWorkflowRunsCard),
    },
  }),
);
