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
  fetchApiRef,
  FrontendPlugin,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { gitlabAuthApiRef } from '@backstage/core-plugin-api';
import { scmAuthApiRef } from '@backstage/integration-react';

import { MssvJenkinsClient, mssvJenkinsApiRef } from './api/jenkins';
import { JenkinsClient } from '@backstage-community/plugin-jenkins';
import { MssvGithubActionsClient, mssvGithubActionsApiRef } from './api/github';
import { GithubActionsClient } from '@backstage-community/plugin-github-actions';
import {
  CustomGitlabCiClient,
  MssvGitlabCIClient,
  mssvGitlabCIApiRef,
} from './api/gitlab';
import { AzureDevOpsClient } from '@backstage-community/plugin-azure-devops';
import { MssvAzureDevopsClient, mssvAzureDevopsApiRef } from './api/azure';
import { isMultiCIAvailable } from './lib/isMultiCIAvailable';
import { rootRouteRef } from './routes';

const mssvJenkinsApi = ApiBlueprint.make({
  name: 'mssv-jenkins',
  params: defineParams =>
    defineParams({
      api: mssvJenkinsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new MssvJenkinsClient({
          jenkinsApi: new JenkinsClient({
            discoveryApi,
            fetchApi,
          }),
        }),
    }),
});

const mssvGithubActionsApi = ApiBlueprint.make({
  name: 'mssv-github-actions',
  params: defineParams =>
    defineParams({
      api: mssvGithubActionsApiRef,
      deps: {
        configApi: configApiRef,
        scmAuthApi: scmAuthApiRef,
      },
      factory: ({ configApi, scmAuthApi }) =>
        new MssvGithubActionsClient({
          githubActionsApi: new GithubActionsClient({ configApi, scmAuthApi }),
        }),
    }),
});

const mssvGitlabCIApi = ApiBlueprint.make({
  name: 'mssv-gitlab-ci',
  params: defineParams =>
    defineParams({
      api: mssvGitlabCIApiRef,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        gitlabAuthApi: gitlabAuthApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ configApi, identityApi, discoveryApi, gitlabAuthApi }) =>
        new MssvGitlabCIClient({
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
        }),
    }),
});

const mssvAzureDevopsApi = ApiBlueprint.make({
  name: 'mssv-azure-devops',
  params: defineParams =>
    defineParams({
      api: mssvAzureDevopsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new MssvAzureDevopsClient({
          azureDevopsApi: new AzureDevOpsClient({
            discoveryApi,
            fetchApi,
          }),
        }),
    }),
});

const mssvEntityContent = EntityContentBlueprint.make({
  name: 'multi-source-security-viewer',
  params: {
    path: '/multi-source-security-viewer',
    title: 'CI/CD Security',
    routeRef: rootRouteRef,
    filter: isMultiCIAvailable,
    loader: async () => import('./components/Router').then(m => <m.Router />),
  },
});

/**
 * Multi Source Security Viewer plugin
 *
 * @public
 */
const plugin: FrontendPlugin = createFrontendPlugin({
  pluginId: 'multi-source-security-viewer',
  extensions: [
    mssvJenkinsApi,
    mssvGithubActionsApi,
    mssvGitlabCIApi,
    mssvAzureDevopsApi,
    mssvEntityContent,
  ],
  routes: {
    entityContent: rootRouteRef,
  },
});

export default plugin;
