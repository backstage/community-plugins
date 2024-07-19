import {
  configApiRef,
  createApiExtension,
  createApiFactory,
} from '@backstage/frontend-plugin-api';
import { scmAuthApiRef } from '@backstage/integration-react';
import { githubActionsApiRef, GithubActionsClient } from '../api';

export const githubActionsApi = createApiExtension({
  factory: createApiFactory({
    api: githubActionsApiRef,
    deps: { configApi: configApiRef, scmAuthApi: scmAuthApiRef },
    factory: ({ configApi, scmAuthApi }) =>
      new GithubActionsClient({ configApi, scmAuthApi }),
  }),
});
