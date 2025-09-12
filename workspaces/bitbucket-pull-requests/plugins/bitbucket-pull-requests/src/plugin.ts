/*
 * Copyright 2025 The Backstage Authors
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
  createPlugin,
  createApiFactory,
  discoveryApiRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { bitbucketApiRef, BitbucketApi } from './api/BitbucketApi';

/**
 * Plugin for Bitbucket pull requests integration
 * @public
 */
export const bitbucketPlugin = createPlugin({
  id: 'bitbucket-pullrequests',
  apis: [
    createApiFactory({
      api: bitbucketApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new BitbucketApi({ discoveryApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * Component for displaying Bitbucket pull requests in the entity page
 * @public
 */
export const EntityBitbucketPullRequestsContent = bitbucketPlugin.provide(
  createRoutableExtension({
    name: 'EntityBitbucketPullRequestsContent',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);
