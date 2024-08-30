import { cicdStatisticsApiRef } from '@backstage-community/plugin-cicd-statistics';
import { CicdStatisticsApiGitlab } from '@backstage-community/plugin-cicd-statistics-module-gitlab';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  gitlabAuthApiRef,
} from '@backstage/core-plugin-api';
import {
  ScmAuth,
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: cicdStatisticsApiRef,
    deps: { gitlabAuthApi: gitlabAuthApiRef },
    factory: ({ gitlabAuthApi }) => new CicdStatisticsApiGitlab(gitlabAuthApi),
  }),
];
