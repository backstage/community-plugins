/*
 * Copyright 2020 The Backstage Authors
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
import { KafkaBackendClient } from './api/KafkaBackendClient';
import { kafkaApiRef, kafkaDashboardApiRef } from './api/types';
import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
  discoveryApiRef,
  identityApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import { KafkaDashboardClient } from './api/KafkaDashboardClient';

/** @public */
export const rootCatalogKafkaRouteRef = createRouteRef({
  id: 'kafka',
});

/** @public */
export const kafkaPlugin = createPlugin({
  id: 'kafka',
  apis: [
    createApiFactory({
      api: kafkaApiRef,
      deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef },
      factory: ({ discoveryApi, identityApi }) =>
        new KafkaBackendClient({ discoveryApi, identityApi }),
    }),
    createApiFactory({
      api: kafkaDashboardApiRef,
      deps: { configApi: configApiRef },
      factory: ({ configApi }) => new KafkaDashboardClient({ configApi }),
    }),
  ],
  routes: {
    entityContent: rootCatalogKafkaRouteRef,
  },
});

/** @public */
export const EntityKafkaContent = kafkaPlugin.provide(
  createRoutableExtension({
    name: 'EntityKafkaContent',
    component: () => import('./Router').then(m => m.Router),
    mountPoint: rootCatalogKafkaRouteRef,
  }),
);
