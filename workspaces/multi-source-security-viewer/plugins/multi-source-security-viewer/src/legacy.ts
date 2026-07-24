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
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
  gitlabAuthApiRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { MssvJenkinsClient, mssvJenkinsApiRef } from './api/jenkins';
import { JenkinsClient } from '@backstage-community/plugin-jenkins';
import { MssvGithubActionsClient, mssvGithubActionsApiRef } from './api/github';
import { GithubActionsClient } from '@backstage-community/plugin-github-actions';
import { scmAuthApiRef } from '@backstage/integration-react';
import {
  CustomGitlabCiClient,
  MssvGitlabCIClient,
  mssvGitlabCIApiRef,
} from './api/gitlab';
import { AzureDevOpsClient } from '@backstage-community/plugin-azure-devops';
import { MssvAzureDevopsClient, mssvAzureDevopsApiRef } from './api/azure';

/**
 * Multi Source Security Viewer plugin (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const multiSourceSecurityViewerPlugin = createPlugin({
  id: 'multi-source-security-viewer',
  apis: [
    createApiFactory({
      api: mssvJenkinsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) => {
        return new MssvJenkinsClient({
          jenkinsApi: new JenkinsClient({
            discoveryApi,
            fetchApi,
          }),
        });
      },
    }),
    createApiFactory({
      api: mssvGithubActionsApiRef,
      deps: {
        configApi: configApiRef,
        scmAuthApi: scmAuthApiRef,
      },
      factory: ({ configApi, scmAuthApi }) => {
        return new MssvGithubActionsClient({
          githubActionsApi: new GithubActionsClient({ configApi, scmAuthApi }),
        });
      },
    }),
    createApiFactory({
      api: mssvGitlabCIApiRef,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        gitlabAuthApi: gitlabAuthApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ configApi, identityApi, discoveryApi, gitlabAuthApi }) => {
        return new MssvGitlabCIClient({
          gitlabCiApi: new CustomGitlabCiClient({
            discoveryApi,
            gitlabAuthApi,
            identityApi,
            codeOwnersPath: configApi.getOptionalString(
              'gitlab.defaultCodeOwnersPath',
            ),
            readmePath: configApi.getOptionalString('gitlab.defaultReadmePath'),
            useOAuth: configApi.getOptionalBoolean('gitlab.useOAuth'),
          }),
        });
      },
    }),
    createApiFactory({
      api: mssvAzureDevopsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) => {
        return new MssvAzureDevopsClient({
          azureDevopsApi: new AzureDevOpsClient({
            discoveryApi,
            fetchApi,
          }),
        });
      },
    }),
  ],
  routes: {
    entityContent: rootRouteRef,
  },
});

export {
  isMultiCIAvailable,
  isMultiCIAvailableAndEnabled,
} from './lib/isMultiCIAvailable';

/**
 * Entity content for multi-CI pipelines (legacy frontend system)
 *
 * @public
 * @remarks Prefer the default export from the package root for the new frontend system.
 */
export const EntityMultiCIPipelinesContent =
  multiSourceSecurityViewerPlugin.provide(
    createRoutableExtension({
      name: 'EntityMultiCIPipelinesContent',
      component: () => import('./components/Router').then(m => m.Router),
      mountPoint: rootRouteRef,
    }),
  );
