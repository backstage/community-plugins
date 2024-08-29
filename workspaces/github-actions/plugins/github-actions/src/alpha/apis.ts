import {
  configApiRef,
  ApiBlueprint,
  createApiFactory,
} from '@backstage/frontend-plugin-api';
import { scmAuthApiRef } from '@backstage/integration-react';
import { githubActionsApiRef, GithubActionsClient } from '../api';

/**
 * @alpha
 */
export const githubActionsApi = ApiBlueprint.make({
  params: {
    factory: createApiFactory({
      api: githubActionsApiRef,
      deps: { configApi: configApiRef, scmAuthApi: scmAuthApiRef },
      factory: ({ configApi, scmAuthApi }) =>
        new GithubActionsClient({ configApi, scmAuthApi }),
    }),
  },
});
