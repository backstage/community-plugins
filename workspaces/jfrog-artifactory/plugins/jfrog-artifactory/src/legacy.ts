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

/**
 * Legacy frontend system API surface for the JFrog Artifactory plugin.
 *
 * @packageDocumentation
 */
import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { JfrogArtifactoryApiClient, jfrogArtifactoryApiRef } from './api';
import { rootRouteRef } from './routes';

/**
 * JFrog Artifactory plugin (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const jfrogArtifactoryPlugin = createPlugin({
  id: 'jfrog-artifactory',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: jfrogArtifactoryApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, configApi, identityApi }) =>
        new JfrogArtifactoryApiClient({ discoveryApi, configApi, identityApi }),
    }),
  ],
});

/**
 * JFrog Artifactory page (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const JfrogArtifactoryPage = jfrogArtifactoryPlugin.provide(
  createComponentExtension({
    name: 'JfrogArtifactoryPage',
    component: {
      lazy: () =>
        import('./components/JfrogArtifactoryDashboardPage').then(
          m => m.JfrogArtifactoryDashboardPage,
        ),
    },
  }),
);

export { isJfrogArtifactoryAvailable } from './isJfrogArtifactoryAvailable';
