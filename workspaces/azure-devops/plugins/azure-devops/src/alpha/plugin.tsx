/*
 * Copyright 2023 The Backstage Authors
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
  createApiFactory,
  PageBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { azureDevOpsApiRef, AzureDevOpsClient } from '../api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { azurePullRequestDashboardRouteRef } from '../routes';
import { isAzureDevOpsAvailable, isAzurePipelinesAvailable } from '../plugin';

/** @alpha */
export const azureDevOpsApi = ApiBlueprint.make({
  params: {
    factory: createApiFactory({
      api: azureDevOpsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new AzureDevOpsClient({ discoveryApi, fetchApi }),
    }),
  },
});

/** @alpha */
export const azureDevOpsPullRequestPage = PageBlueprint.make({
  params: {
    defaultPath: '/azure-pull-requests',
    routeRef: convertLegacyRouteRef(azurePullRequestDashboardRouteRef),
    loader: () =>
      import('../components/PullRequestsPage').then(m =>
        compatWrapper(<m.PullRequestsPage />),
      ),
  },
});

/** @alpha */
export const azureDevOpsPipelinesEntityContent = EntityContentBlueprint.make({
  name: 'pipelines',
  params: {
    defaultPath: '/pipelines',
    defaultTitle: 'Pipelines',
    filter: isAzurePipelinesAvailable,
    loader: () =>
      import('../components/EntityPageAzurePipelines').then(m =>
        compatWrapper(<m.EntityPageAzurePipelines />),
      ),
  },
});

/** @alpha */
export const azureDevOpsGitTagsEntityContent = EntityContentBlueprint.make({
  name: 'git-tags',
  params: {
    defaultPath: '/git-tags',
    defaultTitle: 'Git Tags',
    filter: isAzureDevOpsAvailable,
    loader: () =>
      import('../components/EntityPageAzureGitTags').then(m =>
        compatWrapper(<m.EntityPageAzureGitTags />),
      ),
  },
});

/** @alpha */
export const azureDevOpsPullRequestsEntityContent = EntityContentBlueprint.make(
  {
    name: 'pull-requests',
    params: {
      defaultPath: '/pull-requests',
      defaultTitle: 'Pull Requests',
      filter: isAzureDevOpsAvailable,
      loader: () =>
        import('../components/EntityPageAzurePullRequests').then(m =>
          compatWrapper(<m.EntityPageAzurePullRequests />),
        ),
    },
  },
);

/** @alpha */
export const azureDevOpsReadmeEntityCard = EntityCardBlueprint.make({
  name: 'readme',
  params: {
    filter: isAzureDevOpsAvailable,
    loader: async () =>
      import('../components/ReadmeCard').then(m =>
        compatWrapper(<m.ReadmeCard />),
      ),
  },
});

/** @alpha */
export default createFrontendPlugin({
  id: 'azure-devops',
  extensions: [
    azureDevOpsApi,
    azureDevOpsReadmeEntityCard,
    azureDevOpsPipelinesEntityContent,
    azureDevOpsGitTagsEntityContent,
    azureDevOpsPullRequestsEntityContent,
    azureDevOpsPullRequestPage,
  ],
});
