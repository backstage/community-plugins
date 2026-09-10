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
  discoveryApiRef,
  identityApiRef,
  type FrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

import { JfrogArtifactoryApiClient, jfrogArtifactoryApiRef } from './api';
import { isJfrogArtifactoryAvailable } from './isJfrogArtifactoryAvailable';
import { rootRouteRef } from './routes';

const jfrogArtifactoryApi = ApiBlueprint.make({
  name: 'jfrog-artifactory',
  params: defineParams =>
    defineParams({
      api: jfrogArtifactoryApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, configApi, identityApi }) =>
        new JfrogArtifactoryApiClient({ discoveryApi, configApi, identityApi }),
    }),
});

const jfrogArtifactoryEntityContent = EntityContentBlueprint.make({
  name: 'jfrog-artifactory',
  params: {
    path: '/jfrog-artifactory',
    title: 'Jfrog Artifactory',
    routeRef: rootRouteRef,
    filter: isJfrogArtifactoryAvailable,
    loader: () =>
      import('./components/JfrogArtifactoryDashboardPage').then(m => (
        <m.JfrogArtifactoryDashboardPage />
      )),
  },
});

/**
 * JFrog Artifactory plugin for the New Frontend System.
 *
 * @public
 */
const jfrogArtifactoryPlugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'jfrog-artifactory',
  info: { packageJson: () => import('../package.json') },
  extensions: [jfrogArtifactoryApi, jfrogArtifactoryEntityContent],
  routes: {
    root: rootRouteRef,
  },
});

export default jfrogArtifactoryPlugin;
