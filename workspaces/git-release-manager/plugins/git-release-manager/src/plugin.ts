/*
 * Copyright 2021 The Backstage Authors
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
  createPlugin,
  createApiFactory,
  githubAuthApiRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { GitReleaseClient } from './api/GitReleaseClient';
import { gitReleaseManagerApiRef } from './api/serviceApiRef';
import { rootRouteRef } from './routes';
import * as constants from './constants/constants';
import * as helpers from './helpers';
import * as components from './components';
import * as testHelpers from './test-helpers';

export { gitReleaseManagerApiRef, constants, helpers, components, testHelpers };

export const gitReleaseManagerPlugin = createPlugin({
  id: 'git-release-manager',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: gitReleaseManagerApiRef,
      deps: {
        configApi: configApiRef,
        githubAuthApi: githubAuthApiRef,
      },
      factory: ({ configApi, githubAuthApi }) => {
        return new GitReleaseClient({
          configApi,
          githubAuthApi,
        });
      },
    }),
  ],
});

export const GitReleaseManagerPage = gitReleaseManagerPlugin.provide(
  createRoutableExtension({
    name: 'GitReleaseManagerPage',
    component: () =>
      import('./GitReleaseManager').then(m => m.GitReleaseManager),
    mountPoint: rootRouteRef,
  }),
);
