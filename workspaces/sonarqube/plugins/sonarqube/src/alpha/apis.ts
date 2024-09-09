import { ApiBlueprint, createApiFactory } from '@backstage/frontend-plugin-api';
import { SonarQubeClient } from '../api';
import { sonarQubeApiRef } from '@backstage-community/plugin-sonarqube-react';
import { discoveryApiRef, identityApiRef } from '@backstage/core-plugin-api';

/**
 * @alpha
 */
export const sonarQubeApi = ApiBlueprint.make({
  params: {
    factory: createApiFactory({
      api: sonarQubeApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, identityApi }) =>
        new SonarQubeClient({
          discoveryApi,
          identityApi,
        }),
    }),
  },
});
