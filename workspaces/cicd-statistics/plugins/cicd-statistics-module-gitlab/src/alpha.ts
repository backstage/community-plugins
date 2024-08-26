import { cicdStatisticsApiRef } from '@backstage-community/plugin-cicd-statistics';
import {
  createApiExtension,
  createApiFactory,
  createExtensionOverrides,
  gitlabAuthApiRef,
} from '@backstage/frontend-plugin-api';
import { CicdStatisticsApiGitlab } from './api';

export const cicdStatisticsGitlabExtension = createApiExtension({
  factory: createApiFactory({
    api: cicdStatisticsApiRef,
    deps: {
      gitlabAuthApi: gitlabAuthApiRef,
    },
    factory: ({ gitlabAuthApi }) => {
      return new CicdStatisticsApiGitlab(gitlabAuthApi);
    },
  }),
});

const cicdStatisticsExtensionOverrides = createExtensionOverrides({
  extensions: [cicdStatisticsGitlabExtension],
});

export default cicdStatisticsExtensionOverrides;
