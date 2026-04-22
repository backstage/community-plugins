/*
 * Copyright 2026 The Backstage Authors
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
  ApiBlueprint,
  configApiRef,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { argoCDApiRef, argoCDInstanceApiRef } from '../api';
import { ArgoCDApiClient } from '../api/ArgoCDApiClient';
import { ArgoCDInstanceApiClient } from '../api/ArgoCDInstanceApiClient';
import { getArgocdInstances } from '../hooks/useArgocdConfig';

/**
 * @alpha
 */
export const argocdApi = ApiBlueprint.make({
  name: 'argocd-api',
  params: defineParams =>
    defineParams({
      api: argoCDApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, fetchApi, configApi }) =>
        new ArgoCDApiClient({
          discoveryApi,
          fetchApi,
          useNamespacedApps: Boolean(
            configApi.getOptionalBoolean('argocd.namespacedApps'),
          ),
        }),
    }),
});

/**
 * @alpha
 */
export const argocdInstanceApi = ApiBlueprint.make({
  name: 'argocd-instance-api',
  params: defineParams =>
    defineParams({
      api: argoCDInstanceApiRef,
      deps: {
        configApi: configApiRef,
        argoCDApi: argoCDApiRef,
      },
      factory: ({ configApi, argoCDApi }) =>
        new ArgoCDInstanceApiClient({
          argoCDApi,
          instances: getArgocdInstances(configApi),
        }),
    }),
});
