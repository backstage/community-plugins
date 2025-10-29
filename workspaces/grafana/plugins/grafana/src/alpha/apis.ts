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
import {
  configApiRef,
  ApiBlueprint,
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
  params: defineParams =>
    defineParams({
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
});
