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
import '@patternfly/react-core/dist/styles/base-no-reset.css';
import '@patternfly/patternfly/patternfly.css';

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
import {
  JenkinsClient,
  isJenkinsAvailable,
} from '@backstage-community/plugin-jenkins';
import { MssvGithubActionsClient, mssvGithubActionsApiRef } from './api/github';
import {
  GithubActionsClient,
  isGithubActionsAvailable,
} from '@backstage-community/plugin-github-actions';
import { scmAuthApiRef } from '@backstage/integration-react';
import {
  CustomGitlabCiClient,
  MssvGitlabCIClient,
  mssvGitlabCIApiRef,
} from './api/gitlab';
import { isGitlabAvailable } from '@immobiliarelabs/backstage-plugin-gitlab';
import { Entity } from '@backstage/catalog-model';

/** @public */
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
  ],
  routes: {
    entityContent: rootRouteRef,
  },
});

/** @public */
export const isMultiCIAvailable = (entity: Entity): boolean =>
  isJenkinsAvailable(entity) ||
  isGitlabAvailable(entity) ||
  isGithubActionsAvailable(entity);

/** @public */
export const EntityMultiCIPipelinesContent =
  multiSourceSecurityViewerPlugin.provide(
    createRoutableExtension({
      name: 'EntityMultiCIPipelinesContent',
      component: () => import('./components/Router').then(m => m.Router),
      mountPoint: rootRouteRef,
    }),
  );
