import {
  configApiRef,
  ApiBlueprint,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { sentryApiRef, ProductionSentryApi } from '../api';

/**
 * @alpha
 */
export const sentryApi = ApiBlueprint.make({
  params: {
    factory: createApiFactory({
      api: sentryApiRef,
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ configApi, discoveryApi, identityApi }) =>
        new ProductionSentryApi(
          discoveryApi,
          configApi.getString('sentry.organization'),
          identityApi,
        ),
    }),
  },
});
