import {
  ApiBlueprint,
  configApiRef,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';

import {
  NexusRepositoryManagerApiRef,
  NexusRepositoryManagerApiClient,
} from '../api';

/**
 * @alpha
 */
export const nexusRepositoryManagerApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: NexusRepositoryManagerApiRef,
      deps: {
        configApi: configApiRef,
        identityApi: identityApiRef,
        discoveryApi: discoveryApiRef,
      },
      factory: ({ configApi, identityApi, discoveryApi }) =>
        new NexusRepositoryManagerApiClient({
          configApi,
          identityApi,
          discoveryApi,
        }),
    }),
});
