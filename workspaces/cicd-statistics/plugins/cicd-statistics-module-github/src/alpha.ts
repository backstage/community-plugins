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
import { cicdStatisticsApiRef } from '@backstage-community/plugin-cicd-statistics';
import {
  ApiBlueprint,
  configApiRef,
  createFrontendModule,
  githubAuthApiRef,
} from '@backstage/frontend-plugin-api';
import { CicdStatisticsApiGithub } from './api';

/**
 * @alpha
 */
export const cicdStatisticsGithubExtension = ApiBlueprint.make({
  name: 'cicd-statistics-github-api',
  params: defineParams =>
    defineParams({
      api: cicdStatisticsApiRef,
      deps: {
        githubAuthApi: githubAuthApiRef,
        configApi: configApiRef,
      },
      factory: ({ githubAuthApi, configApi }) => {
        return new CicdStatisticsApiGithub(githubAuthApi, configApi);
      },
    }),
});

/**
 * @alpha
 */
const cicdStatisticsExtensionOverrides = createFrontendModule({
  pluginId: 'cicd-statistics',
  extensions: [cicdStatisticsGithubExtension],
});

export default cicdStatisticsExtensionOverrides;
