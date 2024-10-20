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
  createApiFactory,
  createFrontendModule,
  gitlabAuthApiRef,
} from '@backstage/frontend-plugin-api';
import { CicdStatisticsApiGitlab } from './api';

/**
 * @alpha
 */
export const cicdStatisticsGitlabExtension = ApiBlueprint.make({
  name: 'cicd-statistics-gitlab-api',
  params: {
    factory: createApiFactory({
      api: cicdStatisticsApiRef,
      deps: {
        gitlabAuthApi: gitlabAuthApiRef,
      },
      factory: ({ gitlabAuthApi }) => {
        return new CicdStatisticsApiGitlab(gitlabAuthApi);
      },
    }),
  },
});

/**
 * @alpha
 */
const cicdStatisticsExtensionOverrides = createFrontendModule({
  pluginId: 'cicd-statistics',
  extensions: [cicdStatisticsGitlabExtension],
});

export default cicdStatisticsExtensionOverrides;
