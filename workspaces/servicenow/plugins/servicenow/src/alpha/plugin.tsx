/*
 * Copyright 2025 The Backstage Authors
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
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import {
  serviceNowApiRef,
  ServiceNowBackendClient,
} from '../api/ServiceNowBackendClient';

import { isServicenowAvailable } from '@backstage-community/plugin-servicenow-common';

/** @alpha */
export const servicenowApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: serviceNowApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, fetchApi, identityApi }) =>
        new ServiceNowBackendClient(discoveryApi, fetchApi, identityApi),
    }),
});

/**
 * Servicenow entity content that shows an incident table with a
 * filter similar to the catalog table
 * @alpha
 */
export const entityServicenowContent = EntityContentBlueprint.make({
  name: 'EntityServicenowContent',
  params: {
    path: 'servicenow',
    title: 'ServiceNow',
    filter: isServicenowAvailable,
    loader: () =>
      import('../components/Servicenow').then(m => (
        <m.EntityServicenowContent />
      )),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'servicenow',
  extensions: [servicenowApi, entityServicenowContent],
});
