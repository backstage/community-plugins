import { cicdStatisticsApiRef } from '@backstage-community/plugin-cicd-statistics';
import {
  ApiBlueprint,
  createApiFactory,
  createExtensionOverrides,
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
const cicdStatisticsExtensionOverrides = createExtensionOverrides({
  extensions: [cicdStatisticsGitlabExtension],
});

export default cicdStatisticsExtensionOverrides;
