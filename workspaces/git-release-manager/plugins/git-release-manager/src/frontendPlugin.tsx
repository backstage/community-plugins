/*
 * Copyright 2026 The Backstage Authors
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
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
  githubAuthApiRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import { GitReleaseClient } from './api/GitReleaseClient';
import { gitReleaseManagerApiRef } from './api/serviceApiRef';
import { rootRouteRef } from './routes';

export const gitReleaseManagerApi = ApiBlueprint.make({
  name: 'service',
  params: defineParams =>
    defineParams({
      api: gitReleaseManagerApiRef,
      deps: {
        configApi: configApiRef,
        githubAuthApi: githubAuthApiRef,
      },
      factory: ({ configApi, githubAuthApi }) =>
        new GitReleaseClient({ configApi, githubAuthApi }),
    }),
});

export const gitReleaseManagerPage = PageBlueprint.make({
  params: {
    path: '/git-release-manager',
    title: 'Git Release Manager',
    icon: <NewReleasesIcon />,
    noHeader: true,
    routeRef: rootRouteRef,
    loader: () =>
      import('./GitReleaseManager').then(m => <m.GitReleaseManager />),
  },
});

/** @public */
const gitReleaseManagerFrontendPlugin = createFrontendPlugin({
  pluginId: 'git-release-manager',
  info: {
    packageJson: () => import('../package.json'),
  },
  routes: {
    root: rootRouteRef,
  },
  extensions: [gitReleaseManagerApi, gitReleaseManagerPage],
});

export default gitReleaseManagerFrontendPlugin;
