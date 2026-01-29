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
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { isNpmAvailable } from '@backstage-community/plugin-npm-common';

import { NpmBackendApiRef, NpmBackendClient } from './api';

export { npmTranslationRef, npmTranslations } from './translations';

export { isNpmAvailable } from '@backstage-community/plugin-npm-common';

/**
 * An API to communicate via the proxy to an ACR container registry.
 *
 * @alpha
 */
export const npmBackendApi = ApiBlueprint.make({
  name: 'npmBackendApi',
  params: defineParams =>
    defineParams({
      api: NpmBackendApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new NpmBackendClient({
          discoveryApi,
          fetchApi,
        }),
    }),
});

/**
 * Card for the catalog (entity page) that shows the npm
 * name, description, keywords, license, some links and
 * the latest version if available.
 *
 * @alpha
 */
export const entityNpmInfoCard: any = EntityCardBlueprint.make({
  name: 'EntityNpmInfoCard',
  params: {
    filter: isNpmAvailable,
    loader: () =>
      import('./components/EntityNpmInfoCard').then(m => (
        <m.EntityNpmInfoCard />
      )),
  },
});

/**
 * Card for the catalog (entity page) that shows the latest tags
 * with their version number and the release date.
 *
 * @alpha
 */
export const entityNpmReleaseOverviewCard: any = EntityCardBlueprint.make({
  name: 'EntityNpmReleaseOverviewCard',
  params: {
    filter: isNpmAvailable,
    loader: () =>
      import('./components/EntityNpmReleaseOverviewCard').then(m => (
        <m.EntityNpmReleaseOverviewCard />
      )),
  },
});

/**
 * Page content for the catalog (entity page) that shows two tables.
 * One for the latest tags and versions of a npm package.
 * And another one for the complete version history.
 *
 * @alpha
 */
export const entityNpmReleaseTableCard: any = EntityContentBlueprint.make({
  name: 'EntityNpmReleaseTableCard',
  params: {
    path: 'npm-releases',
    title: 'Npm Releases',
    filter: isNpmAvailable,
    loader: () =>
      import('./components/EntityNpmReleaseTableCard').then(m => (
        <m.EntityNpmReleaseTableCard />
      )),
  },
});

/**
 * Backstage frontend plugin.
 *
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'npm',
  extensions: [
    npmBackendApi,
    entityNpmReleaseTableCard,
    entityNpmInfoCard,
    entityNpmReleaseOverviewCard,
  ],
});
