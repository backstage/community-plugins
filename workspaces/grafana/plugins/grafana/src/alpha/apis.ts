import {
  configApiRef,
  ApiBlueprint,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import {
  GrafanaApiClient,
  grafanaApiRef,
  UnifiedAlertingGrafanaApiClient,
} from '../api';

/**
 * @alpha
 */
export const grafanaApiExtension = ApiBlueprint.make({
  params: {
    factory: createApiFactory({
      api: grafanaApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        configApi: configApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, configApi, fetchApi }) => {
        const unifiedAlertingEnabled =
          configApi.getOptionalBoolean('grafana.unifiedAlerting') || false;

        if (!unifiedAlertingEnabled) {
          return new GrafanaApiClient({
            fetchApi,
            discoveryApi,
            domain: configApi.getString('grafana.domain'),
            proxyPath: configApi.getOptionalString('grafana.proxyPath'),
          });
        }

        return new UnifiedAlertingGrafanaApiClient({
          fetchApi,
          discoveryApi,
          domain: configApi.getString('grafana.domain'),
          proxyPath: configApi.getOptionalString('grafana.proxyPath'),
        });
      },
    }),
  },
});
