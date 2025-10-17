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
  configApiRef,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/frontend-plugin-api';
import { kafkaApiRef, kafkaDashboardApiRef } from '../api/types';
import { KafkaBackendClient } from '../api/KafkaBackendClient';
import { KafkaDashboardClient } from '../api/KafkaDashboardClient';

/**
 * @alpha
 */
export const kafkaApi = ApiBlueprint.make({
  params: definedParams =>
    definedParams({
      api: kafkaApiRef,
      deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef },
      factory: ({ discoveryApi, identityApi }) =>
        new KafkaBackendClient({ discoveryApi, identityApi }),
    }),
});

/**
 * @alpha
 */
export const kafkaDashboardApi = ApiBlueprint.make({
  name: 'dashboard',
  params: definedParams =>
    definedParams({
      api: kafkaDashboardApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => new KafkaDashboardClient({ configApi }),
    }),
});
